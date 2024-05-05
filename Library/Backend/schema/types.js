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

  type userFavouriteGenreBooks {
    genre: String!
    books: [Book!]!
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
    userFavouriteGenre: userFavouriteGenreBooks!
    clearDb: String
  }

  type Subscription {
    bookAdded: Book!
  }
`

module.exports = typeDefs