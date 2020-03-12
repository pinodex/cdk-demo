import path = require('path');
import s3 = require('@aws-cdk/aws-s3');
import s3deploy = require('@aws-cdk/aws-s3-deployment');

import * as cdk from '@aws-cdk/core';

export class FrontendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
