import { useState } from 'react'
import LoginPage from './auth/Signin'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <LoginPage/>
    </>
  )
}

export default App
