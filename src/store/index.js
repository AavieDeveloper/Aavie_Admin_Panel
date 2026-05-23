import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      adminUser: null,
      setAuth: (token, user) => set({ token, adminUser: user }),
      clearAuth: () => set({ token: null, adminUser: null }),
    }),
    { name: 'aavie-admin-auth' }
  )
)

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: next })
        document.documentElement.setAttribute('data-theme', next)
      },
      initTheme: () => {
        const t = get().theme
        document.documentElement.setAttribute('data-theme', t)
      },
    }),
    { name: 'aavie-admin-theme' }
  )
)

export const useToastStore = create((set) => ({
  toasts: [],
  addToast: (msg, type = 'info') => {
    const id = Date.now()
    set((s) => ({ toasts: [...s.toasts, { id, msg, type }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter(t => t.id !== id) })), 3500)
  },
}))
