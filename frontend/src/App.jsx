import { useState } from 'react'
import './App.css'
import Dashboard from './components/Dashboard.jsx'
import LoginPage from './components/LoginPage.jsx'
import {
  clearAuthenticatedSession,
  hasAuthenticatedSession,
} from './services/auth.js'

function App() {
  const [session, setSession] = useState(() => {
    return hasAuthenticatedSession() ? { username: '' } : null
  })

  function handleAuthenticated(username) {
    if (hasAuthenticatedSession()) setSession({ username })
  }

  function handleSignOut() {
    clearAuthenticatedSession()
    setSession(null)
  }

  if (session && hasAuthenticatedSession()) {
    return (
      <Dashboard username={session.username} onSignOut={handleSignOut} />
    )
  }

  return <LoginPage onAuthenticated={handleAuthenticated} />
}

export default App
