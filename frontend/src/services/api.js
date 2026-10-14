const API_BASE_URL = '/api'

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('legacyeducation_token')

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : options.body
        ? { 'Content-Type': 'application/json' }
        : {}),
    ...(options.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      data.message || data.error || `Request failed (${response.status})`
    )
  }

  return data
}

export const api = {
  health: () => request('/health'),

  register: (user) =>
    request('/users/register', {
      method: 'POST',
      body: JSON.stringify(user),
    }),

  login: (credentials) =>
    request('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getMe: () => request('/users/me'),

  adminTest: () => request('/users/admin-test'),

  getContent: () => request('/content'),
createContent: (content) =>
  request('/content', {
    method: 'POST',
    body: JSON.stringify(content),
  }),
  getMedia: () => request('/media'),

  getLearningModules: () => request('/learning-modules'),
  getLessons: (moduleId) => request(`/lessons/module/${moduleId}`),
}

export default api