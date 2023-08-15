import {APIGatewayProxyEvent} from 'aws-lambda';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocumentClient, GetCommand, UpdateCommand} from '@aws-sdk/lib-dynamodb'; 


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
        const like_id = event.pathParameters.like_id;

        const getCommand = new GetCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                recipeId: id
            }
        })
        const response = await documentClient.send(getCommand);
        let recipe : any;
        if(response.Item)
            recipe = response.Item[0];
        console.log('recipe: ');
        console.log(recipe);
        const comments = recipe.comments;
        for(let i = 0; i < comments.length; i++) {
            if(comments[i].id === like_id)
                comments.splice(i, 1);
        }
        const updateCommand = new UpdateCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                recipeId: id
            },
            UpdateExpression: 'set comment = :comment',
            ExpressionAttributeValues: {
                ':comment': comments
            },
            ReturnValues: "ALL_NEW"
        })
        const updateResponse = await documentClient.send(updateCommand);
        console.log(response); 
    } catch(e) {
        console.log(e);
        throw new Error('Error encountered');
    }

}