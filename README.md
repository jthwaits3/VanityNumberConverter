# Vanity Converter Service
This application

## Quick Start
Prerequisites:
1. An AWS account with appropriate permissions to create the required resources
2. An AWS Connect instance
3. AWS CDK and AWS CLI access configured
To deploy the contact flow to your Amazon Connect instance, execute the below in the cloned project repository:
```sh
npm install
cdk bootstrap
cdk deploy --parameters connectInstanceId='YOUR CONNECT INSTANCE ID' --parameters contactFlowName='NAME FOR NEW CONTACT FLOW'
```

## Overview

### Vanity Converter

### Web viewer
The web viewer component is derived primarily from the cdk-dynamo-table-viewer package under Apache 2.0 License
https://github.com/eladb/cdk-dynamo-table-viewer/blob/master/lib/table-viewer.ts
It exposes an http endpoint that renders the 5 most recent vanity callers and associated vanity numbers using API Gateway and Lambda

## Discussion Points
### Development Approach
### Notable Challenges
During the development of this project, three challenges stood out.
 Phoneword algorithm
 Contact Flow Custom Resource
 * Working in the cloud does not provide immunity to data loss
### Key Areas for Improvement
* Test cases; build pipeline
* update, delete, and isComplete handler for contact flow
* SSML tags for text-to-speech of vanity numbers
* Policy permissions granted to custom resource event handler
