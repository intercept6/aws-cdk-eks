import { App } from "@aws-cdk/core";
import { SynthUtils } from "@aws-cdk/assert";
import { NetworkStack } from "../lib/network-stack";

describe("network", () => {
  test("default", () => {
    const region = "ap-northeast-1";
    const app = new App();
    const stack = new NetworkStack(app, "TestNetworkStack", {
      env: { region: region }
    });
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
  });
});
