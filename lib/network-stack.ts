import { Stack, StackProps, Construct } from "@aws-cdk/core";
import { Vpc, SubnetType } from "@aws-cdk/aws-ec2";
import { Certificate } from "@aws-cdk/aws-certificatemanager";

export class NetworkStack extends Stack {
  public readonly vpc: Vpc;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // TODO: Publicサブネットにタグを付ける(kubernetes.io/role/elb:1)
    this.vpc = new Vpc(this, "VPC", {
      subnetConfiguration: [
        { name: "Public", subnetType: SubnetType.PUBLIC, cidrMask: 20 },
        { name: "Private", subnetType: SubnetType.PRIVATE, cidrMask: 20 },
        { name: "Isolated", subnetType: SubnetType.ISOLATED, cidrMask: 20 }
      ]
    });

    // TODO: 証明書をCDKで作成する
    // const cert = new Certificate(this, "Certificate", {
    //   domainName: 'rkato.classmethod.info',
    //   subjectAlternativeNames: '*.rkato.classmethod.info',
    // });
  }
}
