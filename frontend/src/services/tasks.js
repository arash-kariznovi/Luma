const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${apiBaseUrl.replace(/\/+$/, '')}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    })
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Unable to reach the task API. Check that the API is running.', {
        cause: error,
      })
    }
    throw error
  }

  const responseText = await response.text()
  let payload = null
  if (responseText) {
    try {
      payload = JSON.parse(responseText)
    } catch {
      if (response.ok) throw new Error('The task API returned an invalid response.')
    }
  }

  if (!response.ok) {
    const detail = payload?.detail
    const message = typeof detail === 'string'
      ? detail
      : Array.isArray(detail)
        ? detail.map((item) => item.msg).filter(Boolean).join(' ')
        : ''
    throw new Error(message || `Task request failed (HTTP ${response.status}).`)
  }

  return payload
}

export function getTasks() {
  return request('/tasks')
}

export function createTask(title, description) {
  return request('/tasks', {
    method: 'POST',
    body: JSON.stringify({ title, description }),
  })
}

export function updateTaskStatus(id, status) {
  return updateTask(id, { status })
}

export function updateTask(id, changes) {
  return request(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  })
}

export function deleteTask(id) {
  return request(`/tasks/${id}`, { method: 'DELETE' })
}