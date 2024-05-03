import { useEffect, useState } from "react"
import { useQuery } from "@apollo/client"
import { GET_BOOKS_IN_GENRE } from "../utils/queries"

const Books = ({ show, books }) => {

  const [filter, setFilter] = useState('')
  const { data, loading, refetch } = useQuery(GET_BOOKS_IN_GENRE, { variables: { genre: filter }})
  
  useEffect(() => {
    refetch({genre: filter})
  }, [filter])
  
  if (!show) return null
  if (books.loading || loading) return <div>loading....</div> 

  const allBooks = books.data.allBooks
  
  const getGenres = () => {
    const allGenres = new Set()
    allBooks.forEach((book) => {
      book.genres.forEach((genre) => allGenres.add(genre))
    })
    return Array.from(allGenres)
  }

  const bookGenres = getGenres()

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr style={{textAlign: "left"}}>
            <th>title</th>
            <th>author</th>
            <th>published</th>
          </tr>
          {(filter) ? 
            <>
              {data.allBooks.map((book) => (
                <tr key={book.title}>
                  <td>{book.title}</td>
                  <td>{book.author.name}</td>
                  <td>{book.published}</td>
                </tr>
              ))}
            </>
          :
            <>
              {allBooks.map((book) => (
                <tr key={book.title}>
                  <td>{book.title}</td>
                  <td>{book.author.name}</td>
                  <td>{book.published}</td>
                </tr>
              ))}
            </>
          }
          
        </tbody>
      </table>
      <div style={{marginTop: '15px'}}> 
        {bookGenres.map((genre, idx) => {
          return (
            <button key={idx} onClick={() => setFilter(genre)}>{genre}</button>
          )
        })}
        <button onClick={() => setFilter('')}>All genres</button>
      </div>
    </div>
  )
}

export default Books
