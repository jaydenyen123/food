import {APIGatewayProxyEvent} from 'aws-lambda';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocumentClient, GetCommand, UpdateCommand} from '@aws-sdk/lib-dynamodb'; 
import {Recipe} from '../../models/models';

class HttpError extends Error {
    status: number
}

class BadRequestError extends HttpError {
    status = 400;
}

export const deleteLikeAPIEvent = async (event: APIGatewayProxyEvent): Promise<any> => {

    console.log('deleteLike started................');

    const client = new DynamoDBClient();
    const documentClient = DynamoDBDocumentClient.from(client);

    try {
        console.log('........event.............');
        console.log(event);
        if(!event.pathParameters) throw new BadRequestError('event does not have pathParam to delete like from');
        const {id, like_id} = event.pathParameters;

        const getCommand = new GetCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                recipeId: id
            }
        })
        const response = await documentClient.send(getCommand);
        let recipe : Recipe;
        if(response.Item) {
            recipe = response.Item[0];
        } else {
            return {
                statusCode: 404,
                body: 'Recipe Not Found'
            }
        }
        console.log('recipe: ');
        console.log(recipe);
        const likes = recipe.likes;
        let foundLike = false;
        for(let i = 0; i < likes.length; i++) {
            if(likes[i].likeId === like_id) {
                likes.splice(i, 1);
                foundLike = true;
            }
        }
        if(!foundLike) {
            return {
                statusCode: 404,
                body: 'Likes Not Found'
            }            
        }
        const updateCommand = new UpdateCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                recipeId: id
            },
            UpdateExpression: 'set likes = :likes',
            ExpressionAttributeValues: {
                ':likes': likes
            },
            ReturnValues: "ALL_NEW"
        })
        const updateResponse = await documentClient.send(updateCommand);
        console.log(response); 
        return {
            statusCode: 200,
            body: JSON.stringify(updateResponse)
        }
    } catch(e: any) {
        return {
            statusCode: 400,
            body: e.message
        }
    }

}