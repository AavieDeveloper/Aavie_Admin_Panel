import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Topbar, StatCard, Panel, ConfirmModal, Spinner } from '../../components/Layout'
import { useArticles, useArticleStats, useDeleteArticle } from '../../hooks'
import styles from './ArticlesPage.module.css'

const AGE_TABS = [
  { key: 'all', label: 'All articles' },
  { key: '18-24', label: '18–24' },
  { key: '25-30', label: '25–30' },
  { key: '31-35', label: '31–35' },
  { key: '36-45', label: '36–45' },
]

const MOCK_ARTICLES = [
  { id: 1, title: 'Why your BodyType determines how PMOS shows up differently in you', category: 'Prakriti', ageGroup: '18-30', readTime: '5 min', status: 'live', imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=88&q=70', createdAt: 'May 10, 2025' },
  { id: 2, title: 'What a face and body photo reveals about your hormonal health', category: 'Visual screening', ageGroup: '25-35', readTime: '4 min', status: 'live', imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=88&q=70', createdAt: 'May 12, 2025' },
  { id: 3, title: 'The cycle-symptom connection — why you feel the way you do on day 14', category: 'Cycle intelligence', ageGroup: 'all', readTime: '6 min', status: 'draft', imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=88&q=70', createdAt: 'May 14, 2025' },
  { id: 4, title: 'The 5 infused waters that support your hormones — by BodyType', category: 'Kitchen wisdom', ageGroup: '36-45', readTime: '3 min', status: 'live', imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=88&q=70', createdAt: 'May 15, 2025' },
  { id: 5, title: 'How stress disrupts your cycle — the cortisol and hormone link', category: 'Lifestyle', ageGroup: '25-30', readTime: '7 min', status: 'live', imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=88&q=70', createdAt: 'May 16, 2025' },
  { id: 6, title: 'Understanding Agni — why your digestion and hormones are connected', category: 'Prakriti', ageGroup: '31-35', readTime: '5 min', status: 'live', imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=88&q=70', createdAt: 'May 17, 2025' },
]

function AgeTag({ value }) {
  if (value === 'all') return <span className="tag tag-sage">All ages</span>
  return <span className="tag tag-accent">{value}</span>
}

export default function ArticlesPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
const [deleteTarget, setDeleteTarget] = useState(null)
const deleteMutation = useDeleteArticle()

const { data: articlesData, isLoading } = useArticles({
  ageGroup: activeTab,
})

const filtered = articlesData || []
const live  = filtered.filter((a) => a.status === 'live').length
const draft = filtered.filter((a) => a.status === 'draft').length

  const handleDelete = () => {
    deleteMutation.mutate(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <div className={styles.page}>
      <Topbar
        title="Articles"
        subtitle="Health content published to the AAVIE app by age group"
        actions={
          <button className="btn" onClick={() => navigate('/publish')}>
            <i className="ti ti-plus" />
            Publish new
          </button>
        }
      />

      <div className={styles.content}>
        <div className={styles.statStrip}>
          <StatCard label="Total articles" value={filtered.length} accentColor="accent" />
<StatCard label="Live" value={live} sub="Published on app" accentColor="sage" />
<StatCard label="Drafts" value={draft} sub="Not yet published" accentColor="amber" />
        </div>

        {/* Age group tabs */}
        <div className={styles.tabRow}>
          {AGE_TABS.map((t) => (
            <button
              key={t.key}
              className={[styles.tab, activeTab === t.key ? styles.tabActive : ''].join(' ')}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
              <span className={styles.tabCount}>
               {t.key === 'all' ? filtered.length : filtered.filter(a => a.ageGroup === t.key).length}
              </span>
            </button>
          ))}
        </div>

        <Panel title={`${activeTab === 'all' ? 'All articles' : `Age group ${activeTab}`}`} icon="ti-article">
          {filtered.length === 0 ? (
            <div className="empty">
              <i className="ti ti-article-off" />
              No articles for this age group
            </div>
          ) : (
            <div className={styles.artGrid}>
              {filtered.map((a) => (
                <div key={a.id} className={styles.artCard}>
                  <div className={styles.artThumb}>
                    <img src={a.imageUrl} alt={a.title} />
                    <div className={styles.artThumbOverlay}>
                      <span className={`tag ${a.status === 'live' ? 'tag-sage' : 'tag-muted'}`}>
                        {a.status}
                      </span>
                    </div>
                  </div>
                  <div className={styles.artBody}>
                    <div className={styles.artMeta}>
                      <span className="tag tag-accent" style={{ fontSize: 9 }}>{a.category}</span>
                      <AgeTag value={a.ageGroup} />
                    </div>
                    <div className={styles.artTitle}>{a.title}</div>
                    <div className={styles.artSub}>{a.readTime} read · {a.createdAt}</div>
                    <div className={styles.artActions}>
                      <button
                        className="btn btn-sm"
                        onClick={() => navigate(`/publish/${a.id}`)}
                      >
                        <i className="ti ti-edit" style={{ fontSize: 12 }} />
                        Edit
                      </button>
                      <button
                        className="icon-btn del"
                        onClick={() => setDeleteTarget(a)}
                        aria-label="Delete article"
                      >
                        <i className="ti ti-trash" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {deleteTarget && (
        <ConfirmModal
          message={`Delete "${deleteTarget.title}"? This will remove it from the app immediately.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
