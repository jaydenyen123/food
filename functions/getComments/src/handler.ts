import {APIGatewayProxyEvent} from 'aws-lambda';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocumentClient, GetCommand} from '@aws-sdk/lib-dynamodb'; 
import { comment } from '../../models/models';


class HttpError extends Error {
    status: number
}

class BadRequestError extends HttpError {
    status = 400;
}

export const getCommentsAPIEvent = async (event: APIGatewayProxyEvent): Promise<any> => {

    console.log('getComment started................');
    if(!event.pathParameters) throw new BadRequestError('There is no pathParam for recipe');
    const recipeId = event.pathParameters.id;
    const commentId = event.pathParameters.comment_id;

    const client = new DynamoDBClient();
    const documentClient = DynamoDBDocumentClient.from(client);

    try {

        const getCommand = new GetCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                recipeId: recipeId
            }
        })

        const response = await documentClient.send(getCommand);
        console.log('response is here');
        const body = response.Item?.body;
        console.log('body: ');
        console.log(body);
        const comment = body.comment.filter((comm: comment) => comm.commentId === commentId);
        return comment;

    } catch(e) {
        console.log(e);
        throw new Error('Error encountered');
    }
}