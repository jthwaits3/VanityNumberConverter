#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { VanityConverterAppStack } from '../lib/vanity_converter_app-stack';

const app = new cdk.App();
new VanityConverterAppStack(app, 'VanityConverterAppStack');
