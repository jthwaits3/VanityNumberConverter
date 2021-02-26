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


## Discussion Points
### Development Approach
### Notable Challenges
During the development of this project, three challenges stood out.
 Phoneword algorithm
 Contact Flow Custom Resource
 Working in the cloud does not provide immunity to data loss
### Key Areas for Improvement
* update, delete, and isComplete handler for contact flow
