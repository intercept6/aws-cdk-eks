import { Construct, Stack, StackProps, CfnOutput } from "@aws-cdk/core";
import { Cluster } from "@aws-cdk/aws-eks";
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  IVpc
} from "@aws-cdk/aws-ec2";
import { ManagedPolicy } from "@aws-cdk/aws-iam";

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
      kubectlEnabled: true,
      defaultCapacityInstance: InstanceType.of(
        InstanceClass.M5,
        InstanceSize.LARGE
      )
    });
    const a = this.cluster.defaultCapacity!.addUserData(
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
      this.cluster.defaultCapacity!.role.addManagedPolicy(
        ManagedPolicy.fromAwsManagedPolicyName(managedPolicyName)
      );
    }

    this.cluster.addResource("aws-auth-cm", {
      apiVersion: "v1",
      kind: "ConfigMap",
      metadata: {
        name: "aws-auth",
        namespace: "kube-system"
      },
      data: {
        mapRoles:
          `- username: system:node:{{EC2PrivateDNSName}}\n` +
          `  rolearn: ${this.cluster.defaultCapacity!.role.roleArn}\n` +
          `  groups:\n` +
          `    - system:bootstrappers\n` +
          `    - system:nodes\n` +
          `- username: kato.ryo\n` +
          `  rolearn: arn:aws:iam::206574590278:role/cm-kato.ryo\n` +
          `  groups:\n` +
          `    - system:masters\n`
      }
    });

    // Output
    new CfnOutput(this, "EksClusterName", {
      value: this.cluster.clusterName
    });
    new CfnOutput(this, "EksWorkerNodesInstanceRoleARN", {
      value: this.cluster.defaultCapacity!.role.roleArn
    });
  }
}
