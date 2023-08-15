import {APIGatewayProxyEvent} from 'aws-lambda';
import {DynamoDBDocumentClient, GetCommand, UpdateCommand} from "@aws-sdk/lib-dynamodb"; 
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';



class HttpError extends Error {
    status: number
}

class BadRequestError extends HttpError {
    status = 400;
}

export const updateRecipeAPIEvent = async (event: APIGatewayProxyEvent): Promise<any> => {

    console.log('updateRecipe started................');

    const client = new DynamoDBClient();
    const documentClient = DynamoDBDocumentClient.from(client);

    try {
        console.log('........event.............');
        console.log(event);
        if(!event.pathParameters) throw new BadRequestError('event does not have pathParam to delete comment from');
        const id = event.pathParameters.id;
        if(!event.body) throw new BadRequestError('body is null');
        const body = JSON.parse(event.body);
        const updateCommand = new UpdateCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                recipeId: id
            },
            UpdateExpression: "set description = :description",
            ExpressionAttributeValues: {
                ":description": body.description,
              },
              ReturnValues: "ALL_NEW",

        })
        const updateResponse = await documentClient.send(updateCommand); 
        return updateResponse;
    } catch(e) {
        console.log(e);
        throw new Error('Error encountered');
    }

}