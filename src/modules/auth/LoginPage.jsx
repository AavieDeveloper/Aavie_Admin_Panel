import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthStore, useToastStore } from '../../store'
import { loginAdmin } from '../../api/auth'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading]       = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const setAuth  = useAuthStore((s) => s.setAuth)
  const toast    = useToastStore((s) => s.addToast)
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    setLoading(true)
    setLoadingMsg('Connecting to server…')

    // Render free tier spins down after inactivity.
    // Cold start takes 30–50 seconds — show helpful message after 5 seconds.
    const slowTimer = setTimeout(() => {
      setLoadingMsg('Backend is waking up on Render… this takes up to 30 seconds on first request.')
    }, 5000)

    try {
      const res = await loginAdmin(data)

      // Block non-admin users from entering the admin panel
      if (res.role !== 'ADMIN') {
        toast('Access denied. Admin credentials required.', 'error')
        return
      }

      setAuth(res.token, { name: res.name, userId: res.userId, role: res.role })
      navigate('/')
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Invalid credentials'

      // Give a clear message if request timed out due to cold start
      if (err?.code === 'ECONNABORTED' || msg.toLowerCase().includes('timeout')) {
        toast('Server is still warming up. Please try again in 10 seconds.', 'error')
      } else {
        toast(msg, 'error')
      }
    } finally {
      clearTimeout(slowTimer)
      setLoading(false)
      setLoadingMsg('')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>A A V I E</div>
        <div className={styles.logoSub}>Admin Panel</div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className="field"
              placeholder="admin@aavie.life"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <span className={styles.err}>{errors.email.message}</span>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              className="field"
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <span className={styles.err}>{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
            disabled={loading}
          >
            {loading
              ? <div className="spinner" style={{ width: 16, height: 16 }} />
              : 'Sign in'
            }
          </button>

          {/* Render cold start warning — shown after 5 seconds of loading */}
          {loadingMsg && (
            <div style={{
              fontSize: 11,
              color: 'var(--amber)',
              textAlign: 'center',
              padding: '8px 12px',
              borderRadius: 8,
              background: 'var(--amberBg)',
              border: '1px solid var(--amber)',
              lineHeight: 1.6,
              marginTop: 8,
            }}>
              ⏳ {loadingMsg}
            </div>
          )}
        </form>

        <p className={styles.note}>
          AAVIE Admin · Women's Health Platform
        </p>
      </div>
    </div>
  )
}