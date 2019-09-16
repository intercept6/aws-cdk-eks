import { Environment, StackProps } from "@aws-cdk/core";

export interface Context {
  env: Environment;
  domain: string;
}
