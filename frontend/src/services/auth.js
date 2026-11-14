const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
let authenticated = false

function getErrorMessage(payload) {
  if (typeof payload?.detail === 'string') return payload.detail
  if (typeof payload?.message === 'string') return payload.message
  if (Array.isArray(payload?.detail)) {
    return payload.detail
      .map((item) => item.msg)
      .filter((message) => typeof message === 'string')
      .join(' ')
  }
  return ''
}

export async function signIn(username, password) {
  authenticated = false
  const form = new URLSearchParams({
    grant_type: 'password',
    username,
    password,
  })

  let response
  try {
    response = await fetch(`${apiBaseUrl.replace(/\/+$/, '')}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: form,
    })
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Unable to reach the login API at ${apiBaseUrl}. Check that the API is running and allows requests from this app.`,
        { cause: error },
      )
    }
    throw error
  }

  const responseText = await response.text()
  let payload = null
  if (responseText) {
    try {
      payload = JSON.parse(responseText)
    } catch {
      if (response.ok) {
        throw new Error('The login API returned an invalid response.')
      }
    }
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(payload) || `Sign in failed (HTTP ${response.status}).`,
    )
  }

  authenticated = true
  return payload
}

export async function register(email, username, password) {
  let response
  try {
    response = await fetch(`${apiBaseUrl.replace(/\/+$/, '')}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ email, username, password }),
    })
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Unable to reach the registration API at ${apiBaseUrl}. Check that the API is running and allows requests from this app.`,
        { cause: error },
      )
    }
    throw error
  }

  const responseText = await response.text()
  let payload = null
  if (responseText) {
    try {
      payload = JSON.parse(responseText)
    } catch (error) {
      if (response.ok) {
        throw new Error('The registration API returned an invalid response.', {
          cause: error,
        })
      }
    }
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(payload) ||
        `Registration failed (HTTP ${response.status}).`,
    )
  }

  return payload
}

export function hasAuthenticatedSession() {
  return authenticated
}

export function clearAuthenticatedSession() {
  authenticated = false
}
