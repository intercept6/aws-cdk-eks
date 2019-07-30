import { Stack, StackProps, Construct } from "@aws-cdk/core";
import { Vpc, SubnetType } from "@aws-cdk/aws-ec2";

export class NetworkStack extends Stack {
  public readonly vpc: Vpc;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.vpc = new Vpc(this, "VPC", {
      subnetConfiguration: [
        { name: "Public", subnetType: SubnetType.PUBLIC, cidrMask: 20 },
        { name: "Private", subnetType: SubnetType.PRIVATE, cidrMask: 20 },
        { name: "Isolated", subnetType: SubnetType.ISOLATED, cidrMask: 20 }
      ]
    });
  }
}
