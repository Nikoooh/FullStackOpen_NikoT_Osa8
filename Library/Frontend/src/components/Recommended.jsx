
const Recommended = ({ show, favouriteGenre }) => {

  if (!show) return null
  if (favouriteGenre.loading) return <div>loading...</div>

  return (
    <div>
      <h2>Recommendations</h2>
      <div>
        <p>Books in your favourite genre <span style={{fontWeight: 'bold'}}>{favouriteGenre.data.userFavouriteGenre.genre}</span></p>
        <div>
          <table>
            <tbody>
              <tr style={{textAlign: "left"}}>
                <th>title</th>
                <th>author</th>
                <th>published</th>
              </tr>
              <>
                {favouriteGenre.data.userFavouriteGenre.books.map((book) => (               
                  <tr key={book.title}> 
                    <td>{book.title}</td>
                    <td>{book.author.name}</td>
                    <td>{book.published}</td>
                  </tr>                
                ))}
              </>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Recommended