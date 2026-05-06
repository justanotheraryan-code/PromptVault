import { useState, useEffect, useRef } from 'react'
import { usePrompts } from './hooks/usePrompts'
import { useIdentity } from './hooks/useIdentity'
import IdentityGate from './components/IdentityGate'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import CategoryFilter from './components/CategoryFilter'
import TagFilter from './components/TagFilter'
import PromptGrid from './components/PromptGrid'
import AddEditPanel from './components/AddEditPanel'
import ImportExportBar from './components/ImportExportBar'
import AnalyticsView from './components/AnalyticsView'
import './styles.css'

function getInitialTheme() {
  const saved = localStorage.getItem('promptvault_theme')
  if (saved === 'dark' || saved === 'light') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function App() {
  const identity = useIdentity()
  const vault = usePrompts({ author: identity.author, departmentId: identity.departmentId })
  const [theme, setTheme] = useState(getInitialTheme)
  const [view, setView] = useState('library')
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

  async function handleSave(fields) {
    try {
      if (editingPrompt) {
        await vault.updatePrompt(editingPrompt.id, fields)
        showStatus('Prompt updated')
      } else {
        await vault.addPrompt(fields)
        showStatus('Prompt saved')
      }
      setShowPanel(false)
      setEditingPrompt(null)
    } catch (err) {
      showStatus(err.message || 'Save failed', 'error')
    }
  }

  function handleCancel() {
    setShowPanel(false)
    setEditingPrompt(null)
  }

  async function handleCopy(prompt) {
    try {
      await navigator.clipboard.writeText(prompt.body)
    } catch {}
    try {
      await vault.incrementUseCount(prompt.id)
      vault.recordCopyToday()
    } catch (err) {
      showStatus(err.message || 'Failed to log use', 'error')
    }
  }

  async function handleDelete(id) {
    try {
      await vault.deletePrompt(id)
      showStatus('Prompt deleted')
    } catch (err) {
      showStatus(err.message || 'Delete failed', 'error')
    }
  }

  async function handleRate(id, score) {
    try {
      await vault.ratePrompt(id, score)
      showStatus(`Rated ${score} ★`)
    } catch (err) {
      showStatus(err.message || 'Rating failed', 'error')
    }
  }

  async function handleImport(file) {
    const result = await vault.importJSON(file)
    if (result.success) {
      showStatus(`Imported ${result.added} prompt${result.added !== 1 ? 's' : ''}`)
    } else {
      showStatus(result.error || 'Invalid file format', 'error')
    }
  }

  if (!identity.ready) {
    return <IdentityGate onReady={identity.setIdentity} />
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
        author={identity.author}
        departments={vault.departments}
        departmentId={identity.departmentId}
        onChangeDepartment={(id) => identity.setIdentity({ departmentId: id })}
        onSignOut={identity.clearIdentity}
        view={view}
        onChangeView={setView}
      />

      <div className="page-inner">
        {view === 'analytics' ? (
          <AnalyticsView />
        ) : (
          <>
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
              <div className="controls-row__scope">
                <button
                  className={`category-tab${vault.scope === 'mine' ? ' category-tab--active' : ''}`}
                  onClick={() => vault.setScope('mine')}
                >
                  My department
                </button>
                <button
                  className={`category-tab${vault.scope === 'all' ? ' category-tab--active' : ''}`}
                  onClick={() => vault.setScope('all')}
                >
                  All teams
                </button>
              </div>
              {!showPanel && (
                <button className="btn-primary" onClick={handleNewPrompt}>
                  + New prompt
                </button>
              )}
            </div>

            <CategoryFilter active={vault.category} onSelect={vault.setCategory} />
            <TagFilter
              tags={vault.allTags}
              activeTag={vault.activeTag}
              onSelect={vault.setActiveTag}
            />

            {statusMessage && (
              <div key={statusMessage} className={statusClass}>
                {statusMessage}
              </div>
            )}

            {vault.error && (
              <div className="status-line status-line--error">{vault.error}</div>
            )}

            <PromptGrid
              prompts={vault.filteredPrompts}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCopy={handleCopy}
              onRate={handleRate}
              currentAuthor={identity.author}
            />

            <hr className="divider" style={{ marginTop: '48px' }} />

            <ImportExportBar
              totalPrompts={vault.prompts.length}
              onExport={vault.exportJSON}
              onImport={handleImport}
            />
          </>
        )}
      </div>
    </div>
  )
}
