import { App } from "@aws-cdk/core";
import { SynthUtils } from "@aws-cdk/assert";
import { NetworkStack } from "../lib/network-stack";
import {Context} from "../lib/context";

describe("network", () => {
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

    const stack = new NetworkStack(app, "TestNetworkStack", {
      env: params.env
    });
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
  });
});
