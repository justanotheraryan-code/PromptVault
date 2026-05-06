import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export default function IdentityGate({ onReady }) {
  const [name, setName] = useState('')
  const [departments, setDepartments] = useState([])
  const [departmentId, setDepartmentId] = useState('')
  const [newDept, setNewDept] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api
      .listDepartments()
      .then((list) => {
        setDepartments(list)
        if (list.length > 0) {
          setDepartmentId(list[0].id)
          setShowCreate(false)
        } else {
          setShowCreate(true)
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreateDept(e) {
    e.preventDefault()
    if (!newDept.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const dept = await api.createDepartment(newDept.trim())
      setDepartments((prev) => {
        const exists = prev.some((d) => d.id === dept.id)
        return exists ? prev : [...prev, dept].sort((a, b) => a.name.localeCompare(b.name))
      })
      setDepartmentId(dept.id)
      setNewDept('')
      setShowCreate(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !departmentId) return
    onReady({ author: name.trim(), departmentId })
  }

  const hasDepartments = departments.length > 0

  return (
    <div className="identity-gate">
      <div className="identity-gate__card">
        <div className="identity-gate__title">Welcome to PromptVault</div>
        <div className="identity-gate__subtitle">
          {hasDepartments
            ? 'Enter your name and join your department.'
            : 'Tell us who you are and create your first department.'}
        </div>

        {loading ? (
          <div className="identity-gate__loading">Loading departments…</div>
        ) : (
          <form onSubmit={handleSubmit} className="identity-gate__form">
            <div className="field">
              <label className="field-label">Your name</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Salil Narkar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            {hasDepartments && (
              <div className="field">
                <label className="field-label">Department</label>
                <select
                  className="select"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                      {d.promptCount > 0 ? ` · ${d.promptCount} prompts` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error && <div className="status-line status-line--error">{error}</div>}

            <button
              type="submit"
              className="btn-primary identity-gate__submit"
              disabled={!name.trim() || !departmentId}
            >
              Join
            </button>

            {hasDepartments && !showCreate && (
              <button
                type="button"
                className="identity-gate__link"
                onClick={() => setShowCreate(true)}
              >
                Don't see your department? Create a new one
              </button>
            )}

            {showCreate && (
              <div className="identity-gate__create">
                <label className="field-label">New department name</label>
                <div className="identity-gate__new-dept">
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Marketing, Engineering, Operations…"
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleCreateDept}
                    disabled={!newDept.trim() || submitting}
                  >
                    {submitting ? 'Adding…' : 'Add'}
                  </button>
                </div>
                {hasDepartments && (
                  <button
                    type="button"
                    className="identity-gate__link identity-gate__link--small"
                    onClick={() => {
                      setShowCreate(false)
                      setNewDept('')
                      setError(null)
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
