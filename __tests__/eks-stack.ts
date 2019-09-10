import { App, Stack } from "@aws-cdk/core";
import { SynthUtils } from "@aws-cdk/assert";
import { EksStack } from "../lib/eks-stack";
import { Vpc } from "@aws-cdk/aws-ec2";
import {Context} from "../lib/context";

describe("eks", () => {
  test("default", () => {
    const app = new App();
    const stage = "test";
    app.node.setContext("stage", stage);
    const params: Context = {
      env: {
        account: "111111111111",
        region: "ap-northeast-1"
      },
      domain: "example.com"
    };
    app.node.setContext(stage, params);

    const givenStack = new Stack(app, "GivenStack", {
      env:params.env
    });
    const vpc = new Vpc(givenStack, "Vpc");
    const stack = new EksStack(app, "TestEksStack", {
      env:params.env,
      vpc: vpc
    });
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
  });
});
