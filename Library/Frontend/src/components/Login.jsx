
const Login = ({ show, login }) => {

  if (!show) return null

  const handleClick = (e) => {
    e.preventDefault()
    const username = e.target.username.value
    const password = e.target.password.value
    
    login({ variables: { username, password }})
  }

  return (
    <div>
      <h2>Login</h2>
      <div>
        <form onSubmit={handleClick}>
          username: <input placeholder='username' name='username'/>
          <br/>
          password: <input placeholder='password' name='password' type="password"/>
          <b/><br/>
          <button type='submit'>Login</button>
        </form>
      </div>     
    </div>
  )
}

export default Login