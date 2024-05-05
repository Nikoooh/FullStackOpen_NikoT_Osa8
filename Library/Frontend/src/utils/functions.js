export const updateBookCache = (cache, bookQuery, addedBook) => {

  const isUniqBook = (books) => {
    let seenBooks = new Set()
    return books.filter((book) => {
      return seenBooks.has(book.title) ? false : seenBooks.add(book)
    })
  }

  cache.updateQuery(bookQuery, ({ allBooks }) => {
    return {
      allBooks: isUniqBook(allBooks.concat(addedBook))
    }
  })


}