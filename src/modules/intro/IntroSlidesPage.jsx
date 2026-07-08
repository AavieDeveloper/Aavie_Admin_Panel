import { useState, useEffect } from 'react'
import { fetchAdminSlides, updateSlide, reorderSlides, uploadSlideImage } from '../../api/introSlides'
import styles from './IntroSlides.module.css'

export default function IntroSlidesPage() {
  const [slides, setSlides] = useState([])
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetchAdminSlides().then(setSlides)
  }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

 const handleSave = async () => {
  if (!editing) return
  setSaving(true)
  console.log('handleSave — editing.newImageFile:', editing.newImageFile)

  try {
    let imageUrl = editing.imageUrl
    if (editing.newImageFile) {
      const res = await uploadSlideImage(editing.id, editing.newImageFile)
      imageUrl = res.imageUrl
    }

    await updateSlide(editing.id, {
  label: editing.label,
  titleJson: editing.titleJson
    ? editing.titleJson.replace(/\n/g, '\\n').replace(/\r/g, '')
    : editing.titleJson,
  body: editing.body,
  eyebrowColor: editing.eyebrowColor,
  imageUrl,
  cta: editing.cta,
  tag: editing.tag,
})
    setSlides(slides.map(s => s.id === editing.id ? { ...s, ...editing, imageUrl } : s))
    setEditing(null)
    showToast('Slide saved ✓')
  } catch (err) {
    showToast('Save failed — check console')
    console.error('Save error:', err)
  } finally {
    setSaving(false)
  }
}

  const moveSlide = async (idx, dir) => {
    const newSlides = [...slides]
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= newSlides.length) return
    const temp = newSlides[idx]
    newSlides[idx] = newSlides[swapIdx]
    newSlides[swapIdx] = temp
    const reordered = newSlides.map((s, i) => ({ ...s, slideIndex: i }))
    setSlides(reordered)
    await reorderSlides(reordered.map(s => ({ id: s.id, slideIndex: s.slideIndex })))
    showToast('Order saved ✓')
  }

  const getTitlePreview = (titleJson) => {
    try {
      return JSON.parse(titleJson).map(s => s.t || '').join('')
    } catch { return '—' }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Intro Slides</h1>
          <p className={styles.sub}>Edit text and reorder slides shown during app onboarding</p>
        </div>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}

      <div className={styles.list}>
        {slides.map((slide, idx) => (
          <div key={slide.id} className={`${styles.card} ${!(slide.isActive ?? slide.active ?? true) ? styles.inactive : ''}`}>
            <div className={styles.cardLeft}>
              <div className={styles.indexBadge}>Slide {slide.slideIndex + 1}</div>
              <div className={styles.orderBtns}>
                <button onClick={() => moveSlide(idx, -1)} disabled={idx === 0} className={styles.orderBtn}>↑</button>
                <button onClick={() => moveSlide(idx, 1)} disabled={idx === slides.length - 1} className={styles.orderBtn}>↓</button>
              </div>
            </div>

 <div className={styles.cardBody}>
  <div className={styles.eyebrow}>{slide.label}</div>
  <div className={styles.titlePreview}>{getTitlePreview(slide.titleJson)}</div>
  <div className={styles.bodyPreview}>{slide.body}</div>
  <div className={styles.ctaPreview}>CTA: <span>{slide.cta}</span></div>
  {slide.tag && <div className={styles.tagPreview}>Tag: {slide.tag}</div>}
</div>
{slide.imageUrl && (
  <img
    src={slide.imageUrl.startsWith('/uploads')
      ? `${import.meta.env.VITE_API_BASE || ''}${slide.imageUrl}`
      : slide.imageUrl}
    alt=""
    className={styles.thumb}
  />
)}

            <div className={styles.cardActions}>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  checked={slide.isActive ?? slide.active ?? true}
                  onChange={async (e) => {
                    const updated = { ...slide, isActive: e.target.checked, active: e.target.checked }
                    setSlides(slides.map(s => s.id === slide.id ? updated : s))
                    await updateSlide(slide.id, { isActive: e.target.checked })
                    showToast(e.target.checked ? 'Slide enabled ✓' : 'Slide disabled ✓')
                  }}
                />
                <span>{slide.isActive ? 'Active' : 'Hidden'}</span>
              </label>
              <button className="btn btn-sm" onClick={() => setEditing({ ...slide })}>
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      

      {/* Edit Modal */}
      {editing && (
        <div className={styles.overlay} onClick={() => setEditing(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>Edit Slide {editing.slideIndex + 1}</div>
              <button className={styles.closeBtn} onClick={() => setEditing(null)}>✕</button>
            </div>

            <div className={styles.modalBody}>
  <div className={styles.field}>
    <label className={styles.lbl}>Eyebrow Label</label>
    <input className="field" value={editing.label || ''}
      onChange={e => setEditing({ ...editing, label: e.target.value })} />
  </div>

  <div className={styles.field}>
    <label className={styles.lbl}>Eyebrow Color</label>
    <select
      className="field"
      value={editing.eyebrowColor || 'gold'}
      onChange={e => setEditing({ ...editing, eyebrowColor: e.target.value })}
    >
      <option value="gold">Gold</option>
      <option value="teal">Teal</option>
    </select>
  </div>

  <div className={styles.field}>
  <label className={styles.lbl}>
    Title <span style={{ color: 'var(--tx3)', fontWeight: 400 }}>
      (JSON — only edit the "t" text values, keep structure)
    </span>
  </label>
  <textarea className="field" rows={4} value={editing.titleJson || ''}
    onChange={e => setEditing({ ...editing, titleJson: e.target.value })} />
  <div className={styles.hint}>
    Preview: <strong>{getTitlePreview(editing.titleJson)}</strong>
  </div>
</div>

  <div className={styles.field}>
    <label className={styles.lbl}>Body Text</label>
    <textarea className="field" rows={3} value={editing.body || ''}
      onChange={e => setEditing({ ...editing, body: e.target.value })} />
  </div>

  <div className={styles.field}>
  <label className={styles.lbl}>Slide Image</label>
  {editing.imageUrl && (
    <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
      <img
        src={editing.imageUrl.startsWith('/uploads')
          ? `${import.meta.env.VITE_API_BASE || ''}${editing.imageUrl}`
          : editing.imageUrl}
        alt=""
        style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 4, display: 'block' }}
      />
      <button
        onClick={() => setEditing({ ...editing, imageUrl: '', newImageFile: null })}
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
    </div>
  )}
  <input
    type="file"
    accept="image/*"
    onChange={e => setEditing({ ...editing, newImageFile: e.target.files[0] })}
  />
</div>

  <div className={styles.field}>
    <label className={styles.lbl}>CTA Button Text</label>
    <input className="field" value={editing.cta || ''}
      onChange={e => setEditing({ ...editing, cta: e.target.value })} />
  </div>

  <div className={styles.field}>
    <label className={styles.lbl}>Tag (optional small label below body)</label>
    <input className="field" value={editing.tag || ''}
      placeholder="e.g. AAVIE · Designed for Indian Women"
      onChange={e => setEditing({ ...editing, tag: e.target.value })} />
  </div>
</div>
            <div className={styles.modalFooter}>
              <button className="btn" onClick={() => setEditing(null)}>Cancel</button>
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






