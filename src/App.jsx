import { useState, useCallback, useRef } from 'react'
import { usePrompts } from './hooks/usePrompts'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import CategoryFilter from './components/CategoryFilter'
import TagFilter from './components/TagFilter'
import PromptGrid from './components/PromptGrid'
import AddEditPanel from './components/AddEditPanel'
import ImportExportBar from './components/ImportExportBar'
import './styles.css'

export default function App() {
  const vault = usePrompts()
  const [showPanel, setShowPanel] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState(null)
  const [statusMessage, setStatusMessage] = useState(null)
  const [statusType, setStatusType] = useState('default')
  const statusTimerRef = useRef(null)

  function showStatus(msg, type = 'default') {
    setStatusMessage(msg)
    setStatusType(type)
    clearTimeout(statusTimerRef.current)
    statusTimerRef.current = setTimeout(() => setStatusMessage(null), 3000)
  }

  function handleNewPrompt() {
    setEditingPrompt(null)
    setShowPanel(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleEdit(prompt) {
    setEditingPrompt(prompt)
    setShowPanel(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSave(fields) {
    if (editingPrompt) {
      vault.updatePrompt(editingPrompt.id, fields)
      showStatus('> PROMPT UPDATED. VAULT SYNCED.')
    } else {
      vault.addPrompt(fields)
      showStatus('> PROMPT SAVED. VAULT UPDATED.')
    }
    setShowPanel(false)
    setEditingPrompt(null)
  }

  function handleCancel() {
    setShowPanel(false)
    setEditingPrompt(null)
  }

  function handleCopy(prompt) {
    navigator.clipboard.writeText(prompt.body).catch(() => {})
    vault.incrementUseCount(prompt.id)
    vault.recordCopyToday()
  }

  function handleDelete(id) {
    vault.deletePrompt(id)
    showStatus('> PROMPT DELETED.')
  }

  async function handleImport(file) {
    const result = await vault.importJSON(file)
    if (result.success) {
      showStatus(`> IMPORTED ${result.added} PROMPT${result.added !== 1 ? 'S' : ''}. VAULT UPDATED.`)
    } else {
      showStatus('> ERROR: INVALID FILE FORMAT.', 'error')
    }
  }

  const statusClass = statusType === 'error'
    ? 'status-line status-line--error'
    : statusType === 'warn'
    ? 'status-line status-line--warn'
    : 'status-line'

  return (
    <div className="page">
      <Header totalPrompts={vault.prompts.length} copiesToday={vault.copiesToday} />

      <div className="page-inner">
        {showPanel && (
          <AddEditPanel
            key={editingPrompt?.id ?? 'new'}
            initialData={editingPrompt}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}

        <div className="controls-row" style={{ marginBottom: '24px' }}>
          <SearchBar value={vault.query} onChange={vault.setQuery} />
          {!showPanel && (
            <div style={{ paddingTop: '24px' }}>
              <button className="btn-primary" onClick={handleNewPrompt}>
                [ + NEW PROMPT ▶ ]
              </button>
            </div>
          )}
        </div>

        <CategoryFilter active={vault.category} onSelect={vault.setCategory} />
        <TagFilter tags={vault.allTags} activeTag={vault.activeTag} onSelect={vault.setActiveTag} />

        {statusMessage && (
          <div key={statusMessage} className={statusClass} style={{ marginBottom: '16px' }}>
            {statusMessage}
          </div>
        )}

        <PromptGrid
          prompts={vault.filteredPrompts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCopy={handleCopy}
        />

        <hr className="divider divider--labeled" data-label="// VAULT TOOLS" style={{ marginTop: '48px' }} />

        <ImportExportBar
          totalPrompts={vault.prompts.length}
          onExport={vault.exportJSON}
          onImport={handleImport}
        />
      </div>
    </div>
  )
}
