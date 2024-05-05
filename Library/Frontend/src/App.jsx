import { useEffect, useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Login from "./components/Login";
import Recommended from "./components/Recommended";
import Notification from "./components/Notification"
import { useMutation, useQuery, useSubscription, useApolloClient } from "@apollo/client";
import { ALL_AUTHORS, ALL_BOOKS, CREATE_BOOK, UPDATE_AUTHOR, LOGIN, USER_FAVOURITE_GENRE, BOOK_ADDED } from "./utils/queries";
import { updateBookCache } from "./utils/functions";

const App = () => {
  const [notification, setNotification] = useState({show: false, notification: {}})
  const [token, setToken] = useState(null)
  const [page, setPage] = useState("authors");
  const client = useApolloClient()
  const [ createBook ] = useMutation(CREATE_BOOK, {
    refetchQueries: [{ query: ALL_AUTHORS }, { query: ALL_BOOKS }]
  })
  
  const [ updateAuthor ] = useMutation(UPDATE_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }]
  })

  const [ login, result ] = useMutation(LOGIN, {
    onError: (error) => {
      console.log(error)
    },
    onCompleted: (data) => {
      console.log(data)
      setPage('authors')
    },
  })

  const handleLogout = () => {
    setToken(null)
    localStorage.clear()
    if (page === 'add' || page === 'recommended') setPage('authors')
  }

  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)
  const userFavouriteGenre = useQuery(USER_FAVOURITE_GENRE)

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const bookAdded = data.data.bookAdded
      setNotification({show: true, notification: data})
      updateBookCache(client.cache, { query: ALL_BOOKS }, bookAdded)
      setTimeout(() => {
        setNotification({show: false, notification: {}})
      }, 5000);
    },
  })

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value
      setToken(token)
      localStorage.setItem('library-user', token)
    }

  }, [result.data])

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {(token) ? 
          <>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => setPage('recommended')}>recommended</button>
            <button onClick={handleLogout}>logout</button>
          </>
        :
          <button onClick={() => setPage('login')}>login</button>
        }
        
        
      </div>

      {(authors.loading) ?
        <>loading...</>
      :
        (authors.data.allAuthors) ?
          <Authors show={page === 'authors'} authors={authors} updateAuthor={updateAuthor} />
        :
          <></>
      }  
      
      <Books show={page === 'books'} books={books} />    
      <NewBook show={page === 'add'} createBook={createBook} token={token}/>
      <Recommended show={page === 'recommended'} favouriteGenre={userFavouriteGenre} />
      <Login show={page === 'login'} login={login} />

      <Notification notification={notification}/>
    </div>
  );
};

export default App;
