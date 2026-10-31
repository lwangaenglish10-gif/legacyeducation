const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const API_BASE_URL = configuredApiBaseUrl
  ? (() => {
      const baseUrl = configuredApiBaseUrl.replace(/\/+$/, '')
      return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`
    })()
  : import.meta.env.DEV
    ? '/api'
    : ''

function getApiUrl(endpoint) {
  if (!API_BASE_URL) {
    throw new Error(
      'VITE_API_BASE_URL must be set to the Render API URL in production.'
    )
  }

  return `${API_BASE_URL}${endpoint}`
}

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

  const response = await fetch(getApiUrl(endpoint), {
    ...options,
    cache: 'no-store',
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
  mediaUrl: (url) => {
    if (!url) return url
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(url)) return url

    if (!API_BASE_URL) {
      throw new Error(
        'VITE_API_BASE_URL must be set to the Render API URL in production.'
      )
    }

    const apiOrigin = API_BASE_URL.startsWith('http')
      ? new URL(API_BASE_URL).origin
      : window.location.origin

    return new URL(url, apiOrigin).toString()
  },

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

  // Published stories and articles
  getContent: () => request('/content'),
  getMyContent: () => request('/content/my-submissions'),
  getAdminContent: () => request('/content/admin/review'),

  createContent: (fields) =>
    request('/content', {
      method: 'POST',
      body: JSON.stringify(fields),
    }),

  updateContent: (id, fields) =>
    request(`/content/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(fields),
    }),

  deleteContent: (id) =>
    request(`/content/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  // Published media library
  getMedia: () => request('/media'),

  // Admin media library, including drafts
  getAdminMedia: () => request('/media/admin/library'),

  uploadMedia: (formData) =>
    request('/media/upload', {
      method: 'POST',
      body: formData,
    }),

  updateMedia: (id, fields) =>
    request(`/media/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(fields),
    }),

  deleteMedia: (id) =>
    request(`/media/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  // Learning modules and lessons
  getLearningModules: () => request('/learning-modules'),
  getLearningModule: (id) =>
    request(`/learning-modules/${encodeURIComponent(id)}`),
  createLearningModule: (fields) =>
    request('/learning-modules', {
      method: 'POST',
      body: JSON.stringify(fields),
    }),
  getLessons: (moduleId) =>
    request(`/lessons/module/${encodeURIComponent(moduleId)}`),
  createLesson: (fields) =>
    request('/lessons', {
      method: 'POST',
      body: JSON.stringify(fields),
    }),
  getLessonProgress: () => request('/lessons/progress/modules'),
  completeLesson: (id) =>
    request(`/lessons/${encodeURIComponent(id)}/complete`, {
      method: 'POST',
    }),

  subscribeNewsletter: (email, consent) =>
    request('/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email, consent }),
    }),
}

export default api
