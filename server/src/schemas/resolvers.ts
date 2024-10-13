import Book, { IBook } from '../models/Book.js';
import User, { UserDocument } from '../models/User.js';
import { signToken, AuthenticationError } from '../utils/auth.js'; 

const resolvers = {
    Query: {
        // Query to get a single user by ID or username
        getSingleUser: async (_parent: any, { _id, username }: {_id?: string, username?: string}): Promise<typeof User | null> => {
            // Check if user is authenticated 
            // Use the User model to fins a user
            const params = _id ? { _id } : { username };
            return User.findOne(params);
        },
},

    Mutation: {
        // Mutation to create a new user
        createUser: async (_parent: any, args: any): Promise<UserDocument | null> => {
            const user = await User.create(args);
            return user;
        },
    }
};