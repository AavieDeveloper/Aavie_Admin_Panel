import axios from 'axios'

export const API_BASE = import.meta.env.VITE_API_BASE || 'https://aavie-backend.onrender.com'


const client = axios.create({
  baseURL: API_BASE,
  timeout: 60_000,   
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request
client.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('aavie-admin-auth')
    if (raw) {
      const { state } = JSON.parse(raw)
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`
      }
    }
  } catch {}
  return config
})

// Redirect to login on 401
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('aavie-admin-auth')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)


// Ping backend on admin panel load so it is warm before login
export const wakeUpBackend = async () => {
  try {
    console.log('🔥 Waking up Render backend...')
    await axios.get(`${API_BASE}/api/user/health`, { timeout: 60_000 })
    console.log('✅ Backend is awake')
  } catch {
    console.log('⏳ Backend warming up — first request may be slow')
  }
}


export default client
