#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { AwsCdkEksStack } from '../lib/aws-cdk-eks-stack';

const app = new cdk.App();
new AwsCdkEksStack(app, 'AwsCdkEksStack');
