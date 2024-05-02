const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { GraphQLError } = require('graphql')
const mongoose = require('mongoose')
const { books, authors } = require('./utils/variables')
const Author = require('./models/authors')
const Book = require('./models/books')
const User = require('./models/user')
const config = require('./config/config') 
const jwt = require('jsonwebtoken')

mongoose.connect(config.MONGODB_URI).then(() => {
  console.log('connected to MongoDB');
}).catch((error) => {
  console.log('error connecting to MongoDB');
})

const typeDefs = `

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    bookCount: Int
    id: ID!
    born: Int
  }

  type User {
    username: String!
    favouriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String]
    ): Book

    editAuthor(
      name: String
      setBornTo: Int
    ): Author

    createUser(
      name: String!
      favouriteGenre: String!
    ): User

    login(
      username: String!
      password: String!
    ): Token
  }

  type Query {
    dummy: Int
    bookCount: Int
    authorCount: Int
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }
`

const resolvers = {
  Query: {
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
    }

  },
  Author: {
    bookCount: async (root) => {
      const books = await Book.find({}).populate('author') 
      return books.filter(x => x.author.name === root.name).length
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

        const book = new Book({...args, author: author._id})
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
          console.log("toimiiks?");
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

        return { value: jwt.sign(userToken, process.env.SECRET)}

      } catch (error) {
        throw new GraphQLError(error)
      }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith('Bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), process.env.SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})