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
      vpc: props.vpc
    });
    const asg = this.cluster.addCapacity("WorkerNodes", {
      instanceType: InstanceType.of(InstanceClass.M5, InstanceSize.LARGE),
      minCapacity: 2,
      maxCapacity: 4,
      desiredCapacity: 2
    });

    const managedPolicyNames = [
      "service-role/AmazonEC2RoleforSSM",
      "ElasticLoadBalancingFullAccess"
    ];
    for (let managedPolicyName of managedPolicyNames) {
      asg.role.addManagedPolicy(
        ManagedPolicy.fromAwsManagedPolicyName(managedPolicyName)
      );
    }

    // Output
    new CfnOutput(this, "EksClusterName", {
      value: this.cluster.clusterName
    });
    new CfnOutput(this, "EksWorkerNodesInstanceRoleARN", {
      value: asg.role.roleArn
    });
  }
}
