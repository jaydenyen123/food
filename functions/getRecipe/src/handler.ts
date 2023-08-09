import {APIGatewayProxyEvent} from 'aws-lambda';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocumentClient, ScanCommand} from '@aws-sdk/lib-dynamodb'; 


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
        if(!event.body) throw new BadRequestError('Event does not have a body');
        const body = JSON.parse(event.body);
        console.log('........body.............');
        console.log(body);
        const scanCommand = new ScanCommand({
            TableName: process.env.TABLE_NAME
        })
        const response = await documentClient.send(scanCommand);
        if(response.Items) {
            console.log('........response items.............');
            return response.Items;
        }

    } catch(e) {
        console.log(e);
        throw new Error('Error encountered');
    }

}