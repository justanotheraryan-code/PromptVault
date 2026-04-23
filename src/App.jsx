import { useState, useEffect, useRef } from 'react'
import { usePrompts } from './hooks/usePrompts'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import CategoryFilter from './components/CategoryFilter'
import TagFilter from './components/TagFilter'
import PromptGrid from './components/PromptGrid'
import AddEditPanel from './components/AddEditPanel'
import ImportExportBar from './components/ImportExportBar'
import './styles.css'

function getInitialTheme() {
  const saved = localStorage.getItem('promptvault_theme')
  if (saved === 'dark' || saved === 'light') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function App() {
  const vault = usePrompts()
  const [theme, setTheme] = useState(getInitialTheme)
  const [showPanel, setShowPanel] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState(null)
  const [statusMessage, setStatusMessage] = useState(null)
  const [statusType, setStatusType] = useState('default')
  const statusTimerRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('promptvault_theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

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
      showStatus('Prompt updated')
    } else {
      vault.addPrompt(fields)
      showStatus('Prompt saved')
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
    showStatus('Prompt deleted')
  }

  async function handleImport(file) {
    const result = await vault.importJSON(file)
    if (result.success) {
      showStatus(`Imported ${result.added} prompt${result.added !== 1 ? 's' : ''}`)
    } else {
      showStatus('Invalid file format', 'error')
    }
  }

  const statusClass =
    statusType === 'error'
      ? 'status-line status-line--error'
      : statusType === 'warn'
      ? 'status-line status-line--warn'
      : 'status-line'

  return (
    <div className="page">
      <Header
        totalPrompts={vault.prompts.length}
        copiesToday={vault.copiesToday}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="page-inner">
        {showPanel && (
          <AddEditPanel
            key={editingPrompt?.id ?? 'new'}
            initialData={editingPrompt}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}

        <div className="controls-row">
          <div className="controls-row__search">
            <SearchBar value={vault.query} onChange={vault.setQuery} />
          </div>
          {!showPanel && (
            <button className="btn-primary" onClick={handleNewPrompt}>
              + New prompt
            </button>
          )}
        </div>

        <CategoryFilter active={vault.category} onSelect={vault.setCategory} />
        <TagFilter tags={vault.allTags} activeTag={vault.activeTag} onSelect={vault.setActiveTag} />

        {statusMessage && (
          <div key={statusMessage} className={statusClass}>
            {statusMessage}
          </div>
        )}

        <PromptGrid
          prompts={vault.filteredPrompts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCopy={handleCopy}
        />

        <hr className="divider" style={{ marginTop: '48px' }} />

        <ImportExportBar
          totalPrompts={vault.prompts.length}
          onExport={vault.exportJSON}
          onImport={handleImport}
        />
      </div>
    </div>
  )
}
