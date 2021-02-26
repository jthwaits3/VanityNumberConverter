import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda'
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as logs from '@aws-cdk/aws-logs';
import * as cr from '@aws-cdk/custom-resources';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import { TableViewer } from './table_viewer-stack'

export class VanityConverterAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // CDK Parameters
    const connectInstanceId = new cdk.CfnParameter(this, "connectInstanceId", {
      type: "String",
      description: "The id of the Amazon Connect instance where the contact flow will be published."});
    const contactFlowName = new cdk.CfnParameter(this, "contactFlowName", {
      type: "String",
      description: "The name that will be given to the new contact flow."});

    //DynamoDB table for storing vanity numbers
    const vanityNumberTable = new dynamodb.Table(this, 'vanityNumberTable', {
      partitionKey: { name: 'callingNumber', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    //Lambda invoked by the contact flow to generate vanity numbers
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

    //Table Viewer to create HTTP endpoint for viewing Vanity Numbers
    const vanityTableViewer = new TableViewer(this, 'vanityTableViewer', {
      table: vanityNumberTable,
      title: 'Vanity Numbers Viewer'
    });

    //Contact flow custom resource lambda handler
    const contactFlowResourceHandler = new lambda.Function(this, 'contactFlowResourceHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('lambda/contactFlowResource'),
      handler: 'contactFlowResource.handler',
      environment: {
        CONVERTER_LAMBDA_ARN: converterLambda.functionArn,
        CONNECT_INSTANCE_ID: connectInstanceId.valueAsString,
        CONTACT_FLOW_NAME: contactFlowName.valueAsString,
        VIEWER_ENDPOINT: vanityTableViewer.endpoint
      },
      initialPolicy: [new PolicyStatement({
        actions: ['connect:associateLambdaFunction',
          'connect:createContactFlow',
          'lambda:*',
          'connect:*',],
        resources: ['*']
      })]
    });
    converterLambda.grantInvoke(contactFlowResourceHandler);

    //Contact flow custom resource provider
    const contactFlowProvider = new cr.Provider(this, 'contactFlowProvider', {
      onEventHandler: contactFlowResourceHandler,
      //isCompleteHandler: isComplete,
      logRetention: logs.RetentionDays.ONE_DAY
    });

    //Contact flow custom resource
    new cdk.CustomResource(this, 'contactFlowResource', { serviceToken: contactFlowProvider.serviceToken });


  }
}
