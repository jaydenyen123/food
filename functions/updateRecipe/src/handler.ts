import {APIGatewayProxyEvent} from 'aws-lambda';
import {DynamoDBDocumentClient, GetCommand, UpdateCommand, UpdateCommandInput} from "@aws-sdk/lib-dynamodb"; 
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
        if(!event.pathParameters || !event.pathParameters.id) throw new BadRequestError('you did not specify which recipe to update');
        const id = event.pathParameters.id;
        if(!event.body) throw new BadRequestError('body is null, there is no content to update from');
        const body = JSON.parse(event.body);
        const updateExpression = craftUpdateExpression(body);
        const expressionAttributeValues = craftExpressionAttributeValue(body);
        console.log("update parameters are: ");
        console.log(updateExpression);
        console.log(expressionAttributeValues);
        const command : UpdateCommandInput = {
            TableName: process.env.TABLE_NAME,
            Key: {
                recipeId: id
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: "ALL_NEW",

        };
        if(body.name) {
            command.ExpressionAttributeNames = {"#name": "name"};
        }
        const updateCommand = new UpdateCommand(command);
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

const craftUpdateExpression = (attributes: any) : string => {
    let expression = "Set";
    if(attributes.description) {
        expression += ' description = :description,'
    }
    if(attributes.name) {
        expression += ' #name = :name,'
    }
    return expression.substring(0, expression.length - 1);
}

const craftExpressionAttributeValue = (attributes: any): {} => {

    let expression : any = {};
    if(attributes.description) {
        expression[":description"] = attributes.description;
    }
    if(attributes.name) {
        expression[":name"] = attributes.name;
    }
    return expression;
}