import { gql } from "@apollo/client"
import { BOOK_DETAILS } from './fragments'

export const ALL_AUTHORS = gql`
    query {
      allAuthors {
        name,
        born,
        bookCount
      }
    }
  `

export const ALL_BOOKS = gql`
    query {
      allBooks {
        ...BookDetails
      }
    }
    ${BOOK_DETAILS}
  `

export const CREATE_BOOK = gql`
    mutation createBook($title: String!, $author: String!, $published: Int!, $genres: [String]) {
      addBook (
        title: $title,
        author: $author,
        published: $published,
        genres: $genres
      ) {
        title
        published
        genres
      }
    }
  `

export const UPDATE_AUTHOR = gql`
    mutation updateAuthor($name: String!, $born: Int!) {
      editAuthor (
        name: $name,
        setBornTo: $born
      ) {
        name,
        born
      }
    }
  `

export const LOGIN = gql`
    mutation login($username: String!, $password: String!) {
      login (
        username: $username
        password: $password
      ) {
        value
      }
    }
  `

export const GET_BOOKS_IN_GENRE = gql`
    query AllBooks($genre: String)  {
      allBooks(
        genre: $genre
      ) {
        ...BookDetails
      }
    }
    ${BOOK_DETAILS}
  `

export const USER_FAVOURITE_GENRE = gql`
    query {  
      userFavouriteGenre {
        genre
        books {
          ...BookDetails
        }
      }
    }
    ${BOOK_DETAILS}
  `

export const BOOK_ADDED = gql`
  subscription BookAdded {
    bookAdded {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`