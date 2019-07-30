#!/usr/bin/env node
import "source-map-support/register";
import { App } from "@aws-cdk/core";
import { NetworkStack } from "../lib/network-stack";
import { EksStack } from "../lib/eks-stack";

const app = new App();

const region = process.env.CDK_DEFAULT_REGION || "ap-northeast-1";

const networkStack = new NetworkStack(app, "NetworkStack", {
  env: { region: region }
});
const eksStack = new EksStack(app, "EksStack", {
  env: {
    region: region
  },
  vpc: networkStack.vpc
});
