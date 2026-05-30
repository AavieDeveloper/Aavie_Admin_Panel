import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Topbar, Panel, Spinner } from '../../components/Layout'
import { useCreateArticle, useUpdateArticle, useArticle } from '../../hooks'
import styles from './PublishPage.module.css'

const schema = z.object({
  title:    z.string().min(5, 'Title must be at least 5 characters'),
  category: z.string().min(1, 'Select a category'),
  ageGroup: z.string().min(1, 'Select an age group'),
  readTime: z.string().min(1, 'Enter read time'),
  body:     z.string().min(20, 'Body must be at least 20 characters'),
  imageUrl: z.string().url('Enter a valid image URL').or(z.literal('')),
  status:   z.enum(['live', 'draft']),
})

const CATEGORIES = ['Prakriti', 'Cycle intelligence', 'Kitchen wisdom', 'Visual screening', 'Lifestyle', 'General']
const AGE_GROUPS  = ['18-24', '25-30', '31-35', '36-45', 'all']
const AGE_LABELS  = { 'all': 'All ages', '18-24': '18–24', '25-30': '25–30', '31-35': '31–35', '36-45': '36–45' }

// ── Formatting guide items ─────────────────────────────────────────────────────
const FORMAT_GUIDE = [
  { syntax: '## Heading',     desc: 'Large heading with teal bar',     example: '## What is Prakriti?' },
  { syntax: '### Heading',    desc: 'Smaller bold subheading',          example: '### The 3 Doshas' },
  { syntax: '- item',         desc: 'Bullet point with teal dot',       example: '- Vata — Air and Space' },
  { syntax: '**word**',       desc: 'Bold text inside a sentence',      example: '**Pitta** governs fire' },
  { syntax: '> text',         desc: 'Highlighted blockquote card',      example: '> Your body is unique.' },
  { syntax: 'plain text',     desc: 'Normal paragraph',                 example: 'This is a paragraph.' },
]

// ── Sample article template ────────────────────────────────────────────────────
const SAMPLE_TEMPLATE = `Your body type is not a label. It is a map.

## What is Prakriti?

Prakriti is your unique body constitution — determined at birth and never changing. It is the starting point for everything in Ayurvedic care.

### The 3 Doshas

Every woman is a combination of three forces.

- **Vata** — Air and Space. Governs movement, creativity, and the nervous system.
- **Pitta** — Fire and Water. Governs digestion, metabolism, and transformation.
- **Kapha** — Earth and Water. Governs structure, stability, and immunity.

## Why it matters for PCOS

> Two women with the same PCOS diagnosis can need completely opposite protocols. One needs cooling herbs. The other needs warming ones. Prakriti tells you which.

Most treatments treat the symptom. Prakriti treats the woman.

## How AAVIE uses your Prakriti

Your Prakriti determines your herb formula, your food timing, and your daily ritual. **No two women get the same protocol.**

### Vata-dominant PCOS

Irregular cycles, anxiety before periods, low body weight. Needs grounding, warmth, and rhythm.

### Pitta-dominant PCOS

Heavy flow, inflammation, acne. Needs cooling, liver support, and reduced heat foods.

### Kapha-dominant PCOS

Weight gain, sluggish metabolism, regular but heavy cycle. Needs movement, stimulation, and light foods.

> Your screening takes 3 minutes. Your protocol is yours for life.`

// ── Live preview renderer ──────────────────────────────────────────────────────
function LivePreview({ body, title, imageUrl, category }) {
  if (!body && !title) return null

  const lines  = (body || '').split('\n')
  const blocks = []

  for (const line of lines) {
    const t = line.trim()
    if (!t) continue
    if (t.startsWith('## '))       blocks.push({ type: 'h2',     content: t.slice(3) })
    else if (t.startsWith('### ')) blocks.push({ type: 'h3',     content: t.slice(4) })
    else if (t.startsWith('- ') || t.startsWith('• ')) blocks.push({ type: 'bullet', content: t.slice(2) })
    else if (t.startsWith('> '))   blocks.push({ type: 'quote',  content: t.slice(2) })
    else                            blocks.push({ type: 'para',   content: t })
  }

  function renderInline(text) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((p, i) =>
      p.startsWith('**') && p.endsWith('**')
        ? <strong key={i} style={{ color: '#1C1A17', fontWeight: 700 }}>{p.slice(2, -2)}</strong>
        : <span key={i}>{p}</span>
    )
  }

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: 12,
      overflow: 'hidden',
      border: '1px solid var(--bd)',
    }}>
      {/* Mock phone header */}
      <div style={{
        background: '#EDEAE4',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        borderBottom: '1px solid var(--bd)',
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: 8,
          background: 'rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <i className="ti ti-arrow-left" style={{ fontSize: 12, color: '#6E6860' }} />
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#1C1A17', letterSpacing: 1 }}>
          AAVIE APP PREVIEW
        </span>
      </div>

      {/* Hero image area */}
      {imageUrl && (
        <div style={{ height: 140, overflow: 'hidden', position: 'relative', background: '#E8E3DC' }}>
          <img
            src={imageUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.35))',
          }} />
        </div>
      )}

      {/* Content */}
      <div style={{
        padding: '16px 18px 20px',
        background: '#FFFFFF',
        borderRadius: imageUrl ? '16px 16px 0 0' : 0,
        marginTop: imageUrl ? -16 : 0,
        position: 'relative',
      }}>
        {/* Category badge */}
        {category && (
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '3px 10px', borderRadius: 20,
            background: 'rgba(26,126,143,0.10)',
            marginBottom: 10,
          }}>
            <span style={{ fontSize: 9, fontWeight: 600, color: '#0F6070', letterSpacing: 0.3 }}>
              {category}
            </span>
          </div>
        )}

        {/* Title */}
        {title && (
          <div style={{
            fontSize: 16, fontWeight: 400, color: '#1C1A17',
            lineHeight: 1.45, marginBottom: 12, letterSpacing: -0.3,
            fontFamily: 'Georgia, serif',
          }}>
            {title}
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', marginBottom: 14 }} />

        {/* Body blocks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {blocks.map((block, i) => {
            switch (block.type) {
              case 'h2':
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <div style={{ width: 3, height: 18, borderRadius: 2, background: '#1A7E8F', flexShrink: 0 }} />
                    <span style={{ fontSize: 14, fontWeight: 400, color: '#1C1A17', fontFamily: 'Georgia, serif' }}>
                      {block.content}
                    </span>
                  </div>
                )
              case 'h3':
                return (
                  <div key={i} style={{ fontSize: 12, fontWeight: 700, color: '#1C1A17', marginTop: 2 }}>
                    {block.content}
                  </div>
                )
              case 'bullet':
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: '#1A7E8F', marginTop: 6, flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 11, color: '#6E6860', lineHeight: 1.6 }}>
                      {renderInline(block.content)}
                    </span>
                  </div>
                )
              case 'quote':
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    background: '#F8F5F1', borderRadius: 8, padding: '10px 12px',
                  }}>
                    <div style={{ width: 3, background: '#1A7E8F', borderRadius: 2, alignSelf: 'stretch', flexShrink: 0 }} />
                    <span style={{
                      fontSize: 11, fontStyle: 'italic', color: '#1C1A17',
                      lineHeight: 1.6, fontFamily: 'Georgia, serif',
                    }}>
                      {renderInline(block.content)}
                    </span>
                  </div>
                )
              default:
                return (
                  <p key={i} style={{ fontSize: 11, color: '#6E6860', lineHeight: 1.7, margin: 0, fontWeight: 300 }}>
                    {renderInline(block.content)}
                  </p>
                )
            }
          })}
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function PublishPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const { data: existing, isLoading: loadingExisting } = useArticle(id)
  const createMutation = useCreateArticle()
  const updateMutation = useUpdateArticle()

  const [previewUrl, setPreviewUrl]     = useState('')
  const [showPreview, setShowPreview]   = useState(false)
  const [showGuide, setShowGuide]       = useState(true)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '', category: 'Prakriti', ageGroup: 'all',
      readTime: '5 min read', body: '', imageUrl: '', status: 'live',
    },
  })

  const watchedAgeGroup = watch('ageGroup')
  const watchedImageUrl = watch('imageUrl')
  const watchedStatus   = watch('status')
  const watchedBody     = watch('body')
  const watchedTitle    = watch('title')
  const watchedCategory = watch('category')

  useEffect(() => {
    if (existing) {
      reset(existing)
      setPreviewUrl(existing.imageUrl || '')
    }
  }, [existing])

  useEffect(() => {
    if (watchedImageUrl) setPreviewUrl(watchedImageUrl)
  }, [watchedImageUrl])

  const onSubmit = async (data) => {
    if (isEdit) {
      await updateMutation.mutateAsync({ id, ...data })
    } else {
      await createMutation.mutateAsync(data)
    }
    navigate('/articles')
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  const handleLoadTemplate = () => {
    setValue('body', SAMPLE_TEMPLATE, { shouldDirty: true })
  }

  if (isEdit && loadingExisting) {
    return (
      <div className={styles.page}>
        <Topbar title="Edit article" />
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Topbar
        title={isEdit ? 'Edit article' : 'Publish new article'}
        subtitle={isEdit ? 'Update and republish to the app' : 'Create and publish to the AAVIE app'}
      />

      <div className={styles.content}>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.formLayout}>

          {/* ── Left: Form ── */}
          <div className={styles.formMain}>

            <Panel title="Article details" icon="ti-file-description">
              <div className={styles.fieldGrid}>
                <div className={styles.fieldFull}>
                  <label className={styles.lbl}>Article title</label>
                  <input
                    className="field"
                    placeholder="e.g. Why your BodyType matters for PCOS…"
                    {...register('title')}
                  />
                  {errors.title && <span className={styles.err}>{errors.title.message}</span>}
                </div>

                <div>
                  <label className={styles.lbl}>Category</label>
                  <select className="field" {...register('category')}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.category && <span className={styles.err}>{errors.category.message}</span>}
                </div>

                <div>
                  <label className={styles.lbl}>Read time</label>
                  <input className="field" placeholder="5 min read" {...register('readTime')} />
                  {errors.readTime && <span className={styles.err}>{errors.readTime.message}</span>}
                </div>
              </div>

              {/* ── Article body with formatting toolbar ── */}
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                  <label className={styles.lbl} style={{ margin: 0 }}>Article body</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={handleLoadTemplate}
                      style={{
                        fontSize: 10, padding: '3px 10px', borderRadius: 6,
                        border: '1px solid var(--bd)', background: 'var(--bg2)',
                        color: 'var(--tx1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <i className="ti ti-template" style={{ fontSize: 11 }} />
                      Load sample
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPreview(p => !p)}
                      style={{
                        fontSize: 10, padding: '3px 10px', borderRadius: 6,
                        border: '1px solid var(--bd)',
                        background: showPreview ? 'var(--accentBg)' : 'var(--bg2)',
                        color: showPreview ? 'var(--accent)' : 'var(--tx1)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                      }}
                    >
                      <i className="ti ti-eye" style={{ fontSize: 11 }} />
                      {showPreview ? 'Hide preview' : 'Show preview'}
                    </button>
                  </div>
                </div>

                {/* Quick format buttons */}
                <div style={{
                  display: 'flex', gap: 4, flexWrap: 'wrap',
                  padding: '7px 10px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--bd)',
                  borderBottom: 'none',
                  borderRadius: '8px 8px 0 0',
                }}>
                  {[
                    { label: 'H2',      insert: '## ',  title: 'Large heading' },
                    { label: 'H3',      insert: '### ', title: 'Small heading' },
                    { label: '• List',  insert: '- ',   title: 'Bullet point' },
                    { label: '❝ Quote', insert: '> ',   title: 'Blockquote' },
                    { label: 'B',       insert: '****', title: 'Bold text — place cursor between stars', bold: true },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      type="button"
                      title={btn.title}
                      onClick={() => {
                        const textarea = document.querySelector('textarea[name="body"]')
                        if (!textarea) return
                        const start = textarea.selectionStart
                        const end   = textarea.selectionEnd
                        const current = watchedBody || ''
                        const selected = current.substring(start, end)
                        let inserted = ''
                        if (btn.insert === '****') {
                          inserted = `**${selected || 'bold text'}**`
                        } else {
                          inserted = btn.insert + (selected || '')
                        }
                        const newVal = current.substring(0, start) + inserted + current.substring(end)
                        setValue('body', newVal, { shouldDirty: true })
                        setTimeout(() => {
                          textarea.focus()
                          const newPos = start + inserted.length
                          textarea.setSelectionRange(newPos, newPos)
                        }, 10)
                      }}
                      style={{
                        padding: '3px 9px', borderRadius: 5,
                        border: '1px solid var(--bd2)',
                        background: 'var(--bg1)',
                        color: 'var(--tx1)',
                        fontSize: btn.bold ? 12 : 10,
                        fontWeight: btn.bold ? 700 : 500,
                        cursor: 'pointer',
                      }}
                    >
                      {btn.label}
                    </button>
                  ))}
                  <span style={{
                    marginLeft: 'auto', fontSize: 9, color: 'var(--tx3)',
                    display: 'flex', alignItems: 'center',
                  }}>
                    Select text then click a button to format
                  </span>
                </div>

                <textarea
                  className="field"
                  rows={12}
                  name="body"
                  placeholder={`Write your article here using simple formatting:\n\n## Section heading\n### Sub heading\n- Bullet point\n> Highlighted quote\n**bold word** inside a sentence\n\nPlain paragraphs need no special symbols.`}
                  style={{ borderRadius: '0 0 8px 8px', borderTop: 'none' }}
                  {...register('body')}
                />
                {errors.body && <span className={styles.err}>{errors.body.message}</span>}

                {/* Character count */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                  <span style={{ fontSize: 9, color: 'var(--tx3)' }}>
                    {(watchedBody || '').length} characters
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <label className={styles.lbl}>Cover image URL</label>
                <input
                  className="field"
                  placeholder="https://images.unsplash.com/…"
                  {...register('imageUrl')}
                />
                {errors.imageUrl && <span className={styles.err}>{errors.imageUrl.message}</span>}
                <p className={styles.hint}>Paste any public image URL. Unsplash recommended. Shown as article cover in the app.</p>
              </div>
            </Panel>

            {/* ── Formatting guide panel ── */}
            <Panel
              title="Formatting guide"
              icon="ti-markdown"
              action={showGuide ? 'Hide' : 'Show'}
              onAction={() => setShowGuide(g => !g)}
            >
              {showGuide && (
                <div>
                  {/* Guide table */}
                  <div style={{ marginBottom: 14 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {['You type', 'What it looks like in app', 'Example'].map(h => (
                            <th key={h} style={{
                              fontSize: 9, fontWeight: 600, letterSpacing: 1.5,
                              textTransform: 'uppercase', color: 'var(--tx2)',
                              padding: '5px 10px', borderBottom: '1px solid var(--bd)',
                              textAlign: 'left',
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {FORMAT_GUIDE.map((row, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--bd)' }}>
                            <td style={{ padding: '8px 10px' }}>
                              <code style={{
                                fontSize: 11, fontFamily: 'monospace',
                                background: 'var(--bg3)', padding: '2px 7px',
                                borderRadius: 4, color: 'var(--accent)',
                              }}>
                                {row.syntax}
                              </code>
                            </td>
                            <td style={{ padding: '8px 10px', fontSize: 11, color: 'var(--tx1)' }}>
                              {row.desc}
                            </td>
                            <td style={{ padding: '8px 10px' }}>
                              <code style={{
                                fontSize: 10, fontFamily: 'monospace',
                                color: 'var(--tx2)',
                              }}>
                                {row.example}
                              </code>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Quick example */}
                  <div style={{
                    background: 'var(--bg2)', borderRadius: 8,
                    padding: '12px 14px',
                    border: '1px solid var(--bd)',
                  }}>
                    <div style={{
                      fontSize: 9, fontWeight: 600, letterSpacing: 1.5,
                      textTransform: 'uppercase', color: 'var(--tx3)', marginBottom: 8,
                    }}>
                      Example article body
                    </div>
                    <pre style={{
                      fontSize: 11, color: 'var(--tx1)', margin: 0,
                      fontFamily: 'monospace', lineHeight: 1.7,
                      whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    }}>
{`## What is Prakriti?

Prakriti is your unique body constitution.

### The 3 Doshas

- **Vata** — Air and Space
- **Pitta** — Fire and Water
- **Kapha** — Earth and Water

> Two women with PCOS can need opposite protocols.

This is why **personalised care** matters.`}
                    </pre>
                  </div>
                </div>
              )}
            </Panel>

          </div>

          {/* ── Right: Settings sidebar ── */}
          <div className={styles.formSide}>

            <Panel title="Age group" icon="ti-users">
              <p className={styles.hint} style={{ marginBottom: 10 }}>
                Only users in this age group will see this article in the app.
              </p>
              <div className={styles.ageChips}>
                {AGE_GROUPS.map((ag) => (
                  <button
                    key={ag}
                    type="button"
                    className={[styles.ageChip, watchedAgeGroup === ag ? styles.ageChipActive : ''].join(' ')}
                    onClick={() => setValue('ageGroup', ag, { shouldDirty: true })}
                  >
                    {AGE_LABELS[ag]}
                  </button>
                ))}
              </div>
              {errors.ageGroup && <span className={styles.err}>{errors.ageGroup.message}</span>}
            </Panel>

            <Panel title="Publication status" icon="ti-send">
              <div className={styles.statusOptions}>
                {(['live', 'draft']).map((s) => (
                  <label key={s} className={[styles.statusOpt, watchedStatus === s ? styles.statusOptActive : ''].join(' ')}>
                    <input
                      type="radio"
                      value={s}
                      {...register('status')}
                      style={{ display: 'none' }}
                    />
                    <i className={`ti ${s === 'live' ? 'ti-circle-check' : 'ti-circle-dashed'}`} />
                    <div>
                      <div className={styles.statusLabel}>{s === 'live' ? 'Live' : 'Draft'}</div>
                      <div className={styles.statusDesc}>
                        {s === 'live' ? 'Visible in app immediately' : 'Saved but not published'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </Panel>

            {/* ── Live app preview ── */}
            {showPreview && (
              <Panel title="Live app preview" icon="ti-device-mobile">
                <p className={styles.hint} style={{ marginBottom: 10 }}>
                  This is how your article will look inside the AAVIE app.
                </p>
                <LivePreview
                  body={watchedBody}
                  title={watchedTitle}
                  imageUrl={previewUrl}
                  category={watchedCategory}
                />
              </Panel>
            )}

            {/* Image preview when no live preview */}
            {!showPreview && previewUrl && (
              <Panel title="Image preview" icon="ti-photo">
                <div className={styles.imgPreview}>
                  <img src={previewUrl} alt="Cover preview" onError={() => setPreviewUrl('')} />
                </div>
              </Panel>
            )}

            <div className={styles.formActions}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ justifyContent: 'center' }}
                disabled={isSaving}
              >
                {isSaving
                  ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />Saving…</>
                  : <><i className="ti ti-send" />{isEdit ? 'Update article' : 'Publish to app'}</>
                }
              </button>
              <button
                type="button"
                className="btn"
                style={{ justifyContent: 'center' }}
                onClick={() => navigate('/articles')}
              >
                Cancel
              </button>
            </div>

            {/* <div className={styles.apiNote}>
              <i className="ti ti-info-circle" />
              <span>
                {isEdit
                  ? 'Calls PUT /api/admin/articles/:id on your Spring Boot backend'
                  : 'Calls POST /api/admin/articles on your Spring Boot backend'}
              </span>
            </div> */}

          </div>
        </form>
      </div>
    </div>
  )
}