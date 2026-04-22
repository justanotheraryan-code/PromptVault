import { useState, useEffect, useRef, useMemo, useCallback } from 'react'

const STORAGE_KEY = 'promptvault_prompts'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persist(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function todayKey() {
  return `promptvault_copies_${new Date().toISOString().slice(0, 10)}`
}

export function usePrompts() {
  const [prompts, setPrompts] = useState([])
  const [query, setQueryRaw] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [category, setCategory] = useState('ALL')
  const [activeTag, setActiveTag] = useState(null)
  const [copiesToday, setCopiesToday] = useState(0)
  const debounceRef = useRef(null)

  useEffect(() => {
    setPrompts(load())
    setCopiesToday(parseInt(localStorage.getItem(todayKey()) ?? '0', 10))
  }, [])

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
    (fields) => {
      const now = new Date().toISOString()
      const next = [
        {
          id: crypto.randomUUID(),
          title: fields.title.trim(),
          body: fields.body.trim(),
          category: fields.category,
          tags: fields.tags,
          createdAt: now,
          updatedAt: now,
          useCount: 0,
        },
        ...prompts,
      ]
      setPrompts(next)
      persist(next)
    },
    [prompts]
  )

  const updatePrompt = useCallback(
    (id, fields) => {
      const next = prompts.map((p) =>
        p.id === id ? { ...p, ...fields, updatedAt: new Date().toISOString() } : p
      )
      setPrompts(next)
      persist(next)
    },
    [prompts]
  )

  const deletePrompt = useCallback(
    (id) => {
      const next = prompts.filter((p) => p.id !== id)
      setPrompts(next)
      persist(next)
    },
    [prompts]
  )

  const incrementUseCount = useCallback(
    (id) => {
      const prompt = prompts.find((p) => p.id === id)
      if (!prompt) return
      const next = prompts.map((p) =>
        p.id === id ? { ...p, useCount: (p.useCount ?? 0) + 1, updatedAt: new Date().toISOString() } : p
      )
      setPrompts(next)
      persist(next)
    },
    [prompts]
  )

  const recordCopyToday = useCallback(() => {
    const key = todayKey()
    const current = parseInt(localStorage.getItem(key) ?? '0', 10)
    const next = current + 1
    localStorage.setItem(key, String(next))
    setCopiesToday(next)
  }, [])

  const exportJSON = useCallback(() => {
    const date = new Date().toISOString().slice(0, 10)
    const blob = new Blob([JSON.stringify(prompts, null, 2)], { type: 'application/json' })
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
        reader.onload = (e) => {
          try {
            const imported = JSON.parse(e.target.result)
            if (!Array.isArray(imported)) throw new Error('invalid format')
            const existingIds = new Set(prompts.map((p) => p.id))
            const toAdd = imported.filter((p) => p.id && !existingIds.has(p.id))
            const next = [...toAdd, ...prompts]
            setPrompts(next)
            persist(next)
            resolve({ success: true, added: toAdd.length })
          } catch {
            resolve({ success: false, error: 'invalid file' })
          }
        }
        reader.readAsText(file)
      })
    },
    [prompts]
  )

  return {
    prompts,
    filteredPrompts,
    allTags,
    copiesToday,
    query,
    category,
    activeTag,
    setQuery,
    setCategory,
    setActiveTag,
    addPrompt,
    updatePrompt,
    deletePrompt,
    incrementUseCount,
    recordCopyToday,
    exportJSON,
    importJSON,
  }
}
