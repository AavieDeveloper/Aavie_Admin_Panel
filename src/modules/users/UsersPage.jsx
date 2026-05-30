import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Topbar, StatCard, Panel, Spinner } from '../../components/Layout'
import { useUserStats } from '../../hooks'
import client from '../../api/client'
import styles from './UsersPage.module.css'

// ── Tags ──────────────────────────────────────────────────────────────────────
function PrakritiTag({ value }) {
  if (!value) return <span className="tag tag-muted">Not done</span>
  if (value.toLowerCase().includes('pitta')) return <span className="tag tag-rose">{value}</span>
  if (value.toLowerCase().includes('kapha')) return <span className="tag tag-sage">{value}</span>
  return <span className="tag tag-amber">{value}</span>
}

function PcosTag({ value }) {
  if (!value) return <span className="tag tag-muted">Not done</span>
  if (value === 'PCOS') return <span className="tag tag-rose">{value}</span>
  return <span className="tag tag-amber">{value}</span>
}

// ── User detail modal ─────────────────────────────────────────────────────────
function UserDetailModal({ userId, onClose }) {
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['user', userId],
    queryFn:  async () => {
      const { data } = await client.get(`/api/admin/users/${userId}`)
      return data
    },
    enabled: !!userId,
  })

  // Prakriti accent colour
  const prakritiColor = () => {
    if (!user?.prakritiResult) return 'var(--accent)'
    const v = user.prakritiResult.toLowerCase()
    if (v.includes('pitta')) return 'var(--rose)'
    if (v.includes('kapha')) return 'var(--sage)'
    return 'var(--amber)'
  }

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, backdropFilter: 'blur(2px)',
        animation: 'fadeIn 0.15s ease',
      }}
    >
      {/* Modal card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg1)',
          border: '1px solid var(--bd)',
          borderRadius: 16,
          width: '100%', maxWidth: 520,
          maxHeight: '90vh', overflowY: 'auto',
          animation: 'fadeIn 0.2s ease',
        }}
      >

        {/* ── Loading ── */}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <Spinner />
          </div>
        )}

        {/* ── Error ── */}
        {isError && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--rose)', fontSize: 13 }}>
            <i className="ti ti-alert-circle" style={{ fontSize: 28, display: 'block', marginBottom: 10 }} />
            Could not load user details.
            <br />
            <button className="btn btn-sm" onClick={onClose} style={{ marginTop: 12 }}>Close</button>
          </div>
        )}

        {/* ── User detail ── */}
        {!isLoading && !isError && user && (
          <>
            {/* Header with colour accent */}
            <div style={{
              background: `linear-gradient(135deg, var(--accentBg) 0%, var(--bg2) 100%)`,
              borderBottom: '1px solid var(--bd)',
              padding: '24px 24px 20px',
              borderRadius: '16px 16px 0 0',
              position: 'relative',
            }}>
              {/* Close button */}
              <button
                onClick={onClose}
                style={{
                  position: 'absolute', top: 16, right: 16,
                  width: 30, height: 30, borderRadius: 8,
                  border: '1px solid var(--bd)', background: 'var(--bg1)',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: 'var(--tx2)',
                }}
              >
                <i className="ti ti-x" style={{ fontSize: 14 }} />
              </button>

              {/* Avatar + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: 'var(--accentBg)',
                  border: '2px solid var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 700, color: 'var(--accent)',
                  flexShrink: 0,
                }}>
                  {(user.name || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--tx0)', marginBottom: 4 }}>
                    {user.name || '—'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: 'var(--tx2)' }}>
                      <i className="ti ti-id-badge" style={{ marginRight: 4 }} />
                      ID #{user.id}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--tx2)' }}>·</span>
                    <span style={{ fontSize: 12, color: 'var(--tx2)' }}>
                      Joined {user.joinedAt || '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* ── Basic info ── */}
              <section>
                <div style={sectionHeadStyle}>
                  <i className="ti ti-user" style={{ color: 'var(--accent)', fontSize: 14 }} />
                  Basic Information
                </div>
                <div style={gridStyle}>
                  <InfoRow icon="ti-mail"     label="Email"  value={user.email  || '—'} />
                  <InfoRow icon="ti-phone" label="Mobile" value={user.mobileNumber || '—'} />
                  <InfoRow icon="ti-calendar" label="Age"    value={user.age ? `${user.age} years` : '—'} />
                  <InfoRow icon="ti-map-pin"  label="City"   value={user.city   || '—'} />
                  <InfoRow icon="ti-gender-bigender" label="Gender" value={user.gender || '—'} />
                  <InfoRow icon="ti-ruler"          label="Height" value={user.height ? `${user.height} cm` : '—'} />
<InfoRow icon="ti-weight"         label="Weight" value={user.weight ? `${user.weight} kg` : '—'} />
                </div>
              </section>

              {/* Divider */}
              <div style={{ height: 1, background: 'var(--bd)' }} />

              {/* ── Assessment results ── */}
              <section>
                <div style={sectionHeadStyle}>
                  <i className="ti ti-clipboard-check" style={{ color: 'var(--accent)', fontSize: 14 }} />
                  Assessment Results
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                  {/* Prakriti */}
                  <div style={assessCardStyle(user.prakritiResult ? 'var(--accentBg)' : 'var(--bg2)', user.prakritiResult ? 'var(--accent)' : 'var(--bd)')}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--tx3)', marginBottom: 4 }}>
                          Step 1 · Prakriti (BodyType)
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--tx0)' }}>
                          {user.prakritiResult || 'Not completed'}
                        </div>
                      </div>
                      {user.prakritiResult
                        ? <span className="tag tag-accent"><i className="ti ti-check" style={{ marginRight: 4 }} />Done</span>
                        : <span className="tag tag-muted">Pending</span>
                      }
                    </div>
                  </div>

                  {/* PCOS */}
                  <div style={assessCardStyle(user.pcosResult ? 'var(--roseBg)' : 'var(--bg2)', user.pcosResult ? 'var(--rose)' : 'var(--bd)')}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--tx3)', marginBottom: 4 }}>
                          Step 2 · PCOS / PMOS Type
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--tx0)' }}>
                          {user.pcosResult || 'Not completed'}
                        </div>
                        {user.pcosSeverity && (
                          <div style={{ fontSize: 11, color: 'var(--tx2)', marginTop: 3 }}>
                            Severity: {user.pcosSeverity}
                          </div>
                        )}
                      </div>
                      {user.pcosResult
                        ? <span className="tag tag-rose"><i className="ti ti-check" style={{ marginRight: 4 }} />Done</span>
                        : <span className="tag tag-muted">Pending</span>
                      }
                    </div>
                  </div>

                  {/* Vikriti */}
                  <div style={assessCardStyle(user.vikritiResult ? 'var(--amberBg)' : 'var(--bg2)', user.vikritiResult ? 'var(--amber)' : 'var(--bd)')}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--tx3)', marginBottom: 4 }}>
                          Step 3 · Vikriti (Current Imbalance)
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--tx0)' }}>
                          {user.vikritiResult || 'Not completed'}
                        </div>
                      </div>
                      {user.vikritiResult
                        ? <span className="tag tag-amber"><i className="ti ti-check" style={{ marginRight: 4 }} />Done</span>
                        : <span className="tag tag-muted">Pending</span>
                      }
                    </div>
                  </div>
                </div>
              </section>

               {user.tongueAnalysis && (
                <>
                  {/* Divider */}
                  <div style={{ height: 1, background: 'var(--bd)' }} />

                  {/* ── Tongue Analysis ── */}
              <section>
                <div style={sectionHeadStyle}>
                  <i className="ti ti-scan" style={{ color: 'var(--accent)', fontSize: 14 }} />
                  Tongue Analysis
                </div>

                {user.tongueAnalysis ? (
                  <div style={{
                    padding: 14,
                    background: 'var(--sageBg)',
                    borderRadius: 10,
                    border: '1px solid var(--sage)',
                  }}>
                    <div style={{
                      padding: 12,
                      background: 'var(--bg1)',
                      borderRadius: 8,
                      border: '1px solid var(--bd)',
                    }}>
                      <div style={{
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: 1.5,
                        textTransform: 'uppercase',
                        color: 'var(--tx3)',
                        marginBottom: 10,
                      }}>
                        <i className="ti ti-check" style={{ marginRight: 4, color: 'var(--sage)' }} />
                        AI Analysis Result
                      </div>
                      
                      {user.tongueAnalysis.split('\n').map((line, i) => {
                        if (!line.trim()) return null
                        
                        // Check if it's a key-value line
                        if (line.includes(':')) {
                          const [key, ...valueParts] = line.split(':')
                          const value = valueParts.join(':').trim()
                          
                          return (
                            <div key={i} style={{ marginBottom: 8 }}>
                              <span style={{ 
                                fontSize: 11, 
                                fontWeight: 600, 
                                color: 'var(--tx2)',
                                display: 'block',
                                marginBottom: 2,
                              }}>
                                {key.trim()}
                              </span>
                              <span style={{ 
                                fontSize: 13, 
                                fontWeight: 500, 
                                color: 'var(--tx0)',
                              }}>
                                {value}
                              </span>
                            </div>
                          )
                        }
                        
                        // Otherwise it's the insight line
                        return (
                          <div key={i} style={{
                            fontSize: 13,
                            color: 'var(--tx0)',
                            lineHeight: 1.6,
                            marginBottom: 12,
                            fontStyle: 'italic',
                            padding: 10,
                            background: 'var(--accentBg)',
                            borderRadius: 6,
                            borderLeft: '3px solid var(--accent)',
                          }}>
                            {line.trim()}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: 14,
                    background: 'var(--bg2)',
                    borderRadius: 10,
                    border: '1px solid var(--bd)',
                    textAlign: 'center',
                  }}>
                    <i className="ti ti-scan-off" style={{ 
                      fontSize: 32, 
                      color: 'var(--tx3)', 
                      display: 'block',
                      marginBottom: 8,
                    }} />
                    <div style={{
                      fontSize: 12,
                      color: 'var(--tx2)',
                      fontWeight: 500,
                    }}>
                      Tongue analysis not completed
                    </div>
                  </div>
                )}
              </section>

              {/* Divider */}
              <div style={{ height: 1, background: 'var(--bd)' }} />
                </>
              )}

              {/* ── Herb Formula ── */}
{user.herbFormula && (
  <>
    {/* Divider */}
    <div style={{ height: 1, background: 'var(--bd)' }} />

    <section>
      <div style={sectionHeadStyle}>
        <i className="ti ti-leaf" style={{ color: 'var(--accent)', fontSize: 14 }} />
        Personalized Herb Formula
        {!user.herbFormula.revealed && (
          <span className="tag tag-amber" style={{ marginLeft: 'auto', fontSize: 9 }}>
            <i className="ti ti-lock" style={{ marginRight: 3 }} />
            Hidden from user
          </span>
        )}
      </div>

      {/* Formula Details Card */}
      <div style={{
        padding: 14,
        background: user.herbFormula.revealed ? 'var(--sageBg)' : 'var(--amberBg)',
        borderRadius: 10,
        border: `1px solid ${user.herbFormula.revealed ? 'var(--sage)' : 'var(--amber)'}`,
      }}>
        
        {/* Severity Badge */}
        <div style={{ marginBottom: 12 }}>
          <span style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: 'var(--tx3)',
            display: 'block',
            marginBottom: 6,
          }}>
            PCOS Severity
          </span>
          <span className={`tag ${
            user.herbFormula.severity === 'severe' ? 'tag-rose' :
            user.herbFormula.severity === 'moderate' ? 'tag-amber' :
            'tag-sage'
          }`} style={{ fontSize: 11, padding: '4px 10px' }}>
            {user.herbFormula.severity?.toUpperCase() || 'UNKNOWN'}
          </span>
        </div>

        {/* Dosha Percentages */}
        {user.herbFormula.doshaPct && (() => {
          try {
            const dosha = JSON.parse(user.herbFormula.doshaPct)
            return (
              <div style={{ marginBottom: 12 }}>
                <div style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  color: 'var(--tx3)',
                  marginBottom: 8,
                }}>
                  Dosha Balance
                </div>
                {Object.entries(dosha).map(([key, value]) => (
                  <div key={key} style={{ marginBottom: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 11, color: 'var(--tx1)', fontWeight: 500 }}>
                        {key}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--tx2)', fontWeight: 600 }}>
                        {value}%
                      </span>
                    </div>
                    <div style={{
                      height: 6,
                      background: 'var(--bg3)',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${value}%`,
                        height: '100%',
                        background: key === 'Vata' ? 'var(--amber)' :
                                   key === 'Pitta' ? 'var(--rose)' :
                                   'var(--sage)',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )
          } catch (e) {
            return null
          }
        })()}

        {/* Herb List */}
{user.herbFormula.formulaJson && (() => {
  try {
    const formula = JSON.parse(user.herbFormula.formulaJson)
    console.log('🌿 Parsed formula:', formula)  // Debug log
    
    return (
      <div>
        <div style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: 'var(--tx3)',
          marginBottom: 8,
        }}>
          Herbs & Dosage
        </div>
        <div style={{
          background: 'var(--bg1)',
          borderRadius: 8,
          border: '1px solid var(--bd)',
          padding: 10,
          maxHeight: 200,
          overflowY: 'auto',
        }}>
          {Array.isArray(formula) ? (
            formula.map((herb, i) => (
              <div key={i} style={{
                padding: '6px 8px',
                borderBottom: i < formula.length - 1 ? '1px solid var(--bd)' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: 12, color: 'var(--tx0)', fontWeight: 500 }}>
                  {/* Try multiple possible field names */}
                  {herb.herb || herb.name || herb.herbName || herb.ingredient || JSON.stringify(herb)}
                </span>
                <span style={{ fontSize: 11, color: 'var(--tx2)' }}>
                  {herb.qty || herb.dosage || herb.quantity || herb.amount || '—'}
                </span>
              </div>
            ))
          ) : (
            <div style={{ fontSize: 11, color: 'var(--tx3)', padding: 8 }}>
              <pre style={{ fontSize: 10, overflow: 'auto' }}>
                {JSON.stringify(formula, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    )
  } catch (e) {
    console.error('❌ Formula parse error:', e)
    return (
      <div style={{ fontSize: 11, color: 'var(--rose)', textAlign: 'center', padding: 10 }}>
        Failed to parse formula: {e.message}
      </div>
    )
  }
})()}

        {/* Created Date */}
        <div style={{
          fontSize: 10,
          color: 'var(--tx3)',
          marginTop: 10,
          textAlign: 'right',
        }}>
          Generated {user.herbFormula.createdAt}
        </div>
      </div>
    </section>

    {/* Divider */}
    <div style={{ height: 1, background: 'var(--bd)' }} />
  </>
)}


              {/* ── Completion status ── */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px',
                borderRadius: 10,
                background: (user.prakritiResult && user.pcosResult && user.vikritiResult)
                  ? 'var(--sageBg)' : 'var(--bg2)',
                border: '1px solid',
                borderColor: (user.prakritiResult && user.pcosResult && user.vikritiResult)
                  ? 'var(--sage)' : 'var(--bd)',
              }}>
                <i
                  className={`ti ${user.prakritiResult && user.pcosResult && user.vikritiResult ? 'ti-circle-check' : 'ti-clock'}`}
                  style={{
                    fontSize: 18,
                    color: (user.prakritiResult && user.pcosResult && user.vikritiResult)
                      ? 'var(--sage)' : 'var(--tx3)',
                  }}
                />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx0)' }}>
                    {user.prakritiResult && user.pcosResult && user.vikritiResult
                      ? 'All 3 assessments complete'
                      : 'Assessment incomplete'}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--tx2)', marginTop: 2 }}>
                    {[
                      user.prakritiResult ? '✓ Prakriti' : null,
                      user.pcosResult     ? '✓ PCOS'     : null,
                      user.vikritiResult  ? '✓ Vikriti'  : null,
                    ].filter(Boolean).join(' · ') || 'No assessments done yet'}
                  </div>
                </div>
              </div>

              {/* ── Close button ── */}
              <button
                className="btn"
                onClick={onClose}
                style={{ justifyContent: 'center', marginTop: 4 }}
              >
                Close
              </button>

            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Small helper components ───────────────────────────────────────────────────
function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: 'var(--bg2)' }}>
      <i className={`ti ${icon}`} style={{ fontSize: 14, color: 'var(--accent)', flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--tx3)', marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: 12, color: 'var(--tx0)', fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  )
}

const sectionHeadStyle = {
  display: 'flex', alignItems: 'center', gap: 7,
  fontSize: 11, fontWeight: 600, color: 'var(--tx0)',
  marginBottom: 10,
}

const gridStyle = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
}

const assessCardStyle = (bg, border) => ({
  padding: '12px 14px', borderRadius: 10,
  background: bg, border: `1px solid ${border}`,
})

// ── Main page ─────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const [search,        setSearch]        = useState('')
  const [filterStatus,  setFilterStatus]  = useState('all')
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
const PAGE_SIZE = 10

  const { data: statsData } = useUserStats()

  const { data: usersData, isLoading, isError, refetch } = useQuery({
    queryKey: ['users', search, filterStatus],
    queryFn: async () => {
      const { data } = await client.get('/api/admin/users', {
        params: { search, status: filterStatus, page: 0, size: 200 },
      })
      return data
    },
    staleTime: 5 * 60 * 1000,
  })

const users      = usersData?.users ?? []
const filtered   = users
const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
const paginated  = filtered.slice(
  (currentPage - 1) * PAGE_SIZE,
  currentPage * PAGE_SIZE
)
  return (
    <div className={styles.page}>
      <Topbar
        title="User management"
        subtitle="All registered women on the platform"
      />
      <div className={styles.content}>

        {/* ── Stat strip ── */}
        <div className={styles.statStrip}>
          <StatCard label="Total registered"  value={statsData?.totalUsers?.toLocaleString()  || '—'} accentColor="accent" />
          <StatCard
            label="Prakriti done"
            value={statsData?.prakritiDone?.toLocaleString() || '—'}
            sub={statsData?.totalUsers ? `${Math.round((statsData.prakritiDone / statsData.totalUsers) * 100)}% of users` : ''}
            accentColor="sage"
          />
          <StatCard
            label="PCOS done"
            value={statsData?.pcosDone?.toLocaleString() || '—'}
            sub={statsData?.totalUsers ? `${Math.round((statsData.pcosDone / statsData.totalUsers) * 100)}% of users` : ''}
            accentColor="amber"
          />
          <StatCard label="Vikriti done" value={statsData?.vikritiDone?.toLocaleString() || '—'} accentColor="rose" />
        </div>

        {/* ── Users table ── */}
        <Panel title="All users" icon="ti-users">

          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <i className="ti ti-search" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search by name, city or email…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className={styles.filters}>
              {['all', 'complete', 'pending'].map((f) => (
                <button
                  key={f}
                  className={[styles.filterBtn, filterStatus === f ? styles.filterActive : ''].join(' ')}
                  onClick={() => { setFilterStatus(f); setCurrentPage(1); }}
                >
                  {f === 'all' ? 'All' : f === 'complete' ? 'Complete' : 'Pending'}
                </button>
              ))}
            </div>
            <button className="btn btn-sm" onClick={() => refetch()} style={{ marginLeft: 'auto' }} title="Refresh">
              <i className="ti ti-refresh" style={{ fontSize: 13 }} />
              Refresh
            </button>
          </div>

          {/* Loading skeleton */}
          {isLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 0' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{
                  height: 42, borderRadius: 8, background: 'var(--bg3)',
                  animation: 'pulse 1.4s ease infinite', opacity: 1 - i * 0.1,
                }} />
              ))}
              <style>{`@keyframes pulse { 0%,100%{opacity:0.6} 50%{opacity:0.3} }`}</style>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div style={{ padding: 20, textAlign: 'center', borderRadius: 8, background: 'var(--roseBg)', color: 'var(--rose)', fontSize: 12 }}>
              <i className="ti ti-wifi-off" style={{ fontSize: 20, display: 'block', marginBottom: 8 }} />
              Could not load users. Check <code style={{ fontSize: 11 }}>GET /api/admin/users</code> in Spring Boot.
              <br />
              <button className="btn btn-sm" onClick={() => refetch()} style={{ marginTop: 10 }}>Try again</button>
            </div>
          )}

          {/* Table */}
          {!isLoading && !isError && (
            <>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}></th>
                      <th style={{ minWidth: 120 }}>Name</th>
<th style={{ minWidth: 50 }}>Age</th>
<th style={{ minWidth: 100 }}>City</th>
<th style={{ minWidth: 150 }}>Email</th>
<th style={{ minWidth: 120 }}>Mobile</th>
<th style={{ minWidth: 110 }}>Prakriti</th>
<th style={{ minWidth: 121 }}>PCOS type</th>
<th style={{ minWidth: 110 }}>Joined</th>
<th style={{ minWidth: 100 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className={styles.av}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>
                              {(u.name || '?').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className={styles.nameCell}>{u.name  || '—'}</td>
                        <td>{u.age   || '—'}</td>
                        <td>{u.city  || '—'}</td>
                        <td className={styles.emailCell}>{u.email || '—'}</td>
                        <td>{u.mobileNumber || '—'}</td>
                        <td><PrakritiTag value={u.prakritiResult} /></td>
                        <td><PcosTag    value={u.pcosResult}     /></td>
                        <td className={styles.dateCell}>{u.joinedAt || '—'}</td>
                        <td>
                          <button
                            className="btn btn-sm"
                            style={{ fontSize: 10 }}
                            onClick={() => setSelectedUserId(u.id)}
                          >
                            <i className="ti ti-eye" style={{ fontSize: 12 }} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={10}>
                          <div className="empty">
                            <i className="ti ti-users-off" />
                            {users.length === 0 ? 'No users found in the database' : 'No users match your search'}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className={styles.tableFooter}>
  <span>
    Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} users
  </span>

  {/* Pagination controls */}
  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
    {/* Previous button */}
    <button
      className="btn btn-sm"
      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
      disabled={currentPage === 1}
      style={{ padding: '4px 10px', fontSize: 11 }}
    >
      ← Prev
    </button>

    {/* Page numbers */}
    {Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
      .reduce((acc, p, i, arr) => {
        if (i > 0 && p - arr[i - 1] > 1) acc.push('...')
        acc.push(p)
        return acc
      }, [])
      .map((p, i) => p === '...' ? (
        <span key={i} style={{ fontSize: 11, color: 'var(--tx3)', padding: '0 4px' }}>…</span>
      ) : (
        <button
          key={p}
          className="btn btn-sm"
          onClick={() => setCurrentPage(p)}
          style={{
            padding: '4px 10px', fontSize: 11,
            background: currentPage === p ? 'var(--accent)' : undefined,
            color:      currentPage === p ? 'white'         : undefined,
            borderColor: currentPage === p ? 'var(--accent)' : undefined,
          }}
        >
          {p}
        </button>
      ))
    }

    {/* Next button */}
    <button
      className="btn btn-sm"
      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
      disabled={currentPage === totalPages}
      style={{ padding: '4px 10px', fontSize: 11 }}
    >
      Next →
    </button>
  </div>

  {/* <span style={{ color: 'var(--tx3)' }}>· Live from GET /api/admin/users on Render</span> */}
</div>
            </>
          )}
        </Panel>
      </div>

      {/* ── User detail modal ── */}
      {selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  )
}