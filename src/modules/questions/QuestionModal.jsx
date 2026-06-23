import { useState } from 'react'
import { useCreateQuestion, useUpdateQuestion } from '../../hooks/useQuestions'
import styles from './QuestionsPage.module.css'



// ── Option builders per assessment type ──────────────────────────────────────

function PrakritiOptionRow({ opt, index, onChange, onDelete }) {
  return (
    <div className={styles.optRow}>
      <div className={styles.optNum}>{index + 1}</div>
      <div className={styles.optFields}>
        <input
          className="field"
          placeholder="Option text e.g. Light & thin"
          value={opt.label || ''}
          onChange={e => onChange(index, { ...opt, label: e.target.value })}
        />
        <select
          className="field"
          value={opt.dosha || 'Vata'}
          onChange={e => onChange(index, { ...opt, dosha: e.target.value })}
          style={{ width: 120, flexShrink: 0 }}
        >
          <option value="Vata">Vata</option>
          <option value="Pitta">Pitta</option>
          <option value="Kapha">Kapha</option>
        </select>
      </div>
      <button className={styles.optDelete} onClick={() => onDelete(index)}>
        <i className="ti ti-trash" />
      </button>
    </div>
  )
}

function PcosOptionRow({ opt, index, onChange, onDelete }) {
  return (
    <div className={styles.optRowPcos}>
      <div className={styles.optNum}>{index + 1}</div>
      <div className={styles.optFieldsPcos}>
        {/* Option text */}
        <input
          className="field"
          placeholder="Option text"
          value={opt.t || ''}
          onChange={e => onChange(index, { ...opt, t: e.target.value })}
          style={{ gridColumn: '1 / -1' }}
        />
        {/* Key */}
        <div className={styles.scoreField}>
          <label>Key</label>
          <input
            className="field"
            placeholder="e.g. scanty"
            value={opt.k || ''}
            onChange={e => onChange(index, { ...opt, k: e.target.value })}
          />
        </div>
        {/* Type */}
        <div className={styles.scoreField}>
          <label>Type</label>
          <select
            className="field"
            value={opt.type || 'multi'}
            onChange={e => onChange(index, { ...opt, type: e.target.value })}
          >
            <option value="multi">Multi</option>
            <option value="single">Single (s field)</option>
          </select>
        </div>
        {/* Scores */}
        {['v', 'p', 'k_', 'hormonal', 'sleep', 'stress', 'pcos', 'flag'].map(field => (
          <div key={field} className={styles.scoreField}>
            <label>{field}</label>
            <input
              className="field"
              type="number"
              placeholder="0"
              value={opt[field] || ''}
              onChange={e => onChange(index, {
                ...opt,
                [field]: e.target.value === '' ? undefined : Number(e.target.value)
              })}
            />
          </div>
        ))}
    
      </div>
      <button className={styles.optDelete} onClick={() => onDelete(index)}>
        <i className="ti ti-trash" />
      </button>
    </div>
  )
}

function VikritiSingleOptionRow({ opt, index, onChange, onDelete }) {
  return (
    <div className={styles.optRowPcos}>
      <div className={styles.optNum}>{index + 1}</div>
      <div className={styles.optFieldsPcos}>
        <input
          className="field"
          placeholder="Option text"
          value={opt.t || ''}
          onChange={e => onChange(index, { ...opt, t: e.target.value })}
          style={{ gridColumn: '1 / -1' }}
        />
        {/* Agni type — for Digestive Fire questions */}
        <div className={styles.scoreField}>
          <label>Agni</label>
          <select
            className="field"
            value={opt.agni || ''}
            onChange={e => onChange(index, { ...opt, agni: e.target.value || undefined })}
          >
            <option value="">— none —</option>
            <option value="sama">sama</option>
            <option value="vishama">vishama</option>
            <option value="tikshna">tikshna</option>
            <option value="manda">manda</option>
          </select>
        </div>
        {/* Vikriti scores — for Body State questions */}
        {['vikV', 'vikP', 'vikK'].map(field => (
          <div key={field} className={styles.scoreField}>
            <label>{field}</label>
            <input
              className="field"
              type="number"
              placeholder="0"
              value={opt[field] || ''}
              onChange={e => onChange(index, {
                ...opt,
                [field]: e.target.value === '' ? undefined : Number(e.target.value)
              })}
            />
          </div>
        ))}
        {/* vik — balanced fallback string */}
        <div className={styles.scoreField}>
          <label>vik</label>
          <select
            className="field"
            value={opt.vik || ''}
            onChange={e => onChange(index, { ...opt, vik: e.target.value || undefined })}
          >
            <option value="">— none —</option>
            <option value="sama">sama (balanced)</option>
          </select>
        </div>
      </div>
      <button className={styles.optDelete} onClick={() => onDelete(index)}>
        <i className="ti ti-trash" />
      </button>
    </div>
  )
}


function VikritiMultiOptionRow({ opt, index, onChange, onDelete }) {
  return (
    <div className={styles.optRowPcos}>
      <div className={styles.optNum}>{index + 1}</div>
      <div className={styles.optFieldsPcos}>
        <input
          className="field"
          placeholder="Option text"
          value={opt.t || ''}
          onChange={e => onChange(index, { ...opt, t: e.target.value })}
          style={{ gridColumn: '1 / -1' }}
        />
        {/* Key */}
        <div className={styles.scoreField}>
          <label>Key</label>
          <input
            className="field"
            placeholder="e.g. coat"
            value={opt.k || ''}
            onChange={e => onChange(index, { ...opt, k: e.target.value })}
          />
        </div>
        {/* Ama score */}
        <div className={styles.scoreField}>
          <label>ama</label>
          <input
            className="field"
            type="number"
            placeholder="0"
            value={opt.ama || ''}
            onChange={e => onChange(index, {
              ...opt,
              ama: e.target.value === '' ? undefined : Number(e.target.value)
            })}
          />
        </div>
        {/* Liver score */}
        <div className={styles.scoreField}>
          <label>liver</label>
          <input
            className="field"
            type="number"
            placeholder="0"
            value={opt.liver || ''}
            onChange={e => onChange(index, {
              ...opt,
              liver: e.target.value === '' ? undefined : Number(e.target.value)
            })}
          />
        </div>
        {/* isTongueCoat toggle */}
        <div className={styles.scoreField}>
          <label>isTongueCoat</label>
          <select
            className="field"
            value={opt.isTongueCoat ? 'true' : ''}
            onChange={e => onChange(index, { ...opt, isTongueCoat: e.target.value === 'true' || undefined })}
          >
            <option value="">No</option>
            <option value="true">Yes</option>
          </select>
        </div>
        {/* urgent toggle */}
        <div className={styles.scoreField}>
          <label>urgent</label>
          <select
            className="field"
            value={opt.urgent ? 'true' : ''}
            onChange={e => onChange(index, { ...opt, urgent: e.target.value === 'true' || undefined })}
          >
            <option value="">No</option>
            <option value="true">Yes</option>
          </select>
        </div>
        {/* Flag — for medication options */}
        <div className={styles.scoreField}>
          <label>Flag</label>
          <select
            className="field"
            value={opt.flag || ''}
            onChange={e => onChange(index, { ...opt, flag: e.target.value || undefined })}
          >
            <option value="">— none —</option>
            <option value="_IRON_SUPP">_IRON_SUPP</option>
            <option value="_AYUR_MED">_AYUR_MED</option>
            <option value="_PSYCH_MED">_PSYCH_MED</option>
            <option value="_THYROID_MED">_THYROID_MED</option>
            <option value="_HORMONAL">_HORMONAL</option>
            <option value="_OCP">_OCP</option>
          </select>
        </div>
      </div>
      <button className={styles.optDelete} onClick={() => onDelete(index)}>
        <i className="ti ti-trash" />
      </button>
    </div>
  )
}

// ── Parse existing optionsJson into UI state ──────────────────────────────────
function parseOptions(optionsJson, assessmentType, questionType) {
  try {
    return JSON.parse(optionsJson || '[]')
  } catch {
    return []
  }
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function QuestionModal({ question = {}, assessmentType, onClose }) {
  const isEdit = !!question?.id
  const createMutation = useCreateQuestion()
  const updateMutation = useUpdateQuestion()

  const [form, setForm] = useState({
    assessmentType: assessmentType || 'PRAKRITI',
    questionId:    question?.questionId    || '',
    questionText:  question?.questionText  || '',
    subText:       question?.subText       || '',
    section:       question?.section       || '',
    sectionIcon:   question?.sectionIcon   || '',
    questionType:  question?.questionType  || 'single',
    questionOrder: question?.questionOrder || 1,
    isActive:      question?.isActive      ?? true,
    isBanner:      question?.isBanner      ?? false,
    bannerTitle:   question?.bannerTitle   || '',
    bannerDesc:    question?.bannerDesc    || '',
  })

  const [options, setOptions] = useState(
    parseOptions(question?.optionsJson || '[]', assessmentType, question?.questionType || 'single')
  )

  const addOption = () => {
    if (assessmentType === 'PRAKRITI') {
      setOptions(o => [...o, { label: '', dosha: 'Vata' }])
    } else if (assessmentType === 'PCOS') {
      setOptions(o => [...o, { t: '', k: '' }])
   } else {
  if (form.questionType === 'single') {
    setOptions(o => [...o, { t: '' }])
  } else {
    setOptions(o => [...o, { t: '', k: '' }])
  }
}
  }

  const updateOption = (index, newOpt) => {
    setOptions(o => o.map((item, i) => i === index ? newOpt : item))
  }

  const deleteOption = (index) => {
    setOptions(o => o.filter((_, i) => i !== index))
  }

  // Clean options before saving — remove undefined/empty score fields
  const cleanOptions = (opts) => {
    return opts.map(opt => {
      const cleaned = {}
      Object.entries(opt).forEach(([key, val]) => {
        if (val === undefined || val === null || val === '') return
        if (key === 's' && typeof val === 'object') {
          const cleanS = {}
          Object.entries(val).forEach(([sk, sv]) => {
            if (sv !== undefined && sv !== null && sv !== '' && sv !== 0) {
              cleanS[sk] = sv
            }
          })
          if (Object.keys(cleanS).length > 0) cleaned.s = cleanS
          else cleaned.s = {}
        } else {
          cleaned[key] = val
        }
      })
      return cleaned
    })
  }

  const handleSave = async () => {
    if (!form.questionText.trim()) {
      alert('Question text is required')
      return
    }
    if (options.length === 0) {
      alert('Add at least one option')
      return
    }

    const payload = {
      ...form,
      optionsJson: JSON.stringify(cleanOptions(options)),
    }

    if (isEdit) {
      await updateMutation.mutateAsync({ id: question.id, ...payload })
    } else {
      await createMutation.mutateAsync(payload)
    }
    onClose()
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            {isEdit ? 'Edit Question' : 'Add New Question'}
            <span style={{
              marginLeft: 8, fontSize: 10, fontWeight: 600,
              color: 'var(--accent)', background: 'var(--accentBg)',
              padding: '2px 8px', borderRadius: 20
            }}>
              {assessmentType}
            </span>
          </div>
          <button className={styles.modalClose} onClick={onClose}>
            <i className="ti ti-x" />
          </button>
        </div>

        <div className={styles.modalBody}>

          {/* Row 1 — ID + Order */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 10 }}>
            <div className={styles.field}>
              <label className={styles.lbl}>Question ID <span style={{ color: 'var(--tx3)', fontWeight: 400 }}>(e.g. c1, p2, r3)</span></label>
              <input
                className="field"
                value={form.questionId}
                onChange={e => setForm(f => ({ ...f, questionId: e.target.value }))}
                placeholder="c1"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.lbl}>Order</label>
              <input
                className="field"
                type="number"
                value={form.questionOrder}
                onChange={e => setForm(f => ({ ...f, questionOrder: Number(e.target.value) }))}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className={styles.field}>
            <label className={styles.lbl}>Question Text *</label>
            <textarea
              className="field"
              rows={2}
              value={form.questionText}
              onChange={e => setForm(f => ({ ...f, questionText: e.target.value }))}
              placeholder="How regular are your periods?"
            />
          </div>

          {/* Sub Text */}
          <div className={styles.field}>
            <label className={styles.lbl}>Sub Text <span style={{ color: 'var(--tx3)', fontWeight: 400 }}>(optional hint shown under question)</span></label>
            <input
              className="field"
              value={form.subText}
              onChange={e => setForm(f => ({ ...f, subText: e.target.value }))}
              placeholder="Think about the last 6 months..."
            />
          </div>

          {/* Section + Icon */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 10 }}>
            <div className={styles.field}>
              <label className={styles.lbl}>Section</label>
              <input
                className="field"
                value={form.section}
                onChange={e => setForm(f => ({ ...f, section: e.target.value }))}
                placeholder="Your Cycle"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.lbl}>Icon</label>
              <input
                className="field"
                value={form.sectionIcon}
                onChange={e => setForm(f => ({ ...f, sectionIcon: e.target.value }))}
                placeholder="🌸"
              />
            </div>
          </div>

          {/* Question Type */}
          <div className={styles.field}>
            <label className={styles.lbl}>Question Type</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['single', 'multi'].map(type => (
                <button
                  key={type}
                  onClick={() => setForm(f => ({ ...f, questionType: type }))}
                  style={{
                    padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    border: '1.5px solid',
                    borderColor: form.questionType === type ? 'var(--accent)' : 'var(--bd)',
                    background: form.questionType === type ? 'var(--accentBg)' : 'transparent',
                    color: form.questionType === type ? 'var(--accent)' : 'var(--tx2)',
                    cursor: 'pointer',
                  }}
                >
                  {type === 'single' ? 'Single choice' : 'Multi select'}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
              />
              Active
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.isBanner}
                onChange={e => setForm(f => ({ ...f, isBanner: e.target.checked }))}
              />
              Section banner
            </label>
          </div>

          {/* Banner fields */}
          {form.isBanner && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 12, background: 'var(--bg2)', borderRadius: 10, border: '1px solid var(--bd)' }}>
              <div className={styles.field}>
                <label className={styles.lbl}>Banner Title</label>
                <input className="field" value={form.bannerTitle} onChange={e => setForm(f => ({ ...f, bannerTitle: e.target.value }))} />
              </div>
              <div className={styles.field}>
                <label className={styles.lbl}>Banner Description</label>
                <input className="field" value={form.bannerDesc} onChange={e => setForm(f => ({ ...f, bannerDesc: e.target.value }))} />
              </div>
            </div>
          )}

          {/* ── OPTIONS BUILDER ── */}
          <div className={styles.optionsSection}>
            <div className={styles.optionsSectionHeader} style={{ background: 'var(--bg2)' }}>
              <div>
                <div className={styles.lbl}>Answer Options *</div>
                <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 2 }}>
                  {assessmentType === 'PRAKRITI' && 'Each option maps to a Dosha (Vata / Pitta / Kapha)'}
                  {assessmentType === 'PCOS' && 'Each option has a key and score values that drive the PCOS scoring engine'}
                  {assessmentType === 'VIKRITI' && 'Each option has score values that drive the Vikriti scoring engine'}
                </div>
              </div>
              <button className="btn btn-sm" onClick={addOption} style={{ fontSize: 11 }}>
                <i className="ti ti-plus" style={{ fontSize: 12 }} />
                Add option
              </button>
            </div>

            {options.length === 0 && (
              <div className="empty" style={{ padding: '20px 0' }}>
                <i className="ti ti-list" />
                No options yet — click "Add option"
              </div>
            )}

            {options.map((opt, i) => {
              if (assessmentType === 'PRAKRITI') {
                return <PrakritiOptionRow key={i} opt={opt} index={i} onChange={updateOption} onDelete={deleteOption} />
              }
              if (assessmentType === 'PCOS') {
                return <PcosOptionRow key={i} opt={opt} index={i} onChange={updateOption} onDelete={deleteOption} />
              }
              // VIKRITI
              if (form.questionType === 'single') {
                return <VikritiSingleOptionRow key={i} opt={opt} index={i} onChange={updateOption} onDelete={deleteOption} />
              }
              return <VikritiMultiOptionRow key={i} opt={opt} index={i} onChange={updateOption} onDelete={deleteOption} />
            })}
          </div>

        </div>

        <div className={styles.modalFooter}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={isPending}>
            {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Question'}
          </button>
        </div>
      </div>
    </div>
  )
}