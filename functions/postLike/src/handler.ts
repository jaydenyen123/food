import {APIGatewayProxyEvent} from 'aws-lambda';
import {DynamoDBDocumentClient, GetCommand, UpdateCommand} from "@aws-sdk/lib-dynamodb"; 
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';

class HttpError extends Error {
    status: number
}

class BadRequestError extends HttpError {
    status = 400;
}

export const postLikeAPIEvent = async (event: APIGatewayProxyEvent): Promise<any> => {

    console.log('postLike started................');

    const client = new DynamoDBClient();
    const documentClient = DynamoDBDocumentClient.from(client);

    try {
        console.log('........event.............');
        console.log(event);
        if(!event.pathParameters || !event.pathParameters.id) {
            return {
                statusCode: 404,
                body: 'cannot find recipe to post likes to'
            }
        }
        const id = event.pathParameters.id;

        const getCommand = new GetCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                recipeId: id
            }
        })
        const response = await documentClient.send(getCommand);
        const recipe = response.Item;
        console.log('recipe: ');
        console.log(recipe);
        if(!recipe) {
            return {
                statusCode: 404,
                body: 'Cannot find recipe'
            }
        }
        const likes = recipe.likes;
        likes.push({likeId: uuidv4(), author: 'placeholder'})
        const updateCommand = new UpdateCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                recipeId: id
            },
            UpdateExpression: "set likes = :likes",
            ExpressionAttributeValues: {
                ":likes": likes,
              },
              ReturnValues: "ALL_NEW",

        })
        const updateResponse = await documentClient.send(updateCommand); 
        return {
            statusCode: 200,
            body: JSON.stringify(updateResponse)
        }
    } catch(e: any) {
        console.log(e);
        return {
            statusCode: 400,
            body: e.message
        }
    }

}