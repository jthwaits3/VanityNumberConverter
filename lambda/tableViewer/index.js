/*
The contents of this file are derived primarily from the cdk-dynamo-table-viewer package under Apache 2.0 License
https://github.com/eladb/cdk-dynamo-table-viewer/blob/master/lib/table-viewer.ts
*/
const { DynamoDB } = require('aws-sdk');
const render = require('./render');

exports.handler = async function(event) {
  console.log('request:', JSON.stringify(event, undefined, 2));

  const dynamo = new DynamoDB();

  const resp = await dynamo.scan({
    TableName: process.env.TABLE_NAME,
  }).promise();

  const html = render({
    items: resp.Items.slice(0,5),
    title: 'Vanity Numbers Table',
  });

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html'
    },
    body: html
  };
};
