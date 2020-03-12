import path = require('path');
import dynamodb = require('@aws-cdk/aws-dynamodb');
import lambda = require('@aws-cdk/aws-lambda');
import apigateway = require('@aws-cdk/aws-apigateway');
import s3 = require('@aws-cdk/aws-s3');
import s3deploy = require('@aws-cdk/aws-s3-deployment');

import * as cdk from '@aws-cdk/core';

export class BackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'messages', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING
      }
    });

    const backend = new lambda.Function(this, 'MessagesBackend', {
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'app')),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      environment: {
        REGION: cdk.Stack.of(this).region,
        TABLE_NAME: table.tableName
      }
    });

    table.grantReadData(backend);
    table.grantWriteData(backend);

    const api = new apigateway.RestApi(this, 'MessagesAPI');

    const proxy = api.root.addProxy({
      defaultIntegration: new apigateway.LambdaIntegration(backend)
    });

    const websiteBucket = new s3.Bucket(this, 'MessagesWebsite', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true
    });

    new s3deploy.BucketDeployment(this, 'DeployMessagesWebsite', {
      sources: [
        s3deploy.Source.asset(path.join(__dirname, '..', 'app', 'web'))
      ],
      destinationBucket: websiteBucket
    });
  }
}
