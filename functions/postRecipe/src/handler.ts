import {APIGatewayProxyEvent} from 'aws-lambda';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocumentClient, PutCommand} from '@aws-sdk/lib-dynamodb'; 


class HttpError extends Error {
    status: number
}

class BadRequestError extends HttpError {
    status = 400;
}

export const postRecipeAPIEvent = async (event: APIGatewayProxyEvent): Promise<any> => {

    console.log('getRecipe started................');

    const client = new DynamoDBClient();
    const documentClient = DynamoDBDocumentClient.from(client);

    try {
        console.log('........event.............');
        console.log(event);
        if(!event.body) throw new BadRequestError('Event does not have a body');
        const body = JSON.parse(event.body);
        console.log('........body.............');
        console.log(body);
        console.log('..........item');
        const recipe = {
            recipeId: '',
            ...body
        }
        console.log(recipe);
        const scanCommand = new PutCommand({
            TableName: process.env.TABLE_NAME,
            Item: recipe
        })

        const response = await documentClient.send(scanCommand);
        return response;

    } catch(e) {
        console.log(e);
        throw new Error('Error encountered');
    }

}