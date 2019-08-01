import { App, Stack } from "@aws-cdk/core";
import { SynthUtils } from "@aws-cdk/assert";
import { EksStack } from "../lib/eks-stack";
import { Vpc } from "@aws-cdk/aws-ec2";

describe("network", () => {
  test("default", () => {
    const region = "ap-northeast-1";
    const app = new App();
    const givenStack = new Stack(app, "GivenStack", {
      env: { region: region }
    });
    const vpc = new Vpc(givenStack, "Vpc");
    const stack = new EksStack(app, "TestEksStack", {
      env: { region: region },
      vpc: vpc
    });
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
  });
});
