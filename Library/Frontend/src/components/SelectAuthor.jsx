import { useState } from 'react'
import Select from 'react-select';

const SelectAuthor = ({ authors, author, setAuthor, handleUpdate }) => {
  const [born, setBorn] = useState('')
  const authorOptions = authors.data.allAuthors.map((author) => {
    return {
      name: author.name,
      label: author.name
    }
  })

  return (
    <div>
      <Select
        defaultValue={author.value}
        onChange={selected => setAuthor(selected)}
        isSearchable
        options={authorOptions}
        placeholder='Select an author'
      />
      <br/>
      Born: <input type='number' onChange={({ target }) => setBorn(parseInt(target.value))}/>
      <br/>
      <br/>
      <button onClick={() => handleUpdate(born)}>Update author</button>
    </div>
  );
};

export default SelectAuthor;