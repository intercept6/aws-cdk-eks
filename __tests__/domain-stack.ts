import { App } from "@aws-cdk/core";
import { SynthUtils } from "@aws-cdk/assert";
import { DomainStack } from "../lib/domain-stack";
import { Context } from "../lib/context";

describe("domain", () => {
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

    const stack = new DomainStack(app, "TestDomainStack", {
      env: params.env
    });
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
  });
});
