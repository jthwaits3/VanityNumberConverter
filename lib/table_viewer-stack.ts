/*
The contents of this file are derived primarily from the cdk-dynamo-table-viewer package under Apache 2.0 License
https://github.com/eladb/cdk-dynamo-table-viewer/blob/master/lib/table-viewer.ts
*/

import cdk = require('@aws-cdk/core');
import apigw = require('@aws-cdk/aws-apigateway');
import lambda = require('@aws-cdk/aws-lambda');
import dynamodb = require('@aws-cdk/aws-dynamodb');
// import path = require('path');

export interface TableViewerProps {
  readonly table: dynamodb.Table;
  readonly title?: string;
}

/**
 * Installs an endpoint in your stack that allows users to view the contents
 * of a DynamoDB table through their browser.
 */
export class TableViewer extends cdk.Construct {

  public readonly endpoint: string;

  constructor(parent: cdk.Construct, id: string, props: TableViewerProps) {
    super(parent, id);

    const handler = new lambda.Function(this, 'Rendered', {
      code: lambda.Code.fromAsset('lambda/tableViewer'),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      environment: {
        TABLE_NAME: props.table.tableName,
        TITLE: props.title || '',
      }
    });

    props.table.grantReadData(handler);

    const home = new apigw.LambdaRestApi(this, 'ViewerEndpoint', { handler });
    this.endpoint = home.url;
  }
}
