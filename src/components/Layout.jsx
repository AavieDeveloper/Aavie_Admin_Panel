import { NavLink, useNavigate } from 'react-router-dom'
import { useThemeStore, useAuthStore, useToastStore } from '../store'
import styles from './Layout.module.css'

const NAV = [
  { group: 'Overview', items: [{ to: '/', icon: 'ti-layout-dashboard', label: 'Dashboard' }] },
  {
    group: 'Users',
    items: [
      { to: '/users', icon: 'ti-users', label: 'All users' },
      { to: '/assessments', icon: 'ti-clipboard-check', label: 'Assessments' },
    ],
  },
  {
    group: 'Content',
    items: [
      { to: '/articles', icon: 'ti-article', label: 'Articles' },
      { to: '/publish', icon: 'ti-pencil-plus', label: 'Publish new' },
    ],
  },
  {
    group: 'Assessments',
    items: [
      { to: '/questions', icon: 'ti-list', label: 'Questions' },
    ],
  },
  
 {
  group: 'App Content',
  items: [
    { to: '/intro-slides', icon: 'ti-layout-cards', label: 'Intro Slides' },
    { to: '/home-sections', icon: 'ti-home', label: 'Home Sections' },
  ],
},
]
export function Sidebar() {
  const { theme, toggleTheme } = useThemeStore()
  const { adminUser, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarTop}>
        <div className={styles.wordmark}>A A V I E</div>
        <div className={styles.tagline}>ADMIN PANEL</div>
      </div>

      <nav className={styles.nav}>
        {NAV.map((grp) => (
          <div key={grp.group}>
            <div className={styles.navGroup}>{grp.group}</div>
            {grp.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  [styles.navItem, isActive ? styles.navItemActive : ''].join(' ')
                }
              >
                <i className={`ti ${item.icon}`} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className={styles.sidebarFoot}>
        <div className={styles.userRow}>
          <div className={styles.avatar}>
            {adminUser?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{adminUser?.name || 'Admin'}</div>
            <div className={styles.userRole}>Super admin</div>
          </div>
          <button
            className={styles.themeBtn}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <i className={`ti ${theme === 'light' ? 'ti-moon' : 'ti-sun'}`} />
          </button>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <i className="ti ti-logout" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  )
}

export function Topbar({ title, subtitle, actions }) {
  const navigate = useNavigate()
  return (
    <header className={styles.topbar}>
      <div className={styles.topbarLeft}>
        <h1 className={styles.pageTitle}>{title}</h1>
        {subtitle && <p className={styles.pageSub}>{subtitle}</p>}
      </div>
      <div className={styles.topbarRight}>
        {actions}
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate('/publish')}
        >
          <i className="ti ti-plus" aria-hidden="true" />
          New article
        </button>
      </div>
    </header>
  )
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <i
            className={`ti ${
              t.type === 'success' ? 'ti-circle-check' : t.type === 'error' ? 'ti-circle-x' : 'ti-info-circle'
            }`}
          />
          {t.msg}
        </div>
      ))}
    </div>
  )
}

export function StatCard({ label, value, sub, subType, accentColor }) {
  const borderMap = {
    accent: 'var(--accent)',
    rose: 'var(--rose)',
    sage: 'var(--sage)',
    amber: 'var(--amber)',
  }
  return (
    <div
      className={styles.statCard}
      style={{ borderLeft: `3px solid ${borderMap[accentColor] || 'var(--accent)'}` }}
    >
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
      {sub && (
        <div
          className={styles.statSub}
          style={{
            color:
              subType === 'up' ? 'var(--sage)' :
              subType === 'down' ? 'var(--rose)' : 'var(--tx2)',
          }}
        >
          {subType === 'up' && <i className="ti ti-trending-up" style={{ fontSize: 11 }} />}
          {subType === 'down' && <i className="ti ti-trending-down" style={{ fontSize: 11 }} />}
          {sub}
        </div>
      )}
    </div>
  )
}

export function Panel({ title, icon, action, onAction, children, className }) {
  return (
    <div className={[styles.panel, className].filter(Boolean).join(' ')}>
      <div className={styles.panelHead}>
        <div className={styles.panelTitle}>
          {icon && <i className={`ti ${icon}`} aria-hidden="true" />}
          {title}
        </div>
        {action && (
          <button className={styles.panelAction} onClick={onAction}>
            {action}
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

export function Spinner() {
  return <div className="spinner" />
}

export function BarRow({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  const colorMap = {
    accent: 'var(--accent)',
    rose: 'var(--rose)',
    sage: 'var(--sage)',
    amber: 'var(--amber)',
  }
  return (
    <div className={styles.barRow}>
      <div className={styles.barLabel}>{label}</div>
      <div className={styles.barTrack}>
        <div
          className={styles.barFill}
          style={{ width: `${pct}%`, background: colorMap[color] || 'var(--accent)' }}
        />
      </div>
      <div className={styles.barVal}>{typeof value === 'number' ? value.toLocaleString() : value}</div>
    </div>
  )
}

export function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalIcon}>
          <i className="ti ti-alert-triangle" style={{ color: 'var(--rose)', fontSize: 28 }} />
        </div>
        <p className={styles.modalMsg}>{message}</p>
        <div className={styles.modalActions}>
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  )
}
