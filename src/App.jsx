import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useThemeStore, useAuthStore } from './store'
import { Sidebar, ToastContainer } from './components/Layout'
import LoginPage from './modules/auth/LoginPage'
import DashboardPage from './modules/dashboard/DashboardPage'
import UsersPage from './modules/users/UsersPage'
import AssessmentsPage from './modules/users/AssessmentsPage'
import ArticlesPage from './modules/articles/ArticlesPage'
import PublishPage from './modules/articles/PublishPage'

import QuestionsPage from './modules/questions/QuestionsPage'

import styles from './App.module.css'

function RequireAuth() {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <Outlet />
}

function AdminLayout() {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <Outlet />
      </div>
    </div>
  )
}

export default function App() {
  const initTheme = useThemeStore((s) => s.initTheme)

  useEffect(() => {
    initTheme()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AdminLayout />}>
            <Route path="/"            element={<DashboardPage />} />
            <Route path="/users"       element={<UsersPage />} />
            <Route path="/assessments" element={<AssessmentsPage />} />
            <Route path="/articles"    element={<ArticlesPage />} />
            <Route path="/publish"     element={<PublishPage />} />
            <Route path="/publish/:id" element={<PublishPage />} />
            <Route path= "/questions" element={<QuestionsPage /> }/>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )
}
