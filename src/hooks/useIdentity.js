import { useState, useEffect, useCallback } from 'react'

const NAME_KEY = 'promptvault_author'
const DEPT_KEY = 'promptvault_department_id'

function read(key) {
  try {
    return localStorage.getItem(key) || ''
  } catch {
    return ''
  }
}

export function useIdentity() {
  const [author, setAuthor] = useState(() => read(NAME_KEY))
  const [departmentId, setDepartmentId] = useState(() => read(DEPT_KEY))

  useEffect(() => {
    if (author) localStorage.setItem(NAME_KEY, author)
  }, [author])

  useEffect(() => {
    if (departmentId) localStorage.setItem(DEPT_KEY, departmentId)
  }, [departmentId])

  const setIdentity = useCallback((next) => {
    if (next.author !== undefined) setAuthor(next.author)
    if (next.departmentId !== undefined) setDepartmentId(next.departmentId)
  }, [])

  const clearIdentity = useCallback(() => {
    localStorage.removeItem(NAME_KEY)
    localStorage.removeItem(DEPT_KEY)
    setAuthor('')
    setDepartmentId('')
  }, [])

  const ready = Boolean(author && departmentId)
  return { author, departmentId, setIdentity, clearIdentity, ready }
}
