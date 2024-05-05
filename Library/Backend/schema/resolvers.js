const { GraphQLError, subscribe } = require('graphql')
const { PubSub } = require('graphql-subscriptions')
const jwt = require('jsonwebtoken')
const Author = require('../models/authors')
const Book = require('../models/books')
const User = require('../models/user')
const DataLoader = require('dataloader')

const pubsub = new PubSub()

const bookCountLoader = new DataLoader(async (authorIds) => {
  const counts = await Book.aggregate([
    {$match: {author: {$in: authorIds}}},
    {$group: { _id: `$author`, count: {$sum: 1}}}
  ])
  const countMap = counts.reduce((acc, { _id, count }) => {
    acc[_id.toString()] = count
    return acc
  }, {})
  return authorIds.map(id => countMap[id.toString()])
})

const resolvers = {
  Query: {
    clearDb: async () => {
      await Book.deleteMany({})
      await Author.deleteMany({})
      return "null"
    },

    bookCount: async () => {
      const books = await Book.find({})
      return books.length
    },

    authorCount: async () => {
      const authors = await Author.find({})
      return authors.length 
    },

    allBooks: async (_, { author, genre }) => {
      const books = await Book.find({}).populate('author')
      if (author && genre) {
        return books.filter(book => book.author.name === author && book.genres.includes(genre))
      } else if (author) {
        return books.filter(book => book.author.name === author)
      } else if (genre) {
        return books.filter(book => book.genres.includes(genre))
      }    

      return books
    },

    allAuthors: async () => {
      const authors = await Author.find({})
      return authors
    },

    userFavouriteGenre: async (_, args, context) => {
      try {
        if (!context.currentUser) return null
        const books = await Book.find({ genres: {$in: [context.currentUser.favouriteGenre.toLowerCase()]}}).populate('author')
        return { genre: context.currentUser.favouriteGenre, books: books }
      } catch (error) {
        throw new GraphQLError(error)
      }
    }
  },
  Author: {
    bookCount: async (root) => {
      return bookCountLoader.load(root._id)
    }
  },
  Mutation: {
    addBook: async (_, args, context) => {
      try {

        if (!context.currentUser) {
          const error = new Error('Token invalid or missing')
          error.name = 'JSONWebTokenError'
          throw error
        }

        if (args.title.length < 5) {
          const error = new Error("Title must be atleast 5 characters long")
          error.name = 'ValidationError'
          throw error
        }

        let author = await Author.findOne({name: args.author})

        if (!author) {
          if (args.author.length < 4) {
            const error = new Error("Author name must be atleast 4 characters long")
            error.name = 'ValidationError'
            throw error
          }
          author = new Author({name: args.author})
          await author.save()
        }

        const book = await new Book({...args, author: author._id}).populate('author')
        pubsub.publish('BOOK_ADDED', { bookAdded: book })
        return book.save()

      } catch (error) {
        if (error.name === 'ValidationError') {
          throw new GraphQLError(error)
        } else if (error.name === 'JSONWebTokenError') {
          throw new jwt.JsonWebTokenError(error)
        }
      }    
    },

    editAuthor: async (_, args, context) => {
      try {
        if (!context.currentUser) {
          const error = new Error('Token invalid or missing')
          error.name = 'JSONWebTokenError'
          throw error
        }

        if (!args.setBornTo || isNaN(args.setBornTo)) {
          const error = new Error('invalid year')
          error.name = 'ValidationError'
          throw error
        }

        const author = await Author.findOneAndUpdate({name: args.name}, {born: args.setBornTo}, {
          new: true
        });

        return author

      } catch (error) {
        if (error.name === 'ValidationError') {
          throw new GraphQLError(error, {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.setBornTo
            }
          })
        } else if (error.name === 'JSONWebTokenError') {
          throw new jwt.JsonWebTokenError(error)
        }
      }
    },

    createUser: async (_, args) => {
      try {
        if (args.name.length < 3) {
          const error = new Error('Username has to be atleast 3 characters long.')
          error.name = 'ValidationError'
          throw error
        } 

        if (!await User.findOne({username: args.name})) {
            const user = new User({username: args.name, favouriteGenre: args.favouriteGenre})
            return user.save()
        }

        throw new Error('Username taken')

      } catch (error) {
        throw new GraphQLError(error)
      }
    },

    login: async (_, args) => {
      try {
        
        const user = await User.findOne({ username: args.username })
        if (!user || args.password !== 'pass') {
          const error = new Error('wrong credentials')
          error.name = 'ValidationError'
          throw error
        }

        const userToken = {
          username: user.username,
          id: user._id
        }

        return { value: jwt.sign(userToken, process.env.SECRET) }

      } catch (error) {
        throw new GraphQLError(error)
      }
    }
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
    }
  }
}

module.exports = resolvers