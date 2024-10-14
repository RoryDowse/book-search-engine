// @ts-ignore
import BookInput from './typedefs'; // Used in saveBook mutation resolver
import { BookDocument } from '../models/Book.js';
import User, { UserDocument } from '../models/User.js';
import { signToken, AuthenticationError } from '../utils/auth.js'; 

const resolvers = {
    Query: {
        // Query to get a single user by ID or username
        me: async (_parent: any, { _id, username }: {_id?: string, username?: string}, context: any): Promise<UserDocument | null> => {
            // Check if user is authenticated 
            if (context.user) {

                // Find user by ID or username
                const foundUser = await User.findOne({ 
                    $or: [
                        { _id: context.user._id}, 
                        { _id }, 
                        { username }
                    ],
                });

                // If user is not found, throw an error
                if (!foundUser) {
                    throw new AuthenticationError('Cannot find a user with this id!');
                }
                return foundUser; // Return user if found
            }

            // If user is not authenticated, throw an error
            throw new AuthenticationError('You need to be logged in!');
        },
},

    Mutation: {
        // Mutation to create a new user
        addUser: async (_parent: any, args: any): Promise<{ token: string; user: UserDocument }> => {
            // Create a new user
            const user = await User.create(args);

            // if user is not created, throw an error
            if (!user) {
                throw new AuthenticationError('Something went wrong while creating the user!');
            }
            // Sign a token for the created user
            const token = signToken(user.username, user.password, user._id);

            // Return the token and user
            return { token, user };
        },

        // Mutation to login a user
        login: async (_parent: any, { email, password }: any): Promise<{ token: string; user: UserDocument } | null>  => {
            // Find user by username or email
            const user = await User.findOne({ email });

            // if user is not found, throw an error
            if (!user) {
                throw new AuthenticationError("Can't find this user.");
            }
            // Check if password is correct
            const correctPw = await user.isCorrectPassword(password);

            // if password is incorrect, throw an error
            if (!correctPw) {
                throw new AuthenticationError('Wrong password!');
            }
            // Sign a token for the user
            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        },

        // Mutation to save a book
        saveBook: async (_parent: any, { bookData }: { bookData: BookDocument }, context: any) => {
            // Check if user is authenticated
            if (context.user) {
                // Update the user's saved books array
              const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $addToSet: { savedBooks: bookData } }, 
                { new: true, runValidators: true }
              );
              return updatedUser; // Return the updated user
            } 
            // If user is not authenticated, throw an error
            throw new AuthenticationError('You need to be logged in!');
        },

        // Mutation to delete a book for the user's saved books array
        removeBook: async (_parent: any, { bookId }: { bookId: string }, context: any) => {
            // Check if user is authenticated
            if (context.user) {
            // Update the user's saved books array to remove the deleted book
            const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: { bookId } } }, // Remove book by bookId
            { new: true } // Return the updated user
            );
            
            // If user is not found, throw an error
            if (!updatedUser) {
            throw new AuthenticationError("Couldn't find user with this id!");
            }
            return updatedUser; // Return the updated user
        }
        // If user is not authenticated, throw an error
        throw new AuthenticationError('You need to be logged in!');
        },
    },
};

export default resolvers;