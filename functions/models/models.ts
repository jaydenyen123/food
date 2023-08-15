export class recipe {
    recipeId: string;
    picture: any;
    description: string;
    comments: comment[];
    likes: likes[];
}

export class comment {
    commentId: string;
    commentContent: string;
    author: string;
}


export class likes {
    likeId: string;
    author: string;
}
