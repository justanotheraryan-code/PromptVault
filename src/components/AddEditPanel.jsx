import { useState, useEffect, useRef } from 'react'

const CATEGORIES = ['writing', 'code', 'strategy', 'analysis']
const EMPTY_FORM = { title: '', body: '', category: 'writing', tags: [] }

export default function AddEditPanel({ initialData, onSave, onCancel }) {
  const [form, setForm] = useState(
    initialData
      ? { title: initialData.title, body: initialData.body, category: initialData.category, tags: [...initialData.tags] }
      : { ...EMPTY_FORM }
  )
  const [tagInput, setTagInput] = useState('')
  const titleRef = useRef(null)

  useEffect(() => { titleRef.current?.focus() }, [])

  const canSave = form.title.trim().length > 0 && form.body.trim().length > 0

  function handleField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleTagKeyDown(e) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const normalized = tagInput.trim().toLowerCase().replace(/,/g, '')
      if (normalized && !form.tags.includes(normalized)) {
        setForm((f) => ({ ...f, tags: [...f.tags, normalized] }))
      }
      setTagInput('')
    }
    if (e.key === 'Backspace' && !tagInput && form.tags.length > 0) {
      setForm((f) => ({ ...f, tags: f.tags.slice(0, -1) }))
    }
  }

  function removeTag(tag) {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!canSave) return
    onSave(form)
  }

  return (
    <div className="add-edit-panel">
      <div className="add-edit-panel__title">
        {initialData ? 'Edit prompt' : 'New prompt'}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="add-edit-panel__fields">
          <div className="field">
            <label className="field-label">Title</label>
            <input
              ref={titleRef}
              type="text"
              className="input"
              placeholder="Give this prompt a name…"
              value={form.title}
              onChange={(e) => handleField('title', e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div className="field">
            <label className="field-label">Prompt</label>
            <textarea
              className="textarea"
              placeholder="Write the full prompt here. Be specific — the more precise, the more reusable."
              value={form.body}
              onChange={(e) => handleField('body', e.target.value)}
              spellCheck={false}
            />
          </div>

          <div className="add-edit-panel__row">
            <div className="field">
              <label className="field-label">Category</label>
              <select
                className="select"
                value={form.category}
                onChange={(e) => handleField('category', e.target.value)}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="field-label">
                Tags <span className="tag-hint">(press Enter to add)</span>
              </label>
              <div className="tag-input-row">
                {form.tags.map((tag) => (
                  <span key={tag} className="tag-chip tag-chip--removable">
                    {tag}
                    <span className="tag-remove" onClick={() => removeTag(tag)}>×</span>
                  </span>
                ))}
                <input
                  type="text"
                  className="tag-input-row__input"
                  placeholder={form.tags.length === 0 ? 'gpt, refactor, ux…' : ''}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="add-edit-panel__actions">
          <button type="submit" className="btn-primary" disabled={!canSave}>
            {initialData ? 'Update prompt' : 'Save prompt'}
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
