# Vanity Converter App
This application uses the AWS CDK to create a contact flow for use in an AWS Connect instance. It also provides an HTTP endpoint for viewing a table of recent callers vanity numbers.

The contact flow may be previewed by calling (385)398-4421 and/or viewing the vanity numbers table at https://7np5mymtkg.execute-api.us-west-2.amazonaws.com/prod/

## Quick Start
Prerequisites:
1. An AWS account with appropriate permissions to create the required resources
2. An AWS Connect instance
3. AWS CDK and AWS CLI access configured
To deploy the contact flow to your Amazon Connect instance, clone the project repository and execute the below:
```sh
cd VanityNumberConverter
npm install
cdk bootstrap
cdk deploy --parameters connectInstanceId='YOUR CONNECT INSTANCE ID' --parameters contactFlowName='NAME FOR NEW CONTACT FLOW'
Enter y when asked to confirm the changes.
```

## Overview

### Vanity Converter Service

### Contact Flow Custom Resource

### Web viewer
The web viewer component is derived primarily from the cdk-dynamo-table-viewer package under Apache 2.0 License
https://github.com/eladb/cdk-dynamo-table-viewer/blob/master/lib/table-viewer.ts
It exposes an http endpoint that renders the 5 most recent vanity callers and associated vanity numbers using API Gateway and Lambda

## Discussion Points
### Development Approach
### Notable Challenges
During the development of this project, three challenges stood out.
 * Phoneword algorithm
 * Contact Flow Custom Resource
 * Working in the cloud does not provide immunity to data loss
### Key Areas for Improvement
* Test cases; build pipeline
* update, delete, and isComplete handler for contact flow
* SSML tags for text-to-speech of vanity numbers
* Policy permissions granted to custom resource event handler
