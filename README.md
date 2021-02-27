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
To use the contact flow, add it to another existing flow or associate it as the default routing for a phone number.

## Overview
Below is an overview of the application broken down into the service that converts and stores vanity numbers, the contact flow custom resource, and the web viewer.

### Vanity Converter Service
The process of converting phone numbers to vanity numbers relies on a lambda and a dynamoDb resource declared in lib/vanity_converter_app-stack, and the lambda event handler code in lambda/vanityConverter. The approach used in the lambda handler relies on first generating an NxN matrix that contains the possible character permutations within the phone number, and then splicing words as they fit back into the original number. A dictionary file with 1,000 of the most common English words is used in the example but this file may be replaced with a similarly formatted array. To reduce the combinations necessary in the NxN matrix, the dictionary is loaded into a Trie structure to check if a permutation is a valid prefix before bothering to append additional characters. Given such a small dictionary file, it would likely be acceptable to convert it into a hashtable mapping specific character combinations to the words, but this approach may not scale as well for larger dictionaries. In a final deployment with a larger dictionary, it may also make sense to generate the Trie structure during the build process and load that directly in the Lambda function, rather than spending the processing power to build the Trie on every invocation.

### Contact Flow Custom Resource
The components of the contact flow custom resource are also defined in lib/vanity_converter_app-stack, and the lambda event handler in the lambda/contactFlowResource. This custom resource utilizes the AWS SDK for Connect for two action: Connect.associateLambdaFunction() to associate the Lambda with the Connect environment, and Connect.createContactFlow() to create the contact flow object. The content of the contact flow is finalized during execution depending on the converter Lambda ARN and the table viewer endpoint.

### Web viewer
The web viewer component is derived primarily from the cdk-dynamo-table-viewer package under Apache 2.0 License
https://github.com/eladb/cdk-dynamo-table-viewer/blob/master/lib/table-viewer.ts
It exposes an http endpoint that renders the 5 most recent vanity callers and associated vanity numbers using API Gateway and Lambda.

## Testing
(Pending)

## Discussion Points
### Implementation Approach
To begin building this application, the prompt was first broken down into several high level requirements:
 1. Create a lambda that takes in a phone number and returns associated vanity numbers
 2. Store calling numbers and associated vanity numbers in a DynamoDB table
 3. Create an Amazon Connect contact flow that utilizes the Lambda function to read vanity numbers back to the caller
 4. Create a CloudFormation template that can be used to deploy the solution in another AWS environment
 5. (Optional) Provide an HTTP endpoint for viewing the 5 most recent callers and associated Vanity numbers
The overall complexity of the solution required was seen as low to moderate, so my approach was to build an application skeleton focused around existing knowledge, and then build out the gaps alongside researching required technologies I wasn't as familiar with. To this end, I started where I was most comfortable, using the AWS CDK to create my stack and adding a lambda with a placeholder response and dynamoDb table for converting the phone numbers. As I prepared to add the contact flow resource, I realized Connect resources were not yet supported in the AWS CDK, but there was a Connect SDK available in a preview state. A placeholder CDK custom resource, provider, and event handler were added to the stack to represent these components, but for initial development and testing, a contact flow was manually created via the GUI in the Connect web portal.
At this point in development, I was able to associate a contact flow utilizing my lambda function with a Connect phone number and get expected test results upon calling it - including functional milestones such as this is great for motivation and promoting interest in the project! The next piece I chose to tackle was replacing the lambda pseudo-response with the vanity converter logic. I spent time researching various algorithms for generating phone words and determining if there was an strong open-source solution to utilize. Not finding exactly what I was looking forward, I implemented my own solution in javascript utilizing a Trie structure and a multi-dimensional array of valid permutations to return an array of vanity numbers. The solution utilizes a similar approach to that described here: http://stevehanov.ca/blog/index.php?id=9
After verifying the lambda function now worked as intended, I returned to the custom resource implementation of the contact flow, specifically the resource event handler lambda. Having manually created the resource earlier I knew there were two actions that needed to occur: the converter lambda would need to be associated with the AWS Contact instance (Connect.associateLambdaFunction()) and a contact flow object would need to be created (Connect.createContactFlow()). These SDK methods were both added to the handler, and two CloudFormation parameters added to the stack deployment: one for the AWS Connect ID and one for the desired name of the new contact flow.
I saved the final web viewer component service for last as it was not a dependency for any other functionality, and I had previously added similar functionality to existing stacks. I used a package, cdk-dynamo-table-viewer (Apache 2.0 license), as a starting point and made minor modifications to parameters and the data displayed.
After completing development of a fully functional solution, I began implementing test cases for the cdk stack. In larger projects with more moving pieces or more detailed requirements, these tests would be better implemented during the initial development work. However, on a small project being developed individually, considerations for creating a test suite can benefit from having a holistic view of the final solution.


### Notable Challenges
## Data loss
The biggest set-back during the development of this project was a tough reminder that 1) you're never too experienced to make a rookie mistake, and 2) data in the cloud does not inherently provide immunity to data loss. The AWS ecosystem can be very exciting to work in and there's great efficiencies to take advantage of in the service synergies. I chose to initially use Cloud9 as my IDE for this project, and CodeCommit to store my repository. Taking it a step further and attempting to showcase my knowledge of some dev-ops services, I moved the CodeCommit repository to be defined in my CDK stack, along with a CodePipeline resource to manage automatic deployments. Thursday morning as a final test deploying the solution, I wanted to remove all the resources from my AWS account and re-deploy from scratch. After executing 'cdk destroy', I navigated to the CloudFormation console to verify it had been removed properly when disaster struck. I  saw four stacks with names beginning like 'VanityNumberCoverterApp_####..'. Knowing I had made some "ghost" stacks earlier in the week that I had not removed properly, I quickly selected each of four stacks, selected the Delete drop-down, and typed in my confirmation: I was sure I wanted to delete those stacks. Including the one containing my Cloud9 EC2 instance and associated EBS volume. I had destroyed any CodeCommit repositories in my application stacks, and could no longer access the same Cloud9 environment.
Realizing my mistake a moment later, I spent some time confirming my fear: my actions were irreversible. Fortunately I did have time to recreate the application, albeit taking some more shortcuts along the way. As demotivating as losing a significant portion of work was, I found inspiration of equal magnitude in how quickly I was able to re-develop my solution; a reminder that there is no better substitute for in-depth learning of new strategies and technologies than using them to build real solutions.
## Vanity converter
The number to vanity number conversion required a unique algorithm that would be performant enough across inputs to reliably execute before the contact flow timeout. Some solutions to similar problems found online seemed very optimized but consisted of 1000's of lines of code. Instead, I used high-level concepts from different examples to develop a solution from scratch - resulting in something that may not be as optimized, but is performant enough for this use case and that I can speak to confidently. Recalling the initial implementation of this before my data loss was more difficult than the infrastructure files and required the most rework. While the second implementation uses the same general approach, there are several sloppy shortcuts taken. While the performance results are similar, the readability of the code could be vastly improved.
## Connect Custom Resource
Having previously created custom resources with the CDK, I had little initial concern implementing the custom resource handler. However, the Connect SDK API was slightly less developed and documented, .

### Additional Areas for Improvement
* Re-create cdk build test cases lost during event discussed above
* Implement a CodePipeline to automate deployments and testing
* Utilize SSML tags for text-to-speech of vanity numbers and web-viewer
* Grant less permissive policy statement to custom resource handler
* Add functionality for custom resource Delete request types and improve custom resource Update logic
