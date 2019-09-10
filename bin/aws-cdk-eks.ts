#!/usr/bin/env node
import "source-map-support/register";
import {App} from "@aws-cdk/core";
import {NetworkStack} from "../lib/network-stack";
import {EksStack} from "../lib/eks-stack";
import {Context} from "../lib/context";
import {DomainStack} from "../lib/domain-stack";

const app = new App();
const stage: string = app.node.tryGetContext("stage");
const params: Context = app.node.tryGetContext(stage);

const networkStack = new NetworkStack(app, "NetworkStack", {
  env: params.env
});
const domainStack = new DomainStack(app, "DomainStack", {
  env: params.env
});
const eksStack = new EksStack(app, "EksStack", {
  env: params.env,
  vpc: networkStack.vpc
});
eksStack.addDependency(domainStack, "TLS certificate for ELB");