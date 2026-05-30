import { useState } from 'react'
import { Topbar, Panel, Spinner } from '../../components/Layout'
import { useAdminQuestions, useToggleQuestion, useDeleteQuestion } from '../../hooks/useQuestions'
import QuestionModal from './QuestionModal'
import styles from './QuestionsPage.module.css'

const TABS = [
  { key: 'PRAKRITI', label: 'Prakriti', icon: 'ti-dna',               color: '#5A8878' },
  { key: 'PCOS',     label: 'PCOS',     icon: 'ti-heart-rate-monitor', color: '#C0543A' },
  { key: 'VIKRITI',  label: 'Vikriti',  icon: 'ti-activity',           color: '#2A7D4F' },
]

export default function QuestionsPage() {
  const [activeTab, setActiveTab]   = useState('PRAKRITI')
  const [editQuestion, setEditQuestion] = useState(null)  // null = closed, {} = new, {id,...} = edit
  
  const { data: questions = [], isLoading } = useAdminQuestions(activeTab)
  const toggleMutation  = useToggleQuestion()
  const deleteMutation  = useDeleteQuestion()

  const handleDelete = (q) => {
    if (!window.confirm(`Delete "${q.questionText}"?`)) return
    deleteMutation.mutate(q.id)
  }

  return (
    <div className={styles.page}>
      <Topbar
        title="Assessment Questions"
        subtitle="Add, edit or deactivate questions for each assessment"
      />
      <div className={styles.content}>

        {/* Assessment type tabs */}
        <div className={styles.tabs}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={[styles.tab, activeTab === tab.key ? styles.tabActive : ''].join(' ')}
              style={activeTab === tab.key ? { borderColor: tab.color, color: tab.color } : {}}
              onClick={() => setActiveTab(tab.key)}
            >
              <i className={`ti ${tab.icon}`} style={{ fontSize: 14 }} />
              {tab.label}
              <span className={styles.tabCount}>
                {activeTab === tab.key ? questions.length : ''}
              </span>
            </button>
          ))}
        </div>

        <Panel
          title={`${activeTab} Questions`}
          icon="ti-list"
          action="+ Add Question"
          onAction={() => setEditQuestion({ assessmentType: activeTab })}
        >
          {isLoading && <Spinner />}

          {!isLoading && questions.length === 0 && (
            <div className="empty">
              <i className="ti ti-file-unknown" />
              No questions yet — click "Add Question" to create the first one
            </div>
          )}

          {!isLoading && questions.map((q, i) => (
            <div key={q.id} className={[styles.qRow, !q.isActive ? styles.qRowInactive : ''].join(' ')}>
              
              {/* Order number */}
              <div className={styles.qOrder}>{q.questionOrder ?? i + 1}</div>

              {/* Question info */}
              <div className={styles.qBody}>
                <div className={styles.qMeta}>
                  <span className={styles.qSection}>{q.section}</span>
                  <span className={`tag ${q.questionType === 'single' ? 'tag-accent' : 'tag-amber'}`} style={{ fontSize: 9 }}>
                    {q.questionType === 'single' ? 'Single choice' : 'Multi select'}
                  </span>
                  {!q.isActive && <span className="tag tag-muted" style={{ fontSize: 9 }}>Inactive</span>}
                </div>
                <div className={styles.qText}>{q.questionText}</div>
                {q.subText && (
                  <div className={styles.qSub}>{q.subText}</div>
                )}
                {/* Options preview */}
                {q.optionsJson && (() => {
                  try {
                    const opts = JSON.parse(q.optionsJson)
                    return (
                      <div className={styles.qOpts}>
                        {opts.slice(0, 3).map((o, oi) => (
                          <span key={oi} className={styles.qOpt}>
                            {o.label || o.t}
                          </span>
                        ))}
                        {opts.length > 3 && (
                          <span className={styles.qOpt}>+{opts.length - 3} more</span>
                        )}
                      </div>
                    )
                  } catch { return null }
                })()}
              </div>

              {/* Actions */}
              <div className={styles.qActions}>
                <button
                  className="btn btn-sm"
                  style={{ fontSize: 10 }}
                  onClick={() => setEditQuestion(q)}
                >
                  <i className="ti ti-edit" style={{ fontSize: 12 }} />
                  Edit
                </button>
                <button
                  className="btn btn-sm"
                  style={{ fontSize: 10 }}
                  onClick={() => toggleMutation.mutate(q.id)}
                  title={q.isActive ? 'Deactivate' : 'Activate'}
                >
                  <i className={`ti ${q.isActive ? 'ti-eye-off' : 'ti-eye'}`} style={{ fontSize: 12 }} />
                </button>
                <button
                  className="btn btn-sm"
                  style={{ fontSize: 10, color: 'var(--rose)' }}
                  onClick={() => handleDelete(q)}
                >
                  <i className="ti ti-trash" style={{ fontSize: 12 }} />
                </button>
              </div>
            </div>
          ))}
        </Panel>
      </div>

      {/* Add/Edit Modal */}
      {editQuestion !== null && (
        <QuestionModal
          question={editQuestion}
          assessmentType={activeTab}
          onClose={() => setEditQuestion(null)}
        />
      )}
    </div>
  )
}