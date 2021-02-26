import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda'
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as logs from '@aws-cdk/aws-logs';
import * as cr from '@aws-cdk/custom-resources';
import { PolicyStatement } from '@aws-cdk/aws-iam';

export class VanityConverterAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const connectInstanceId = new cdk.CfnParameter(this, "connectInstanceId", {
      type: "String",
      description: "The id of the Amazon Connect instance where the contact flow will be published."});

    const contactFlowName = new cdk.CfnParameter(this, "contactFlowName", {
      type: "String",
      description: "The name that will be given to the new contact flow."});

    const vanityNumberTable = new dynamodb.Table(this, 'vanityNumberTable', {
      partitionKey: { name: 'callingNumber', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });


    const converterLambda = new lambda.Function(this, 'converterHandler', {
      code: lambda.Code.fromAsset('lambda/vanityConverter'),
      handler: 'vanityConverter.handler',
      runtime: lambda.Runtime.NODEJS_12_X,
      timeout: cdk.Duration.seconds(10),
      environment: {
        VANITY_TABLE_NAME: vanityNumberTable.tableName,
      },
    });
    vanityNumberTable.grantReadWriteData(converterLambda);

    const contactFlowResourceHandler = new lambda.Function(this, 'contactFlowResourceHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('lambda/contactFlowResource'),
      handler: 'contactFlowResource.handler',
      environment: {
        CONVERTER_LAMBDA_ARN: converterLambda.functionArn,
        CONNECT_INSTANCE_ID: connectInstanceId.valueAsString,
        CONTACT_FLOW_NAME: contactFlowName.valueAsString,
      },
      initialPolicy: [new PolicyStatement({
        actions: ['connect:associateLambdaFunction',
          'connect:createContactFlow',
          'lambda:*'],
        resources: ['*']
      })]
    });

    const contactFlowProvider = new cr.Provider(this, 'contactFlowProvider', {
      onEventHandler: contactFlowResourceHandler,
      //isCompleteHandler: isComplete,
      logRetention: logs.RetentionDays.ONE_DAY
    });

    new cdk.CustomResource(this, 'contactFlowResource', { serviceToken: contactFlowProvider.serviceToken });

  }
}
