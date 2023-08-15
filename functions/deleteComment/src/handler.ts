import {APIGatewayProxyEvent} from 'aws-lambda';
import {DynamoDBDocumentClient, GetCommand, UpdateCommand} from "@aws-sdk/lib-dynamodb"; 
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import { recipe } from '../../models/models';



class HttpError extends Error {
    status: number
}

class BadRequestError extends HttpError {
    status = 400;
}

export const deleteCommentAPIEvent = async (event: APIGatewayProxyEvent): Promise<any> => {

    console.log('deleteComment started................');

    const client = new DynamoDBClient();
    const documentClient = DynamoDBDocumentClient.from(client);

    try {
        console.log('........event.............');
        console.log(event);
        if(!event.pathParameters) throw new BadRequestError('event does not have pathParam to delete comment from');
        const id = event.pathParameters.id;
        const comment_id = event.pathParameters.comment_id;

        const getCommand = new GetCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                recipeId: id
            }
        })
        const response = await documentClient.send(getCommand);
        const body = response.Item;
        console.log('recipe: ');
        const recipe = body;
        console.log(recipe);
        for(let i = 0; i < recipe?.comments.length; i++) {
            if(recipe?.comments[i].id === comment_id)
                recipe.comments.splice(i, 1);
        }
        const updateCommand = new UpdateCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                recipeId: id
            },

        })
        const updateResponse = await documentClient.send(updateCommand); 
    } catch(e) {
        console.log(e);
        throw new Error('Error encountered');
    }

}