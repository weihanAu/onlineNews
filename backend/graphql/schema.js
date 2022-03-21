const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        posts: [Post!]!
    }

    input UserInputData {
        email: String!
        name: String!
        password: String!
    }
    
    input UserPostData {
        title:String!
        content:String!
        imageUrl: String!
    }

    type AuthData {
        userId:String!
        token:String!
    }

    type PostData {
        posts:[Post!]!
        totalPosts:Int!
    }

    type RootQuery {
        login(email: String!, password: String!): AuthData!
        getPosts(page:Int):PostData!
        getPost(id:String!):Post!
        getStatus:String!
    }
    
    type RootMutation {
        createUser(userInput: UserInputData): User!
        createPost(inputPost: UserPostData):Post!
        editPost(id:String!,userInput:UserPostData!):Post!
        deletePost(id:String!):Boolean! 
        setStatus(status:String!):String!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
