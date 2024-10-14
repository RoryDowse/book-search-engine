import Book, { BookDocument } from '../models/Book.js';
import User, { UserDocument } from '../models/User.js';
import { signToken, AuthenticationError } from '../utils/auth.js'; 

const resolvers = {
    Query: {
        // Query to get a single user by ID or username
        getSingleUser: async (_parent: any, { _id, username }: {_id?: string, username?: string}, context: any): Promise<UserDocument | null> => {
            // Check if user is authenticated 
            if (context.user) {
                const foundUser = await User.findOne({ 
                    $or: [
                        { _id: context.user._id}, 
                        {_id }, 
                        { username }
                    ],
                });

                if (!foundUser) {
                    throw new AuthenticationError('Cannot find a user with this id!');
                }
                return foundUser;
            }
            throw new AuthenticationError('You need to be logged in!');
        },
},

    Mutation: {
        // Mutation to create a new user
        createUser: async (_parent: any, args: any): Promise<{ token: string; user: UserDocument }> => {
            const user = await User.create(args);

            if (!user) {
                throw new AuthenticationError('Something went wrong while creating the user!');
            }
            const token = signToken(user.username, user.email, user._id);

            return { token, user };
        },

        // Mutation to login a user
        login: async (_parent: any, { username, email, password }: any): Promise<{ token: string; user: UserDocument } | null>  => {
            const user = await User.findOne({ $or: [{ username }, { email }] });
            if (!user) {
                throw new AuthenticationError("Can't find this user.");
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Wrong password!');
            }
            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        },

        // Mutation to save a book
        saveBook: async (_parent: any, { book }: { book: BookDocument }, context: any) => {
            if (context.user) {
              const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $addToSet: { savedBooks: book } },
                { new: true, runValidators: true }
              );
              return updatedUser;
            } 
            throw new AuthenticationError('You need to be logged in!');
    },

    // Mutation to delete a book
    deleteBook: async (_parent: any, { bookId }: { bookId: string }, context: any) => {
        if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        
        if (!updatedUser) {
          throw new AuthenticationError("Couldn't find user with this id!");
        }
        return updatedUser;
    }
    throw new AuthenticationError('You need to be logged in!');
},
},
};

export default resolvers;