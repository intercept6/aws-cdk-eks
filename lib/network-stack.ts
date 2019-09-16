import { Stack, StackProps, Construct, CfnOutput, Tag } from "@aws-cdk/core";
import { Vpc, SubnetType, CfnSubnet } from "@aws-cdk/aws-ec2";
import { DnsValidatedCertificate } from "@aws-cdk/aws-certificatemanager";
import { HostedZone } from "@aws-cdk/aws-route53";
import { Context } from "./context";

export class NetworkStack extends Stack {
  public readonly vpc: Vpc;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    const stage: string = this.node.tryGetContext("stage");
    const params: Context = this.node.tryGetContext(stage);

    this.vpc = new Vpc(this, "VPC", {
      subnetConfiguration: [
        { name: "Public", subnetType: SubnetType.PUBLIC, cidrMask: 20 },
        { name: "Private", subnetType: SubnetType.PRIVATE, cidrMask: 20 },
        { name: "Isolated", subnetType: SubnetType.ISOLATED, cidrMask: 20 }
      ]
    });

    // Publicサブネットにタグを付ける｡(key: "kubernetes.io/role/elb", value: "1")
    const publicSubnets = this.vpc.publicSubnets;
    for (let i = 0; i < publicSubnets.length; i++) {
      publicSubnets[i].node.applyAspect(new Tag("kubernetes.io/role/elb", "1"));
      // let cfnPublicSubnet = publicSubnets[i].node.defaultChild as CfnSubnet;
      // cfnPublicSubnet.tags.setTag("kubernetes.io/role/elb", "1");
    }
  }
}
