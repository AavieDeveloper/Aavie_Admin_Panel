import { Topbar, StatCard, Panel, BarRow } from '../../components/Layout'
import styles from './AssessmentsPage.module.css'

import { useAssessmentStats } from '../../hooks'





const VIKRITI_BREAKDOWN = [
  { label: 'Vata Vikriti',  value: 2100, color: 'amber' },
  { label: 'Pitta Vikriti', value: 1840, color: 'rose' },
  { label: 'Kapha Vikriti', value: 1448, color: 'sage' },
]

export default function AssessmentsPage() {
const { data: stats, isLoading } = useAssessmentStats()

const total = stats?.totalUsers || 0

const funnelData = [
  { label: 'Registered users',   value: total,                    pct: 100, color: 'accent' },
  { label: 'Prakriti completed', value: stats?.prakritiDone || 0, pct: total ? Math.round((stats?.prakritiDone / total) * 100) : 0, color: 'sage' },
  { label: 'PCOS completed',     value: stats?.pcosDone || 0,     pct: total ? Math.round((stats?.pcosDone / total) * 100) : 0, color: 'amber' },
  { label: 'Vikriti completed',  value: stats?.vikritiDone || 0,  pct: total ? Math.round((stats?.vikritiDone / total) * 100) : 0, color: 'rose' },
]

// ── Prakriti breakdown from API ───────────────────────────────────────────────
const PRAKRITI_COLORS = { Pitta: 'rose', Vata: 'amber', Kapha: 'sage' }
const prakritiRaw = stats?.prakritiBreakdown || {}
const maxPrakriti = Math.max(...Object.values(prakritiRaw), 1)
const PRAKRITI_BREAKDOWN = Object.entries(prakritiRaw)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 6)
  .map(([label, value]) => ({
    label,
    value,
    max: maxPrakriti,
    color: Object.keys(PRAKRITI_COLORS).find(k => label.includes(k))
      ? PRAKRITI_COLORS[Object.keys(PRAKRITI_COLORS).find(k => label.includes(k))]
      : 'accent',
  }))

// ── PCOS breakdown from API ───────────────────────────────────────────────────
const PCOS_TYPE_COLORS ={
  'Metabolic PCOS':              'sage',
  'Inflammatory PCOS':           'rose',
  'Inflammatory Metabolic PCOS': 'amber',
  'Stress-Driven PCOS':          'accent',
  'Stress & Depletion PCOS':     'accent',
  'Irregular Metabolic PCOS':    'amber',
  'Complex Pattern PCOS':        'accent',
}
const pcosRaw = stats?.pcosBreakdown || {}
const maxPcos = Math.max(...Object.values(pcosRaw), 1)
const PCOS_BREAKDOWN = Object.entries(pcosRaw)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 7)
  .map(([label, value]) => ({
    label,
    value,
    max: maxPcos,
    color: PCOS_TYPE_COLORS[label] || 'accent',
  }))

// ── Vikriti breakdown from API ────────────────────────────────────────────────
const VIKRITI_COLORS = { Vata: 'amber', Pitta: 'rose', Kapha: 'sage' }
const vikritiRaw = stats?.vikritiBreakdown || {}
const maxVikriti = Math.max(...Object.values(vikritiRaw), 1)
const VIKRITI_BREAKDOWN = Object.entries(vikritiRaw)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 6)
  .map(([label, value]) => ({
    label,
    value,
    max: maxVikriti,
    color: Object.keys(VIKRITI_COLORS).find(k => label.includes(k))
      ? VIKRITI_COLORS[Object.keys(VIKRITI_COLORS).find(k => label.includes(k))]
      : 'accent',
  }))
  return (
    <div className={styles.page}>
      <Topbar title="Assessments" subtitle="Assessment completion tracking across all users" />
      <div className={styles.content}>

        <div className={styles.statStrip}>
          <StatCard label="Prakriti done"   value={stats?.prakritiDone?.toLocaleString() || '—'} sub={total ? `${Math.round((stats.prakritiDone / total) * 100)}% of users` : ''} accentColor="accent" />
<StatCard label="PCOS done"       value={stats?.pcosDone?.toLocaleString() || '—'}     sub={total ? `${Math.round((stats.pcosDone / total) * 100)}% of users` : ''} accentColor="rose" />
<StatCard label="Vikriti done"    value={stats?.vikritiDone?.toLocaleString() || '—'}  sub={total ? `${Math.round((stats.vikritiDone / total) * 100)}% of users` : ''} accentColor="amber" />
<StatCard label="Total users"     value={stats?.totalUsers?.toLocaleString() || '—'}   accentColor="sage" />
        </div>

        {/* Funnel */}
        <Panel title="Assessment completion funnel" icon="ti-filter">
          <div className={styles.funnel}>
           {funnelData.map((s, i) => (
              <div key={i} className={styles.funnelRow}>
                <div className={styles.funnelLabel}>{s.label}</div>
                <div className={styles.funnelBar}>
                  <div
                    className={styles.funnelFill}
                    style={{
                      width: `${s.pct}%`,
                      background: s.color === 'accent' ? 'var(--accent)' :
                                  s.color === 'sage'   ? 'var(--sage)'   :
                                  s.color === 'amber'  ? 'var(--amber)'  : 'var(--rose)',
                    }}
                  />
                </div>
                <div className={styles.funnelMeta}>
                  <span className={styles.funnelNum}>{s.value.toLocaleString()}</span>
                  <span className={styles.funnelPct}>{s.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div className={styles.threePanel}>
         <Panel title="Prakriti types" icon="ti-dna">
  {PRAKRITI_BREAKDOWN.length > 0 ? (
    PRAKRITI_BREAKDOWN.map((r) => (
      <BarRow key={r.label} label={r.label} value={r.value} max={r.max} color={r.color} />
    ))
  ) : (
    <div className="empty"><i className="ti ti-dna" />No data yet</div>
  )}
</Panel>

         <Panel title="PCOS types" icon="ti-heart-rate-monitor">
  {PCOS_BREAKDOWN.length > 0 ? (
    PCOS_BREAKDOWN.map((r) => (
      <BarRow key={r.label} label={r.label} value={r.value} max={r.max} color={r.color} />
    ))
  ) : (
    <div className="empty"><i className="ti ti-heart-rate-monitor" />No data yet</div>
  )}
</Panel>

          <Panel title="Vikriti patterns" icon="ti-activity">
  {VIKRITI_BREAKDOWN.length > 0 ? (
    VIKRITI_BREAKDOWN.map((r) => (
      <BarRow key={r.label} label={r.label} value={r.value} max={r.max} color={r.color} />
    ))
  ) : (
    <div className="empty"><i className="ti ti-activity" />No data yet</div>
  )}
</Panel>
        </div>

      </div>
    </div>
  )
}
