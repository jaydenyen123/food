import {APIGatewayProxyEvent} from 'aws-lambda';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocumentClient, ScanCommand, GetCommand} from '@aws-sdk/lib-dynamodb'; 


class HttpError extends Error {
    status: number
}

class BadRequestError extends HttpError {
    status = 400;
}

export const getRecipeAPIEvent = async (event: APIGatewayProxyEvent): Promise<any> => {

    console.log('getRecipe started................');

    const client = new DynamoDBClient();
    const documentClient = DynamoDBDocumentClient.from(client);

    try {
        console.log('........event.............');
        console.log(event);
        let response = null;
        if(event.pathParameters) {
            console.log("Looking for specific item");
            const id = event.pathParameters.id;
            const getCommand = new GetCommand({
                TableName: process.env.TABLE_NAME,
                Key: {
                    recipeId: id
                }
            })
            response = await documentClient.send(getCommand);
            console.log('........response.............');
            console.log(response);
            return {
                statusCode: 200,
                body: JSON.stringify(response.Item)
            }
        }
        const scanCommand = new ScanCommand({
            TableName: process.env.TABLE_NAME
        })
         response = await documentClient.send(scanCommand);
        if(response.Items) {
            console.log('........response.............');
            console.log(response);
            return {
                statusCode: 200,
                body: JSON.stringify(response.Items)
            }
        }

    } catch(e: any) {
        console.log(e);
        return {
            statusCode: 500,
            body: e.message
        }
    }

}