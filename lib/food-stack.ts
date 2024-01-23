import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import * as aws_dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import {Duration} from 'aws-cdk-lib';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

export class FoodStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const recipeTable = new aws_dynamodb.Table(this, 'recipeTable', {
      tableName: 'recipeTable',
      partitionKey: {name: 'recipeId', type: aws_dynamodb.AttributeType.STRING},
      removalPolicy: RemovalPolicy.DESTROY
    });



    const dynamodbRole = new iam.Role(this, 'DynamoDBRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    })

    const dynamoRecipePolicy = new iam.Policy(this, 'dynamoRecipePolicy', {
      policyName: 'dynamoRecipePolicy',
      roles: [dynamodbRole],
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['dynamodb:*'],
          resources: [recipeTable.tableArn]
        })
      ]
    })

    dynamodbRole.addManagedPolicy(iam.ManagedPolicy.fromManagedPolicyArn(this, 'basicRole', 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'))  

    const env = {TABLE_NAME: recipeTable.tableName};

    // Get recipe based on user, types, or all recipes
    const getRecipeLambda = new NodejsFunction(this, 'getRecipe', {
      runtime: lambda.Runtime.NODEJS_18_X,
      functionName: 'getRecipe',
      handler: 'getRecipeAPIEvent',
      entry: 'functions/getRecipe/src/handler.ts',
      description: 'Get recipe based on user, types, or all recipes',
      timeout: Duration.seconds(20),
      memorySize: 2048,
      role: dynamodbRole,
      environment: env,
      logRetention: RetentionDays.ONE_DAY
    })

    const postRecipeLambda = new NodejsFunction(this, 'postRecipe', {
      runtime: lambda.Runtime.NODEJS_18_X,
      functionName: 'postRecipe',
      handler: 'postRecipeAPIEvent',
      entry: 'functions/postRecipe/src/handler.ts',
      description: 'post recipe for user',
      timeout: Duration.seconds(20),
      memorySize: 2048,
      role: dynamodbRole,
      environment: env,
      logRetention: RetentionDays.ONE_DAY
    })

    const updateRecipeLambda = new NodejsFunction(this, 'updateRecipe', {
      runtime: lambda.Runtime.NODEJS_18_X,
      functionName: 'updateRecipe',
      handler: 'updateRecipeAPIEvent',
      entry: 'functions/updateRecipe/src/handler.ts',
      description: 'update recipe for user',
      timeout: Duration.seconds(20),
      memorySize: 2048,
      environment: env,
      role: dynamodbRole,
    })

    const deleteRecipeLambda = new NodejsFunction(this, 'deleteRecipe', {
      runtime: lambda.Runtime.NODEJS_18_X,
      functionName: 'deleteRecipe',
      handler: 'deleteRecipeAPIEvent',
      entry: 'functions/deleteRecipe/src/handler.ts',
      description: 'delete recipe for user',
      timeout: Duration.seconds(20),
      memorySize: 2048,
      environment: env,
      role: dynamodbRole,
    })

    const postCommentLambda = new NodejsFunction(this, 'postComment', {
      runtime: lambda.Runtime.NODEJS_18_X,
      functionName: 'postComment',
      handler: 'postCommentAPIEvent',
      entry: 'functions/postComments/src/handler.ts',
      description: 'postComment for user',
      timeout: Duration.seconds(20),
      memorySize: 2048,
      environment: env,
      role: dynamodbRole,
    })

    const deleteCommentLambda = new NodejsFunction(this, 'deleteComment', {
      runtime: lambda.Runtime.NODEJS_18_X,
      functionName: 'deleteComment',
      handler: 'deleteCommentAPIEvent',
      entry: 'functions/deleteComment/src/handler.ts',
      description: 'deleteComment for user',
      timeout: Duration.seconds(20),
      memorySize: 2048,
      environment: env,
      role: dynamodbRole,
    })    

    const getCommentsLambda = new NodejsFunction(this, 'getComments', {
      runtime: lambda.Runtime.NODEJS_18_X,
      functionName: 'getComments',
      handler: 'getCommentsAPIEvent',
      entry: 'functions/getComments/src/handler.ts',
      description: 'getComments for user',
      timeout: Duration.seconds(20),
      memorySize: 2048,
      environment: env,
      role: dynamodbRole,
    }) 

    const updateCommentLambda = new NodejsFunction(this, 'updateComment', {
      runtime: lambda.Runtime.NODEJS_18_X,
      functionName: 'updateComment',
      handler: 'updateCommentAPIEvent',
      entry: 'functions/updateComments/src/handler.ts',
      description: 'updateComment for user',
      timeout: Duration.seconds(20),
      memorySize: 2048,
      environment: env,
      role: dynamodbRole,
    }) 
  
    const postLikeRecipe = new NodejsFunction(this, 'postLike', {
      runtime: lambda.Runtime.NODEJS_18_X,
      functionName: 'postLike',
      handler: 'postLikeAPIEvent',
      entry: 'functions/postLike/src/handler.ts',
      description: 'postLike for user',
      timeout: Duration.seconds(20),
      memorySize: 2048,
      environment: env,
      role: dynamodbRole,
    })

    const deleteLikeRecipe = new NodejsFunction(this, 'deleteLike', {
      runtime: lambda.Runtime.NODEJS_18_X,
      functionName: 'deleteLike',
      handler: 'deleteLikeAPIEvent',
      entry: 'functions/deleteLike/src/handler.ts',
      description: 'deleteLike for user',
      timeout: Duration.seconds(20),
      memorySize: 2048,
      environment: env,
      role: dynamodbRole,
    })

    const purchaseLambda = new NodejsFunction(this, 'purchaseLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      functionName: 'purchase',
      handler: 'purchaseProcessor',
      entry: 'functions/purchase/src/handler.ts',
      description: 'asynchronous purchase processor',
      timeout: Duration.seconds(20),
      memorySize: 2048,
      environment: env,
      role: dynamodbRole,
    })

    const queue = new sqs.Queue(this, 'foodQueue', {
      queueName: 'purchaseQueue',
      visibilityTimeout: Duration.seconds(50)
    });

    purchaseLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['sqs:ReceiveMessage'],
      effect: iam.Effect.ALLOW,
      resources: [queue.queueArn]
    }))

    const appApi = new apiGateway.RestApi(this, 'AppApi', {
      restApiName: 'foodApi'
    });

    purchaseLambda.addEventSource(new SqsEventSource(queue, {batchSize: 1}))

    const apiGatewayRole = new iam.Role(this, "APIGatewayRole", {
      roleName: 'api-gateway-role-access',
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com')
    });

    const SqsApiGatewayPolicy = new iam.Policy(this, 'SendMessagePolicy', {
      statements: [
        new iam.PolicyStatement({
          actions: ['sqs:SendMessage'],
          effect: iam.Effect.ALLOW,
          resources: [queue.queueArn]
        })
      ]
    })

    apiGatewayRole.attachInlinePolicy(SqsApiGatewayPolicy);

    const purchaseQueueApiGatewayIntegration = new apiGateway.Integration({
      type: apiGateway.IntegrationType.AWS,
      integrationHttpMethod: 'POST',
      uri: 'arn:aws:apigateway:us-east-1:sqs:path/637094984608/purchaseQueue',
      options: {
        credentialsRole: apiGatewayRole,
        passthroughBehavior: apiGateway.PassthroughBehavior.WHEN_NO_TEMPLATES,
        requestParameters: {
          'integration.request.header.Content-Type': '\'application/x-www-form-urlencoded\''
        },
        requestTemplates: {
          'application/json': 'Action=SendMessage&MessageBody=$util.urlEncode($input.body)&MessageAttribute.1.Name=header&MessageAttribute.1.Value.StringValue=$util.urlEncode($util.escapeJavaScript($input.params().header))&MessageAttribute.1.Value.DataType=String'
        },
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': '{"message": "SQS message sent"}'
            }
          }
        ],
      },

    })

    // recipeTable.grantReadData(getRecipeLambda);
    // recipeTable.grantReadWriteData(postRecipeLambda);
    // recipeTable.grantReadWriteData(updateRecipeLambda);
    // recipeTable.grantReadWriteData(deleteRecipeLambda);
    // recipeTable.grantReadData(getCommentsLambda);
    // recipeTable.grantReadWriteData(postCommentLambda);
    // recipeTable.grantReadWriteData(updateCommentLambda);
    // recipeTable.grantReadWriteData(deleteCommentLambda);

    


    const recipeEndpoints = appApi.root.addResource('recipe');
    const recipePurchaseEndpoints = recipeEndpoints.addResource('purchase');
    recipePurchaseEndpoints.addMethod('POST', purchaseQueueApiGatewayIntegration, 
    {
      methodResponses: [
      {statusCode: '200'},
      {statusCode: '400'}
    ]
  });


    const singleRecipeEndpoints = recipeEndpoints.addResource('{id}');
    const getRecipeIntegration = new apiGateway.LambdaIntegration(getRecipeLambda);
    const postRecipeIntegration = new apiGateway.LambdaIntegration(postRecipeLambda);
    const putRecipeIntegration = new apiGateway.LambdaIntegration(updateRecipeLambda);
    const deleteRecipeIntegration = new apiGateway.LambdaIntegration(deleteRecipeLambda);
    recipeEndpoints.addMethod('GET', getRecipeIntegration);
    recipeEndpoints.addMethod('POST', postRecipeIntegration);
    // recipePurchaseEndpoints.addMethod('POST', purchaseQueueApiGatewayIntegration);
    singleRecipeEndpoints.addMethod('PUT', putRecipeIntegration);
    singleRecipeEndpoints.addMethod('DELETE', deleteRecipeIntegration);
    singleRecipeEndpoints.addMethod('GET', getRecipeIntegration);
    addCorsOptions(recipeEndpoints);
    addCorsOptions(singleRecipeEndpoints);

    const recipeCommentsEndpoint = singleRecipeEndpoints.addResource('comments');
    const singleCommentRecipeEndpoint = recipeCommentsEndpoint.addResource('{comment_id}')
    const getCommentRecipeIntegration = new apiGateway.LambdaIntegration(getCommentsLambda);
    const postCommentRecipeIntegration = new apiGateway.LambdaIntegration(postCommentLambda);
    const updateCommentRecipeIntegration = new apiGateway.LambdaIntegration(updateCommentLambda);
    const deleteCommentRecipeIntegration = new apiGateway.LambdaIntegration(deleteCommentLambda);
    recipeCommentsEndpoint.addMethod('GET', getCommentRecipeIntegration);
    recipeCommentsEndpoint.addMethod('POST', postCommentRecipeIntegration);
    singleCommentRecipeEndpoint.addMethod('PUT', updateCommentRecipeIntegration);
    singleCommentRecipeEndpoint.addMethod('DELETE', deleteCommentRecipeIntegration);
    addCorsOptions(recipeCommentsEndpoint);
    addCorsOptions(singleCommentRecipeEndpoint);

    const postRecipeLikesIntegration = new apiGateway.LambdaIntegration(postLikeRecipe);
    const deleteRecipeLikesIntegration = new apiGateway.LambdaIntegration(deleteLikeRecipe);

    const recipeLikeEndpoints = singleRecipeEndpoints.addResource('like');
    recipeLikeEndpoints.addMethod('POST', postRecipeLikesIntegration);
    const deleteRecipeLikeEndpoints = recipeLikeEndpoints.addResource('{like_id}');
    recipeLikeEndpoints.addMethod('DELETE', deleteRecipeLikesIntegration);
    addCorsOptions(recipeLikeEndpoints);
  }
}

export function addCorsOptions(apiResource: apiGateway.IResource) {
  apiResource.addMethod('OPTIONS', new apiGateway.MockIntegration({
    integrationResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
        'method.response.header.Access-Control-Allow-Origin': "'*'",
        'method.response.header.Access-Control-Allow-Credentials': "'false'",
        'method.response.header.Access-Control-Allow-Methods': "'OPTIONS,GET,PUT,POST,DELETE'",
      },
    }],
    passthroughBehavior: apiGateway.PassthroughBehavior.NEVER,
    requestTemplates: {
      "application/json": "{\"statusCode\": 200}"
    },
  }), {
    methodResponses: [{
      statusCode: '200',
      responseParameters: {
        'method.response.header.Access-Control-Allow-Headers': true,
        'method.response.header.Access-Control-Allow-Methods': true,
        'method.response.header.Access-Control-Allow-Credentials': true,
        'method.response.header.Access-Control-Allow-Origin': true,
      },
    }]
  })
}
