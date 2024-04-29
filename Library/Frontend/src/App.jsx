import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import { useMutation, useQuery } from "@apollo/client";
import { ALL_AUTHORS, ALL_BOOKS, CREATE_BOOK, UPDATE_AUTHOR } from "./utils/queries";

const App = () => {
  const [page, setPage] = useState("authors");
  const [ createBook ] = useMutation(CREATE_BOOK, {
    refetchQueries: [{ query: ALL_AUTHORS }, { query: ALL_BOOKS }]
  })
  
  const [ updateAuthor ] = useMutation(UPDATE_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }]
  })

  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        <button onClick={() => setPage("add")}>add book</button>
      </div>

      {(authors.loading) ?
        <></>
      :
        <Authors show={page === "authors"} authors={authors} updateAuthor={updateAuthor} />
      }  
      
      <Books show={page === "books"} books={books}/>
      <NewBook show={page === "add"} createBook={createBook}/>
    </div>
  );
};

export default App;
