import {CfnOutput, Construct, Stack, StackProps, Tag} from "@aws-cdk/core";
import {DnsValidatedCertificate, ValidationMethod} from "@aws-cdk/aws-certificatemanager";
import {HostedZone} from "@aws-cdk/aws-route53";
import {Context} from "./context";


export class DomainStack extends Stack {

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        const stage: string = this.node.tryGetContext("stage");
        const params: Context = this.node.tryGetContext(stage);


        // Generate TLS certificate that is DNS verified by Route53
        const hostedZone = HostedZone.fromLookup(this, "HostedZone", {
            domainName: params.domain
        });
        const acm = new DnsValidatedCertificate(this, "Certificate", {
            domainName: `*.${params.domain}`,
            subjectAlternativeNames: [params.domain],
            validationMethod: ValidationMethod.DNS,
            region: params.env.region,
            hostedZone
        });
        // acm.node.applyAspect(new Tag("Name", "aws-cdk-eks"));

        // Output
        new CfnOutput(this, "AcmArn", {
            value: acm.certificateArn
        });
    }
}
