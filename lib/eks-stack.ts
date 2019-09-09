import { Construct, Stack, StackProps, CfnOutput } from "@aws-cdk/core";
import { Cluster, AwsAuth } from "@aws-cdk/aws-eks";
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  IVpc
} from "@aws-cdk/aws-ec2";
import { ManagedPolicy, Role } from "@aws-cdk/aws-iam";

interface EksStackProps extends StackProps {
  vpc: IVpc;
}

export class EksStack extends Stack {
  public readonly cluster: Cluster;

  constructor(scope: Construct, id: string, props: EksStackProps) {
    super(scope, id, props);
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
    // TODO: 権限最小化
    //{
    //   "Version": "2012-10-17",
    //   "Statement": [
    //     {
    //       "Effect": "Allow",
    //       "Action": [
    //         "acm:DescribeCertificate",
    //         "acm:ListCertificates",
    //         "acm:GetCertificate"
    //       ],
    //       "Resource": "*"
    //     },
    //     {
    //       "Effect": "Allow",
    //       "Action": [
    //         "ec2:AuthorizeSecurityGroupIngress",
    //         "ec2:CreateSecurityGroup",
    //         "ec2:CreateTags",
    //         "ec2:DeleteTags",
    //         "ec2:DeleteSecurityGroup",
    //         "ec2:DescribeAccountAttributes",
    //         "ec2:DescribeAddresses",
    //         "ec2:DescribeInstances",
    //         "ec2:DescribeInstanceStatus",
    //         "ec2:DescribeInternetGateways",
    //         "ec2:DescribeNetworkInterfaces",
    //         "ec2:DescribeSecurityGroups",
    //         "ec2:DescribeSubnets",
    //         "ec2:DescribeTags",
    //         "ec2:DescribeVpcs",
    //         "ec2:ModifyInstanceAttribute",
    //         "ec2:ModifyNetworkInterfaceAttribute",
    //         "ec2:RevokeSecurityGroupIngress"
    //       ],
    //       "Resource": "*"
    //     },
    //     {
    //       "Effect": "Allow",
    //       "Action": [
    //         "elasticloadbalancing:AddListenerCertificates",
    //         "elasticloadbalancing:AddTags",
    //         "elasticloadbalancing:CreateListener",
    //         "elasticloadbalancing:CreateLoadBalancer",
    //         "elasticloadbalancing:CreateRule",
    //         "elasticloadbalancing:CreateTargetGroup",
    //         "elasticloadbalancing:DeleteListener",
    //         "elasticloadbalancing:DeleteLoadBalancer",
    //         "elasticloadbalancing:DeleteRule",
    //         "elasticloadbalancing:DeleteTargetGroup",
    //         "elasticloadbalancing:DeregisterTargets",
    //         "elasticloadbalancing:DescribeListenerCertificates",
    //         "elasticloadbalancing:DescribeListeners",
    //         "elasticloadbalancing:DescribeLoadBalancers",
    //         "elasticloadbalancing:DescribeLoadBalancerAttributes",
    //         "elasticloadbalancing:DescribeRules",
    //         "elasticloadbalancing:DescribeSSLPolicies",
    //         "elasticloadbalancing:DescribeTags",
    //         "elasticloadbalancing:DescribeTargetGroups",
    //         "elasticloadbalancing:DescribeTargetGroupAttributes",
    //         "elasticloadbalancing:DescribeTargetHealth",
    //         "elasticloadbalancing:ModifyListener",
    //         "elasticloadbalancing:ModifyLoadBalancerAttributes",
    //         "elasticloadbalancing:ModifyRule",
    //         "elasticloadbalancing:ModifyTargetGroup",
    //         "elasticloadbalancing:ModifyTargetGroupAttributes",
    //         "elasticloadbalancing:RegisterTargets",
    //         "elasticloadbalancing:RemoveListenerCertificates",
    //         "elasticloadbalancing:RemoveTags",
    //         "elasticloadbalancing:SetIpAddressType",
    //         "elasticloadbalancing:SetSecurityGroups",
    //         "elasticloadbalancing:SetSubnets",
    //         "elasticloadbalancing:SetWebACL"
    //       ],
    //       "Resource": "*"
    //     },
    //     {
    //       "Effect": "Allow",
    //       "Action": [
    //         "iam:CreateServiceLinkedRole",
    //         "iam:GetServerCertificate",
    //         "iam:ListServerCertificates"
    //       ],
    //       "Resource": "*"
    //     },
    //     {
    //       "Effect": "Allow",
    //       "Action": [
    //         "cognito-idp:DescribeUserPoolClient"
    //       ],
    //       "Resource": "*"
    //     },
    //     {
    //       "Effect": "Allow",
    //       "Action": [
    //         "waf-regional:GetWebACLForResource",
    //         "waf-regional:GetWebACL",
    //         "waf-regional:AssociateWebACL",
    //         "waf-regional:DisassociateWebACL"
    //       ],
    //       "Resource": "*"
    //     },
    //     {
    //       "Effect": "Allow",
    //       "Action": [
    //         "tag:GetResources",
    //         "tag:TagResources"
    //       ],
    //       "Resource": "*"
    //     },
    //     {
    //       "Effect": "Allow",
    //       "Action": [
    //         "waf:GetWebACL"
    //       ],
    //       "Resource": "*"
    //     }
    //   ]
    // }
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
