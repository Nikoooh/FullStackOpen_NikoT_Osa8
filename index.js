const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { GraphQLError } = require('graphql')
const { v1: uuid } = require('uuid')

let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky', 
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  { 
    name: 'Sandi Metz', 
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },  
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'Demons',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

const typeDefs = `

  type Book {
    title: String!
    published: Int!
    author: String!
    id: ID!
    genres: [String]
  }

  type Author {
    name: String!
    bookCount: Int
    id: ID!
    born: Int
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
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (_, { author, genre }) => {
      if (author && genre) {
        return books.filter(book => book.author === author && book.genres.includes(genre))
      } else if (author) {
        return books.filter(book => book.author === author)
      } else if (genre) {
        return books.filter(book => book.genres.includes(genre))
      }
      return books
    },
    allAuthors: () => authors
  },
  Author: {
    bookCount: (root) => books.filter(x => x.author === root.name).length
  },
  Mutation: {
    addBook: (_, args) => {
      const book = { ...args, id: uuid() }
      books = books.concat(book)
      if (!authors.find(x => x.name === args.author)) {
        authors = authors.concat({name: args.author, id: uuid()})
      }
      return book
    },
    editAuthor: (_, args) => {

      const index = authors.findIndex(x => x.name === args.name)

      if (index === -1) {
        return null
      }

      if (!args.setBornTo || isNaN(args.setBornTo)) {
        throw new GraphQLError('Invalid year', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.setBornTo
          }
        })
      }

      authors = authors.map(author => {
        if (author.name !== args.name) {
          return author
        }
        return {...author, born: args.setBornTo}
      })

      const author = authors.find(x => x.name === args.name)
      return author
      
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})