import React, { useState, useEffect } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'

const Notification = ({message}) => {
  if ( message === null)
    return null

  if ( message.error )
    return (
      <div className='error'>
        {message.message}
      </div>
    )
  if ( !message.error )
  return ( 
    <div className='message'>
      {message.message}
    </div>
  )
}

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')
  const [message, setMessage] = useState(null)

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )  
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({
        username, password,
      })

      window.localStorage.setItem(
        'loggedBlogappUser', JSON.stringify(user)
      )
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      setMessage({message:'Wrong username or Password', error: true})
      setTimeout(() => {
        setMessage(null)
      }, 5000)
    }
    console.log('logging with', username, password)
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
  }

  const addBlog = async (event) => {
    event.preventDefault()
    const blogObject = {
      title,
      author,
      url,
    }

    const returnedBlog = await blogService.create(blogObject)
    setMessage({message: `a new blog ${title} by ${author} added`, error: false})
    setTimeout(() => {
      setMessage(null)
    }, 5000)
    setBlogs(blogs.concat(returnedBlog))
    setTitle('')
    setAuthor('')
    setUrl('')
  }

  const loginForm = () => {
    return (
      <div>
        <h2>Log in to application</h2>
        <form onSubmit={handleLogin}>
          <div>
            username
              <input
              type="text"
              value={username}
              name="Username"
              onChange={({ target }) => setUsername(target.value)}
            />
          </div>
          <div>
            password
              <input
              type="password"
              value={password}
              name="Password"
              onChange={({ target }) => setPassword(target.value)}
            />
          </div>
          <button type="submit">login</button>
        </form>
      </div>
    )
  }

  const blogForm = () => {
    return (
    <div>
      <h2>blogs</h2>
      <p>
        {user.username} is logged in<button onClick={handleLogout}>logout</button>
      </p>
      <h2>Create New</h2>
      <form onSubmit={addBlog}>
        title:<input value={title} onChange={(event) => setTitle(event.target.value)} /><br/>
        author:<input value={author} onChange={(event) => setAuthor(event.target.value)} /><br/>
        url:<input value={url} onChange={(event) => setUrl(event.target.value)} /><br />
        <button type='submit'>create</button>
      </form>
      {blogs.map(blog =>
        <Blog key={blog.id} blog={blog} />
      )}
    </div>
    )
  }

  return (
    <div>
      <Notification message={message} />
      {user === null ?
        loginForm() :
        blogForm()
      }
    </div>
  )
}

export default App