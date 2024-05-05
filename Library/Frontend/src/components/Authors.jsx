import { useState } from 'react'
import SelectAuthor from './SelectAuthor'

const Authors = ({ show, authors, updateAuthor }) => {

  const [author, setAuthor] = useState({name: authors.data.allAuthors[0].name, label: authors.data.allAuthors[0].name})
  const handleUpdate = (born) => {
    if (!born || isNaN(born)) return
    const getAuthor = authors.data.allAuthors.find((x) => x.name === author.name)
    updateAuthor({variables: {...getAuthor, born: born}})
  }

  if (!show) return null

  return (
    <div>
      <h2>authors</h2>
      <table style={{textAlign: 'left'}}>
        <tbody>
          <tr>
            <th>name</th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>    
        <SelectAuthor authors={authors} author={author} setAuthor={setAuthor} handleUpdate={handleUpdate}/>     
      </div>
    </div>
  )
}

export default Authors