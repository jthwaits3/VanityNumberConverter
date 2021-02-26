const aws = require('aws-sdk');
const connect = new aws.Connect();

exports.handler = async function(event, context, callback) {
  const requestType = event.RequestType;

  if (requestType==='Create' || requestType==='Update') {
    var associateLambdaParams = {
      FunctionArn: process.env.CONVERTER_LAMBDA_ARN,
      InstanceId: process.env.CONNECT_INSTANCE_ID
    };
    var createContactFlowparams = {
      Content: '{"Version":"2019-10-30","StartAction":"5641d411-8747-4a5d-8301-1ef86197a4b9","Metadata":{"entryPointPosition":{"x":15,"y":15},"snapToGrid":false,"ActionMetadata":{"5641d411-8747-4a5d-8301-1ef86197a4b9":{"position":{"x":184,"y":32},"useDynamic":false},"7c0a92c0-3a0d-4941-9d0e-2ae0e16ce58b":{"position":{"x":680,"y":200},"useDynamic":false},"83b76e76-52cc-4732-81ff-1519b0c0f132":{"position":{"x":1204,"y":279}},"2a4c841c-603a-4da9-95f2-5ba2fec0eec6":{"position":{"x":947,"y":19},"useDynamic":false},"f3d5f9ce-aa17-488e-9fdc-a93e826ef06d":{"position":{"x":430,"y":39},"dynamicMetadata":{},"useDynamic":false},"0d62e820-6a26-43f0-87bd-12865bd8720a":{"position":{"x":685,"y":25},"useDynamic":false}}},"Actions":[{"Identifier":"5641d411-8747-4a5d-8301-1ef86197a4b9","Parameters":{"Text":"Hello, thanks for calling. This service will invoke a lambda function to compute vanity numbers associated with your calling number."},"Transitions":{"NextAction":"f3d5f9ce-aa17-488e-9fdc-a93e826ef06d","Errors":[],"Conditions":[]},"Type":"MessageParticipant"},{"Identifier":"7c0a92c0-3a0d-4941-9d0e-2ae0e16ce58b","Parameters":{"Text":"We\'re sorry, an error occurred while generating vanity numbers. Goodbye."},"Transitions":{"NextAction":"83b76e76-52cc-4732-81ff-1519b0c0f132","Errors":[],"Conditions":[]},"Type":"MessageParticipant"},{"Identifier":"83b76e76-52cc-4732-81ff-1519b0c0f132","Type":"DisconnectParticipant","Parameters":{},"Transitions":{}},{"Identifier":"2a4c841c-603a-4da9-95f2-5ba2fec0eec6","Parameters":{"Text":"Thank you for calling. You may view a table of vanity numbers for recent callers at '+ process.env.VIEWER_ENDPOINT +' website. Goodbye."},"Transitions":{"NextAction":"83b76e76-52cc-4732-81ff-1519b0c0f132","Errors":[],"Conditions":[]},"Type":"MessageParticipant"},{"Identifier":"f3d5f9ce-aa17-488e-9fdc-a93e826ef06d","Parameters":{"LambdaFunctionARN":"'+ process.env.CONVERTER_LAMBDA_ARN +'","InvocationTimeLimitSeconds":"4"},"Transitions":{"NextAction":"0d62e820-6a26-43f0-87bd-12865bd8720a","Errors":[{"NextAction":"7c0a92c0-3a0d-4941-9d0e-2ae0e16ce58b","ErrorType":"NoMatchingError"}],"Conditions":[]},"Type":"InvokeLambdaFunction"},{"Identifier":"0d62e820-6a26-43f0-87bd-12865bd8720a","Parameters":{"Text":"Lambda successfully invoked. Your vanity numbers are as follows: vanity 0: $.External.vanity0, vanity 1: $.External.vanity1, vanity 2: $.External.vanity2, vanity 3: $.External.vanity3, vanity 4: $.External.vanity4"},"Transitions":{"NextAction":"2a4c841c-603a-4da9-95f2-5ba2fec0eec6","Errors":[],"Conditions":[]},"Type":"MessageParticipant"}]}',
      InstanceId: process.env.CONNECT_INSTANCE_ID,
      Name: process.env.CONTACT_FLOW_NAME,
      Type: 'CONTACT_FLOW',
      Description: 'Contact flow that invokes a Lambda function to provide inbound calling numbers with associated vanity numbers.',
    };

    var associateLambda = await connect.associateLambdaFunction(associateLambdaParams).promise();
    var createCf = await connect.createContactFlow(createContactFlowparams).promise();

    Promise.all([associateLambda, createCf]).then(function(values) {
      console.log("associateLambdaFunction data: ");
      console.log(values[0]);
      console.log("createContactFlow data: ");
      console.log(values[1]);
      // console.log("associateLambdaFunction data: " + values);
      // return the result to the caller of the Lambda function
      callback(null, values);
    });
  }
}
