import { useNavigate } from 'react-router-dom'
import { Topbar, StatCard, Panel, BarRow, Spinner } from '../../components/Layout'
import { useDashboardStats, useUsers, useArticles, useActivity } from '../../hooks'
import styles from './DashboardPage.module.css'

const MOCK_STATS = {
  totalUsers: 12048, assessmentsDone: 8712,
  articlesLive: 24, activeThisMonth: 4391,
  weeklyGrowth: 284, monthlyDelta: -3,
}

const MOCK_USERS = [
  { id: 1, name: 'Priya S.', age: 27, city: 'Delhi', prakritiResult: 'Pitta-Vata', pcosResult: 'PCOS', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&q=70' },
  { id: 2, name: 'Sneha K.', age: 31, city: 'Pune', prakritiResult: 'Kapha', pcosResult: 'PMOS', imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&q=70' },
  { id: 3, name: 'Kavya R.', age: 24, city: 'Bangalore', prakritiResult: 'Vata', pcosResult: null, imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&q=70' },
  { id: 4, name: 'Ananya M.', age: 29, city: 'Mumbai', prakritiResult: null, pcosResult: null, imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=60&q=70' },
  { id: 5, name: 'Divya L.', age: 26, city: 'Chennai', prakritiResult: 'Pitta', pcosResult: 'PMOS', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&q=70' },
]

const MOCK_ARTICLES = [
  { id: 1, title: 'Why your BodyType determines how PMOS shows up differently in you', category: 'Prakriti', ageGroup: '18-30', readTime: '5 min', status: 'live', imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=88&q=70' },
  { id: 2, title: 'The cycle-symptom connection — why you feel the way you do on day 14', category: 'Cycle intelligence', ageGroup: '25-35', readTime: '6 min', status: 'live', imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=88&q=70' },
  { id: 3, title: 'The 5 infused waters that support your hormones — by BodyType', category: 'Kitchen wisdom', ageGroup: 'All ages', readTime: '3 min', status: 'draft', imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=88&q=70' },
]



function prakritiTag(r) {
  if (!r) return <span className="tag tag-muted">Pending</span>
  if (r.includes('Pitta')) return <span className="tag tag-rose">{r}</span>
  if (r.includes('Kapha')) return <span className="tag tag-sage">{r}</span>
  return <span className="tag tag-amber">{r}</span>
}

export default function DashboardPage() {
  const navigate = useNavigate()
const { data: statsData, isLoading: statsLoading } = useDashboardStats()
const { data: usersData } = useUsers({ size: 5 })
const { data: articlesData } = useArticles()
const { data: activityData } = useActivity()
const stats = statsData || MOCK_STATS

// ADD after:
// const stats = statsData || MOCK_STATS

const ageGroups = statsData?.ageGroups || {}
const maxAge = Math.max(...Object.values(ageGroups), 1)
const AGE_DIST = [
  { label: '18–24', value: ageGroups['18-24'] || 0, max: maxAge, color: 'accent' },
  { label: '25–30', value: ageGroups['25-30'] || 0, max: maxAge, color: 'accent' },
  { label: '31–35', value: ageGroups['31-35'] || 0, max: maxAge, color: 'sage'   },
  { label: '36–45', value: ageGroups['36-45'] || 0, max: maxAge, color: 'amber'  },
]

const prakritiBreakdown = statsData?.prakritiBreakdown || {}
const maxPrakriti = Math.max(...Object.values(prakritiBreakdown), 1)
const PRAKRITI_COLORS = { Pitta: 'rose', Vata: 'amber', Kapha: 'sage' }
const PRAKRITI_DIST = Object.entries(prakritiBreakdown)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([label, value]) => ({
    label,
    value,
    max: maxPrakriti,
    color: PRAKRITI_COLORS[label] || 'accent',
  }))
const users = usersData?.users || MOCK_USERS
const articles = articlesData || MOCK_ARTICLES


  return (
    <div className={styles.page}>
      <Topbar
        title="Dashboard"
        subtitle="AAVIE · Women's health platform"
      />
      <div className={styles.content}>

        {/* ── Stat strip ── */}
        <div className={styles.statStrip}>
          <StatCard
            label="Total users"
            value={stats.totalUsers?.toLocaleString()}
            sub={`+${stats.weeklyGrowth} this week`}
            subType="up"
            accentColor="accent"
          />
          <StatCard
            label="Assessments done"
            value={stats.assessmentsDone?.toLocaleString()}
            sub={`${Math.round((stats.assessmentsDone / stats.totalUsers) * 100)}% of users`}
            accentColor="sage"
          />
          <StatCard
            label="Articles live"
            value={stats.articlesLive}
            sub="4 age groups"
            accentColor="amber"
          />
          <StatCard
            label="Active this month"
            value={stats.activeThisMonth?.toLocaleString()}
            sub={`${stats.monthlyDelta > 0 ? '+' : ''}${stats.monthlyDelta}% vs last month`}
            subType={stats.monthlyDelta >= 0 ? 'up' : 'down'}
            accentColor="rose"
          />
        </div>

        {/* ── Two panel row ── */}
        <div className={styles.twoPanel}>
          <Panel title="Recent signups" icon="ti-users" action="View all →" onAction={() => navigate('/users')}>
            <div className={styles.userList}>
            {(statsData?.recentUsers || MOCK_USERS).map((u) => (
  <div key={u.id} className={styles.userRow}>
    <div className={styles.userAv} style={{
      background: 'var(--accentBg)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center',
      fontSize: 13, fontWeight: 600,
      color: 'var(--accent)',
    }}>
      {u.name?.charAt(0) ?? '?'}
    </div>
    <div className={styles.userInfo}>
      <div className={styles.userName}>{u.name}</div>
      <div className={styles.userMeta}>{u.age} · {u.city}</div>
    </div>
    {prakritiTag(u.prakritiResult)}
  </div>
))}
            </div>
          </Panel>

          <Panel title="Users by age group" icon="ti-chart-bar">
            {AGE_DIST.map((r) => (
              <BarRow key={r.label} label={r.label} value={r.value} max={r.max} color={r.color} />
            ))}
            <div className="divider" />
            <div className={styles.miniTitle}>
              <i className="ti ti-dna" style={{ fontSize: 14, color: 'var(--accent)' }} />
              Prakriti breakdown
            </div>
            {PRAKRITI_DIST.map((r) => (
              <BarRow key={r.label} label={r.label} value={`${r.value}%`} max={r.max} color={r.color} />
            ))}
          </Panel>
        </div>

        {/* ── Recent articles ── */}
        <Panel title="Recent articles" icon="ti-article" action="View all →" onAction={() => navigate('/articles')}>
          <div className={styles.artList}>
           {(articlesData || MOCK_ARTICLES).map((a) => (
              <div key={a.id} className={styles.artRow}>
                <div className={styles.artThumb}>
                  <img src={a.imageUrl} alt={a.title} />
                </div>
                <div className={styles.artBody}>
                  <div className={styles.artTitle}>{a.title}</div>
                  <div className={styles.artMeta}>
                    {a.category} · <span className="tag tag-accent" style={{ fontSize: 9 }}>{a.ageGroup}</span>
                    {' · '}{a.readTime} read
                    {' · '}<span className={`tag ${a.status === 'live' ? 'tag-sage' : 'tag-muted'}`} style={{ fontSize: 9 }}>{a.status}</span>
                  </div>
                </div>
                <div className={styles.artActions}>
                  <button className="icon-btn" onClick={() => navigate(`/publish/${a.id}`)} aria-label="Edit article">
                    <i className="ti ti-edit" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>

      </div>
    </div>
  )
}
