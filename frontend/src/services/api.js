import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

function handleError(error) {
  if (error.response) {
    const data = error.response.data
    const err = new Error(data?.detail || 'Request failed')
    err.status = error.response.status
    err.body = data
    throw err
  }
  throw error
}

async function request(path, options = {}) {
  try {
    const response = await client({ url: path, ...options })
    return response.data
  } catch (error) {
    handleError(error)
  }
}

export function login(credentials) {
  return request('/token/', {
    method: 'post',
    data: credentials,
  })
}

export function refreshToken(refresh) {
  return request('/token/refresh/', {
    method: 'post',
    data: { refresh },
  }).catch(() => null)
}

export async function authRequest(path, options, auth, setAuth) {
  const headers = {
    ...(options.headers || {}),
    Authorization: auth?.access ? `Bearer ${auth.access}` : undefined,
  }

  try {
    return await request(path, { ...options, headers })
  } catch (error) {
    if (error.status === 401 && auth?.refresh) {
      const refreshData = await refreshToken(auth.refresh)
      if (refreshData?.access) {
        const nextAuth = { ...auth, access: refreshData.access }
        localStorage.setItem('task-manager-auth', JSON.stringify(nextAuth))
        if (typeof setAuth === 'function') {
          setAuth(nextAuth)
        }
        return await request(path, {
          ...options,
          headers: { ...headers, Authorization: `Bearer ${refreshData.access}` },
        })
      }
    }
    throw error
  }
}

export function register(payload) {
  return request('/register/', {
    method: 'post',
    data: payload,
  })
}

export function verifyEmail(userId, token) {
  return request(`/verify-email/${userId}/${token}/`, {
    method: 'get',
  })
}

export function forgotPassword(payload) {
  return request('/forget-password/', {
    method: 'post',
    data: payload,
  })
}

export function resetPassword(payload) {
  return request('/reset-password/', {
    method: 'post',
    data: payload,
  })
}

export function fetchTasks(auth, setAuth) {
  return authRequest('/tasks/', { method: 'get' }, auth, setAuth)
}

export function createTask(payload, auth, setAuth) {
  return authRequest(
    '/tasks/',
    {
      method: 'post',
      data: payload,
    },
    auth,
    setAuth,
  )
}

export function updateTask(id, payload, auth, setAuth) {
  return authRequest(
    `/tasks/${id}/`,
    {
      method: 'put',
      data: payload,
    },
    auth,
    setAuth,
  )
}

export function deleteTask(id, auth, setAuth) {
  return authRequest(
    `/tasks/${id}/`,
    {
      method: 'delete',
    },
    auth,
    setAuth,
  )
}
