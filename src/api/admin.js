const BASE = import.meta.env.VITE_API_BASE || 'https://aavie-backend.onrender.com'

async function req(path, options = {}) {
  const token = localStorage.getItem('adminToken')
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export const adminApi = {
  getDashboardStats:  ()         => req('/api/admin/dashboard/stats'),
  getUsers:           (params)   => req(`/api/admin/users?${new URLSearchParams(params)}`),
  getUser:            (id)       => req(`/api/admin/users/${id}`),
  getAssessmentStats: ()         => req('/api/admin/assessments/stats'),
  getArticles:        (params)   => req(`/api/admin/articles?${new URLSearchParams(params)}`),
  getArticle:         (id)       => req(`/api/admin/articles/${id}`),
  createArticle:      (data)     => req('/api/admin/articles', { method: 'POST', body: JSON.stringify(data) }),
  updateArticle:      (id, data) => req(`/api/admin/articles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteArticle:      (id)       => req(`/api/admin/articles/${id}`, { method: 'DELETE' }),
  getActivity:        ()         => req('/api/admin/activity'),
}