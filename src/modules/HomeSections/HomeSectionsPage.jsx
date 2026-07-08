import { useState, useEffect } from 'react'
import { fetchHomeSections, updateHomeSection, uploadHomeSectionImage } from '../../api/homeSections'
import styles from './HomeSections.module.css'

const SECTION_LABELS = {
  hero: 'Hero — Your body doesn\'t work like everyone else\'s',
  pcos_card: 'Cycle Card — Your period is not the same as hers',
  ritual_road: 'Ritual Road',
  why_different: 'Why AAVIE is Different',
  supplement: 'Supplement — Your care',
  intelligence: 'AAVIE Intelligence',
  trust: 'Built with Integrity',
}

const SECTION_ORDER = ['hero', 'pcos_card', 'ritual_road', 'why_different', 'supplement', 'intelligence', 'trust']

export default function HomeSectionsPage() {
  const [sections, setSections] = useState({})
  const [editing, setEditing] = useState(null)
  const [editKey, setEditKey] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHomeSections()
      .then(data => {
        const map = {}
        data.forEach(s => {
          try { map[s.sectionKey] = JSON.parse(s.contentJson) }
          catch { map[s.sectionKey] = {} }
        })
        setSections(map)
      })
      .finally(() => setLoading(false))
  }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const openEdit = (key) => {
    setEditKey(key)
    setEditing(JSON.parse(JSON.stringify(sections[key] || {})))
  }

  const handleImageUpload = async (key, file, onUrl) => {
    try {
      const res = await uploadHomeSectionImage(key, file)
      onUrl(res.imageUrl)
      showToast('Image uploaded ✓')
    } catch {
      showToast('Image upload failed')
    }
  }

  const handleSave = async () => {
    if (!editing || !editKey) return
    setSaving(true)
    try {
      await updateHomeSection(editKey, JSON.stringify(editing))
      setSections(prev => ({ ...prev, [editKey]: editing }))
      setEditing(null)
      setEditKey(null)
      showToast('Section saved ✓')
    } catch {
      showToast('Save failed — check console')
    } finally {
      setSaving(false)
    }
  }

  const updateField = (path, value) => {
    setEditing(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      const parts = path.split('.')
      let obj = next
      for (let i = 0; i < parts.length - 1; i++) {
        const p = parts[i]
        if (!isNaN(p)) obj = obj[parseInt(p)]
        else obj = obj[p]
      }
      const last = parts[parts.length - 1]
      obj[last] = value
      return next
    })
  }

  if (loading) return <div className={styles.page}><p style={{ padding: 24 }}>Loading...</p></div>

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Home Sections</h1>
          <p className={styles.sub}>Edit the content shown on the app home screen</p>
        </div>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}

      <div className={styles.list}>
        {SECTION_ORDER.map(key => (
          <div key={key} className={styles.card}>
            <div className={styles.cardBody}>
              <div className={styles.sectionKey}>{key}</div>
              <div className={styles.sectionLabel}>{SECTION_LABELS[key]}</div>
            </div>
            <div className={styles.cardActions}>
              <button className="btn btn-sm" onClick={() => openEdit(key)}>Edit</button>
            </div>
          </div>
        ))}
      </div>

      {editing && editKey && (
        <div className={styles.overlay} onClick={() => { setEditing(null); setEditKey(null) }}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>{SECTION_LABELS[editKey]}</div>
              <button className={styles.closeBtn} onClick={() => { setEditing(null); setEditKey(null) }}>✕</button>
            </div>

            <div className={styles.modalBody}>

              {/* ── HERO ── */}
            {editKey === 'hero' && <>
  <Field label="Eyebrow Text (small pill above heading)" value={editing.eyebrowText || ''} onChange={v => updateField('eyebrowText', v)} />
  <Field label="Main Heading" value={editing.heading || ''} onChange={v => updateField('heading', v)} />
  <Field label="Subtext" value={editing.subtext || ''} onChange={v => updateField('subtext', v)} textarea />
  <Field label="Button Text" value={editing.buttonText || ''} onChange={v => updateField('buttonText', v)} />
  <ImageField
    label="Background Image"
    currentUrl={editing.imageUrl}
    onUpload={file => handleImageUpload(editKey, file, url => updateField('imageUrl', url))}
    onDelete={() => updateField('imageUrl', '')}
  />
</>}

              {/* ── PCOS CARD ── */}
              {editKey === 'pcos_card' && <>
                <Field label="Quote Text (shown in quotes)" value={editing.quote || ''} onChange={v => updateField('quote', v)} />
                <Field label="Body Text" value={editing.body || ''} onChange={v => updateField('body', v)} textarea />
                <Field label="Button Text" value={editing.buttonText || ''} onChange={v => updateField('buttonText', v)} />
                <ImageField
  label="Background Image"
  currentUrl={editing.imageUrl}
  onUpload={file => handleImageUpload(editKey, file, url => updateField('imageUrl', url))}
  onDelete={() => updateField('imageUrl', '')}
/>
              </>}

              {/* ── RITUAL ROAD ── */}
              {editKey === 'ritual_road' && <>
                <Field label="Heading" value={editing.heading || ''} onChange={v => updateField('heading', v)} />
                <Field label="Subtext" value={editing.subtext || ''} onChange={v => updateField('subtext', v)} />
                <Field label="Button Text" value={editing.buttonText || ''} onChange={v => updateField('buttonText', v)} />
              </>}

              {/* ── WHY DIFFERENT ── */}
              {editKey === 'why_different' && <>
                <Field label="Section Label" value={editing.sectionLabel || ''} onChange={v => updateField('sectionLabel', v)} />
                <Field label="Section Heading" value={editing.heading || ''} onChange={v => updateField('heading', v)} />
                <div className={styles.cardsSection}>
                  <div className={styles.cardsSectionTitle}>4 Cards</div>
                  {(editing.cards || []).map((card, i) => (
                    <div key={i} className={styles.subCard}>
                      <div className={styles.subCardTitle}>Card {i + 1} — {card.title}</div>
                      <Field label="Step Label" value={card.step || ''} onChange={v => updateField(`cards.${i}.step`, v)} />
                      <Field label="Title" value={card.title || ''} onChange={v => updateField(`cards.${i}.title`, v)} />
                      <Field label="Sub Label" value={card.sub || ''} onChange={v => updateField(`cards.${i}.sub`, v)} />
                      <Field label="Body Text" value={card.body || ''} onChange={v => updateField(`cards.${i}.body`, v)} textarea />
<ImageField
  label="Card Image"
  currentUrl={card.imageUrl}
  onUpload={file => handleImageUpload(editKey, file, url => updateField(`cards.${i}.imageUrl`, url))}
  onDelete={() => updateField(`cards.${i}.imageUrl`, '')}
  onUrlChange={url => updateField(`cards.${i}.imageUrl`, url)}
/>
                    </div>
                  ))}
                </div>
              </>}

              {/* ── SUPPLEMENT ── */}
              {editKey === 'supplement' && <>
                <Field label="Section Label" value={editing.sectionLabel || ''} onChange={v => updateField('sectionLabel', v)} />
                <Field label="Section Heading" value={editing.heading || ''} onChange={v => updateField('heading', v)} />
                <Field label="Section Subtext" value={editing.subtext || ''} onChange={v => updateField('subtext', v)} textarea />
                <div className={styles.cardsSection}>
                  <div className={styles.cardsSectionTitle}>Product Card</div>
                  <Field label="Product Name" value={editing.card?.name || ''} onChange={v => updateField('card.name', v)} />
                  <Field label="Tagline" value={editing.card?.tagline || ''} onChange={v => updateField('card.tagline', v)} />
                  <Field label="Price" value={editing.card?.price || ''} onChange={v => updateField('card.price', v)} />
                  <Field label="Price Unit" value={editing.card?.priceUnit || ''} onChange={v => updateField('card.priceUnit', v)} />
                  <Field label="Description" value={editing.card?.description || ''} onChange={v => updateField('card.description', v)} textarea />
                  <Field
                    label="Parameters (comma separated)"
                    value={(editing.card?.params || []).join(', ')}
                    onChange={v => updateField('card.params', v.split(',').map(s => s.trim()).filter(Boolean))}
                  />
                  <Field label="Button Text" value={editing.card?.buttonText || ''} onChange={v => updateField('card.buttonText', v)} />
                </div>
              </>}

              {/* ── INTELLIGENCE ── */}
              {editKey === 'intelligence' && <>
                <Field label="Section Label" value={editing.sectionLabel || ''} onChange={v => updateField('sectionLabel', v)} />
                <Field label="Section Heading" value={editing.heading || ''} onChange={v => updateField('heading', v)} />
                <div className={styles.cardsSection}>
                  <div className={styles.cardsSectionTitle}>3 Cards</div>
                  {(editing.cards || []).map((card, i) => (
                    <div key={i} className={styles.subCard}>
                      <div className={styles.subCardTitle}>Card {i + 1} — {card.title}</div>
                      <Field label="Title" value={card.title || ''} onChange={v => updateField(`cards.${i}.title`, v)} />
                      <Field label="Body Text" value={card.body || ''} onChange={v => updateField(`cards.${i}.body`, v)} textarea />
                      <Field label="Insight Quote" value={card.insight || ''} onChange={v => updateField(`cards.${i}.insight`, v)} textarea />
   <ImageField
  label="Card Image"
  currentUrl={card.imageUrl}
  onUpload={file => handleImageUpload(editKey, file, url => updateField(`cards.${i}.imageUrl`, url))}
  onDelete={() => updateField(`cards.${i}.imageUrl`, '')}
  onUrlChange={url => updateField(`cards.${i}.imageUrl`, url)}
/>
                    </div>
                  ))}
                </div>
              </>}
{/* ── TRUST ── */}
{editKey === 'trust' && <>
  <Field label="Section Title" value={editing.title || ''} onChange={v => updateField('title', v)} />
  <Field label="Subtitle (e.g. 🇮🇳 MADE IN INDIA)" value={editing.subtitle || ''} onChange={v => updateField('subtitle', v)} />
  <div className={styles.cardsSection}>
    <div className={styles.cardsSectionTitle}>6 Trust Items</div>
    {(editing.items || []).map((item, i) => (
      <div key={i} className={styles.subCard}>
        <div className={styles.subCardTitle}>Item {i + 1}</div>
        <Field label="Emoji Icon" value={item.ico || ''} onChange={v => updateField(`items.${i}.ico`, v)} />
        <Field label="Label" value={item.lbl || ''} onChange={v => updateField(`items.${i}.lbl`, v)} />
      </div>
    ))}
  </div>
</>}
            </div>

            <div className={styles.modalFooter}>
              <button className="btn" onClick={() => { setEditing(null); setEditKey(null) }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, textarea = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--tx2)' }}>{label}</label>
      {textarea ? (
        <textarea
          className="field"
          rows={3}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      ) : (
        <input
          className="field"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      )}
    </div>
  )
}

function ImageField({ label, currentUrl, onUpload, onDelete, onUrlChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--tx2)' }}>{label}</label>

      {/* Current image preview */}
      {currentUrl && (
        <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
          <img
            src={currentUrl.startsWith('/uploads')
              ? `${import.meta.env.VITE_API_BASE || ''}${currentUrl}`
              : currentUrl}
            alt=""
            style={{
              width: '100%',
              maxHeight: 160,
              objectFit: 'cover',
              borderRadius: 8,
              marginBottom: 4,
              display: 'block'
            }}
          />
          {/* Only show delete for uploaded files, not external URLs */}
          {onDelete && currentUrl.startsWith('/uploads') && (
            <button
              onClick={onDelete}
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 26,
                height: 26,
                borderRadius: 6,
                border: 'none',
                background: 'rgba(0,0,0,0.55)',
                color: '#fff',
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1
              }}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* External URL input */}
      {onUrlChange && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 10, color: 'var(--tx3)' }}>Paste image URL (external link)</span>
          <input
            className="field"
            placeholder="https://..."
            value={currentUrl && !currentUrl.startsWith('/uploads') ? currentUrl : ''}
            onChange={e => onUrlChange(e.target.value)}
          />
        </div>
      )}

      {/* File upload */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 10, color: 'var(--tx3)' }}>
          {currentUrl ? 'Or upload new image to replace' : 'Upload image'}
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={e => e.target.files[0] && onUpload(e.target.files[0])}
        />
      </div>
    </div>
  )
}