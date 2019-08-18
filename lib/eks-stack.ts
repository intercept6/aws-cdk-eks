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
      desiredCapacity: 2,
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
      "AutoScalingFullAccess"
    ];
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
