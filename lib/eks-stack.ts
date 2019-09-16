import { CfnOutput, Construct, Stack, StackProps } from "@aws-cdk/core";
import { AwsAuth, Cluster } from "@aws-cdk/aws-eks";
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  IVpc
} from "@aws-cdk/aws-ec2";
import {
  Effect,
  ManagedPolicy,
  PolicyStatement,
  Role,
  Policy
} from "@aws-cdk/aws-iam";
import { Context } from "./context";

interface EksStackProps extends StackProps {
  vpc: IVpc;
}

export class EksStack extends Stack {
  public readonly cluster: Cluster;

  constructor(scope: Construct, id: string, props: EksStackProps) {
    super(scope, id, props);
    const stage: string = this.node.tryGetContext("stage");
    const params: Context = this.node.tryGetContext(stage);

    this.cluster = new Cluster(this, "Eks", {
      vpc: props.vpc,
      version: "1.13",
      defaultCapacity: 0
    });

    // default worker nodes setting
    const asg = this.cluster.addCapacity("DefaultCapacity", {
      desiredCapacity: 3,
      instanceType: InstanceType.of(InstanceClass.M5, InstanceSize.LARGE),
      mapRole: false
    });
    asg.addUserData(
      "cd /tmp\n" +
        "yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm\n" +
        "systemctl start amazon-ssm-agent"
    );
    const managedPolicyNames = [
      "service-role/AmazonEC2RoleforSSM",
      "ElasticLoadBalancingFullAccess",
      "AutoScalingFullAccess",
      "AdministratorAccess"
    ];

    const albIngressPolicies: PolicyStatement[] = [
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "acm:DescribeCertificate",
          "acm:ListCertificates",
          "acm:GetCertificate"
        ],
        resources: ["*"]
      }),
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "ec2:AuthorizeSecurityGroupIngress",
          "ec2:CreateSecurityGroup",
          "ec2:CreateTags",
          "ec2:DeleteTags",
          "ec2:DeleteSecurityGroup",
          "ec2:DescribeAccountAttributes",
          "ec2:DescribeAddresses",
          "ec2:DescribeInstances",
          "ec2:DescribeInstanceStatus",
          "ec2:DescribeInternetGateways",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DescribeSecurityGroups",
          "ec2:DescribeSubnets",
          "ec2:DescribeTags",
          "ec2:DescribeVpcs",
          "ec2:ModifyInstanceAttribute",
          "ec2:ModifyNetworkInterfaceAttribute",
          "ec2:RevokeSecurityGroupIngress"
        ],
        resources: ["*"]
      }),
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "elasticloadbalancing:AddListenerCertificates",
          "elasticloadbalancing:AddTags",
          "elasticloadbalancing:CreateListener",
          "elasticloadbalancing:CreateLoadBalancer",
          "elasticloadbalancing:CreateRule",
          "elasticloadbalancing:CreateTargetGroup",
          "elasticloadbalancing:DeleteListener",
          "elasticloadbalancing:DeleteLoadBalancer",
          "elasticloadbalancing:DeleteRule",
          "elasticloadbalancing:DeleteTargetGroup",
          "elasticloadbalancing:DeregisterTargets",
          "elasticloadbalancing:DescribeListenerCertificates",
          "elasticloadbalancing:DescribeListeners",
          "elasticloadbalancing:DescribeLoadBalancers",
          "elasticloadbalancing:DescribeLoadBalancerAttributes",
          "elasticloadbalancing:DescribeRules",
          "elasticloadbalancing:DescribeSSLPolicies",
          "elasticloadbalancing:DescribeTags",
          "elasticloadbalancing:DescribeTargetGroups",
          "elasticloadbalancing:DescribeTargetGroupAttributes",
          "elasticloadbalancing:DescribeTargetHealth",
          "elasticloadbalancing:ModifyListener",
          "elasticloadbalancing:ModifyLoadBalancerAttributes",
          "elasticloadbalancing:ModifyRule",
          "elasticloadbalancing:ModifyTargetGroup",
          "elasticloadbalancing:ModifyTargetGroupAttributes",
          "elasticloadbalancing:RegisterTargets",
          "elasticloadbalancing:RemoveListenerCertificates",
          "elasticloadbalancing:RemoveTags",
          "elasticloadbalancing:SetIpAddressType",
          "elasticloadbalancing:SetSecurityGroups",
          "elasticloadbalancing:SetSubnets",
          "elasticloadbalancing:SetWebACL"
        ],
        resources: ["*"]
      }),
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "iam:CreateServiceLinkedRole",
          "iam:GetServerCertificate",
          "iam:ListServerCertificates"
        ],
        resources: ["*"]
      }),
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["cognito-idp:DescribeUserPoolClient"],
        resources: ["*"]
      }),
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "waf-regional:GetWebACLForResource",
          "waf-regional:GetWebACL",
          "waf-regional:AssociateWebACL",
          "waf-regional:DisassociateWebACL"
        ],
        resources: ["*"]
      }),
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["tag:GetResources", "tag:TagResources"],
        resources: ["*"]
      }),
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["waf:GetWebACL"],
        resources: ["*"]
      })
    ];
    new Policy(this, "AlbIngressPolicy", {
      roles: [asg.role],
      statements: albIngressPolicies
    });

    for (let managedPolicyName of managedPolicyNames) {
      asg.role.addManagedPolicy(
        ManagedPolicy.fromAwsManagedPolicyName(managedPolicyName)
      );
    }

    // aws-auth settings
    const awsAuth = new AwsAuth(this, "AwsAuth", {
      cluster: this.cluster
    });
    awsAuth.addRoleMapping(asg.role, {
      groups: ["system:bootstrappers", "system:nodes"],
      username: "system:node:{{EC2PrivateDNSName}}"
    });
    const users = ["dai.kurosawa", "kato.ryo", "koji.hamada", "jogan.naoki"];
    for (let i = 0; i < users.length; i++) {
      awsAuth.addMastersRole(
        Role.fromRoleArn(
          this,
          `${users[i]}`,
          `arn:aws:iam::${this.account}:role/cm-${users[i]}`
        ),
        `${users[i]}`
      );
    }

    // Output
    new CfnOutput(this, "EksClusterName", {
      value: this.cluster.clusterName
    });
  }
}
