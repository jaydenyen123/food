export class Recipe {
    recipeId: string;
    picture?: any;
    description?: string;
    comments: Comment[];
    likes: Like[];
    name: string;
}

export class Comment {
    commentId: string;
    commentContent: string;
    author: string;
}


export class Like {
    likeId: string;
    author: string;
}
