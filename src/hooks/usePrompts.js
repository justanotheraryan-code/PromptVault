import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { api } from '../lib/api'

function todayKey() {
  return `promptvault_copies_${new Date().toISOString().slice(0, 10)}`
}

export function usePrompts({ author, departmentId } = {}) {
  const [prompts, setPrompts] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [query, setQueryRaw] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [category, setCategory] = useState('ALL')
  const [activeTag, setActiveTag] = useState(null)
  const [scope, setScope] = useState('mine') // 'mine' | 'all'
  const [copiesToday, setCopiesToday] = useState(0)
  const debounceRef = useRef(null)

  useEffect(() => {
    setCopiesToday(parseInt(localStorage.getItem(todayKey()) ?? '0', 10))
  }, [])

  const refreshDepartments = useCallback(async () => {
    try {
      const list = await api.listDepartments()
      setDepartments(list)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  const refreshPrompts = useCallback(async () => {
    if (!author || !departmentId) {
      setPrompts([])
      return
    }
    setLoading(true)
    try {
      const list = await api.listPrompts(scope === 'mine' ? { department: departmentId } : {})
      setPrompts(list)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [author, departmentId, scope])

  useEffect(() => {
    refreshDepartments()
  }, [refreshDepartments])

  useEffect(() => {
    refreshPrompts()
  }, [refreshPrompts])

  const setQuery = useCallback((q) => {
    setQueryRaw(q)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedQuery(q), 150)
  }, [])

  const filteredPrompts = useMemo(() => {
    const q = debouncedQuery.toLowerCase()
    return prompts.filter((p) => {
      const matchesCategory = category === 'ALL' || p.category === category.toLowerCase()
      const matchesTag = !activeTag || p.tags.includes(activeTag)
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      return matchesCategory && matchesTag && matchesQuery
    })
  }, [prompts, debouncedQuery, category, activeTag])

  const allTags = useMemo(() => {
    const tagSet = new Set()
    prompts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [prompts])

  const addPrompt = useCallback(
    async (fields) => {
      const created = await api.createPrompt({
        ...fields,
        department: departmentId,
        author,
      })
      setPrompts((prev) => [created, ...prev])
      refreshDepartments()
      return created
    },
    [author, departmentId, refreshDepartments]
  )

  const updatePrompt = useCallback(async (id, fields) => {
    const updated = await api.updatePrompt(id, fields)
    setPrompts((prev) => prev.map((p) => (p.id === id ? updated : p)))
    return updated
  }, [])

  const deletePrompt = useCallback(
    async (id) => {
      await api.deletePrompt(id)
      setPrompts((prev) => prev.filter((p) => p.id !== id))
      refreshDepartments()
    },
    [refreshDepartments]
  )

  const incrementUseCount = useCallback(
    async (id) => {
      if (!author || !departmentId) return
      const updated = await api.recordUse(id, { author, department: departmentId })
      setPrompts((prev) => prev.map((p) => (p.id === id ? updated : p)))
    },
    [author, departmentId]
  )

  const ratePrompt = useCallback(async (id, score) => {
    const updated = await api.ratePrompt(id, score)
    setPrompts((prev) => prev.map((p) => (p.id === id ? updated : p)))
  }, [])

  const recordCopyToday = useCallback(() => {
    const key = todayKey()
    const current = parseInt(localStorage.getItem(key) ?? '0', 10)
    const next = current + 1
    localStorage.setItem(key, String(next))
    setCopiesToday(next)
  }, [])

  const createDepartment = useCallback(
    async (name) => {
      const dept = await api.createDepartment(name)
      await refreshDepartments()
      return dept
    },
    [refreshDepartments]
  )

  const exportJSON = useCallback(() => {
    const date = new Date().toISOString().slice(0, 10)
    const payload = prompts.map((p) => ({
      id: p.id,
      title: p.title,
      body: p.body,
      category: p.category,
      tags: p.tags,
      author: p.author,
      qualityScore: p.qualityScore,
      useCount: p.useCount,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }))
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `promptvault_${date}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [prompts])

  const importJSON = useCallback(
    (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            const imported = JSON.parse(e.target.result)
            if (!Array.isArray(imported)) throw new Error('invalid format')
            const result = await api.importPrompts(imported, { author, department: departmentId })
            await refreshPrompts()
            await refreshDepartments()
            resolve({ success: true, added: result.added })
          } catch (err) {
            resolve({ success: false, error: err.message })
          }
        }
        reader.readAsText(file)
      })
    },
    [author, departmentId, refreshPrompts, refreshDepartments]
  )

  return {
    prompts,
    filteredPrompts,
    departments,
    allTags,
    loading,
    error,
    copiesToday,
    query,
    category,
    activeTag,
    scope,
    setQuery,
    setCategory,
    setActiveTag,
    setScope,
    addPrompt,
    updatePrompt,
    deletePrompt,
    incrementUseCount,
    ratePrompt,
    recordCopyToday,
    createDepartment,
    refreshPrompts,
    refreshDepartments,
    exportJSON,
    importJSON,
  }
}
