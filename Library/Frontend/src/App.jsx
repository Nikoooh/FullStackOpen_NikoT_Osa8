import { useEffect, useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Login from "./components/Login";
import Recommended from "./components/Recommended";
import { useMutation, useQuery } from "@apollo/client";
import { ALL_AUTHORS, ALL_BOOKS, CREATE_BOOK, UPDATE_AUTHOR, LOGIN, USER_FAVOURITE_GENRE } from "./utils/queries";

const App = () => {
  const [token, setToken] = useState(null)
  const [page, setPage] = useState("authors");
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
    if (page === 'add') setPage('authors')
  }

  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)
  const userFavouriteGenre = useQuery(USER_FAVOURITE_GENRE)

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
        <></>
      :
        <Authors show={page === 'authors'} authors={authors} updateAuthor={updateAuthor} />
      }  
      
      <Books show={page === 'books'} books={books} />    
      <NewBook show={page === 'add'} createBook={createBook} token={token}/>
      <Recommended show={page === 'recommended'} favouriteGenre={userFavouriteGenre} />
      <Login show={page === 'login'} login={login} />
    </div>
  );
};

export default App;
