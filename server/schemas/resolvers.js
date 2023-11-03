const { GraphQLError } = require('graphql')
const { signToken } = require('../utils/auth')
const { User } = require('../models')

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User
                    .findOne({ _id: context.user._id })
                    .select('-__v -password')
                    // .populate('book')
                
                    return userData
                }
            throw new GraphQLError('Login error')
        }
    },

    Mutation: {
        login: async (parent, { email, password }, context, index) => {
            const user = await User.findOne({ email })
            if (!user) {
                throw new GraphQLError('User login error')
            }

            const correctPassword = await user.isCorrectPassword(password)

            if(!correctPassword) {
                throw new GraphQLError('Login error')
            }

            const token = signToken(user)
            return { token, user }
        },

        addUser: async (parent, args) => {
            const user = await User.create(args)
            const token = signToken(user)

            return {
                token,
                user
            }
        },

        saveBook: async (parent, { bookData }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: BookData } },
                    { new: true } 
                );
                return updatedUser
            }
            throw new GraphQLError('Login error')
        },

        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                )
                return updatedUser
            }
            throw new GraphQLError('Authentication error')
        }
    }
}

module.exports = resolvers