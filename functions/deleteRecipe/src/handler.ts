import {APIGatewayProxyEvent} from 'aws-lambda';
import {DynamoDBDocumentClient, DeleteCommand} from "@aws-sdk/lib-dynamodb"; 
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';

class HttpError extends Error {
    status: number
}

class BadRequestError extends HttpError {
    status = 400;
}

export const deleteRecipeAPIEvent = async (event: APIGatewayProxyEvent): Promise<any> => {

    console.log('deleteRecipe started................');

    const client = new DynamoDBClient();
    const documentClient = DynamoDBDocumentClient.from(client);

    try {
        console.log('........event.............');
        console.log(event);
        if(!event.pathParameters) throw new BadRequestError('event does not have pathParam to delete recipe from');
        const id = event.pathParameters.id;

        const deleteCommand = new DeleteCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                recipeId: id
            }
        })
        const response = await documentClient.send(deleteCommand);
        return {
            statusCode: 200,
            body: JSON.stringify(response)
        }
    } catch(e: any) {
        console.log(e);
        return {
            statusCode: 400,
            body: e.message
        }
    }

}