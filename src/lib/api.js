async function request(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  if (!res.ok) {
    let msg = `Request failed (${res.status})`
    try {
      const data = await res.json()
      if (data?.error) msg = data.error
    } catch {}
    throw new Error(msg)
  }
  if (res.status === 204) return null
  return res.json()
}

export const api = {
  // Departments
  listDepartments: () => request('/api/departments'),
  createDepartment: (name) =>
    request('/api/departments', { method: 'POST', body: JSON.stringify({ name }) }),
  deleteDepartment: (id) => request(`/api/departments/${id}`, { method: 'DELETE' }),

  // Prompts
  listPrompts: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ).toString()
    return request(`/api/prompts${qs ? `?${qs}` : ''}`)
  },
  createPrompt: (payload) =>
    request('/api/prompts', { method: 'POST', body: JSON.stringify(payload) }),
  updatePrompt: (id, payload) =>
    request(`/api/prompts/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deletePrompt: (id) => request(`/api/prompts/${id}`, { method: 'DELETE' }),
  recordUse: (id, { author, department }) =>
    request(`/api/prompts/${id}/use`, {
      method: 'POST',
      body: JSON.stringify({ author, department }),
    }),
  ratePrompt: (id, score) =>
    request(`/api/prompts/${id}/score`, { method: 'POST', body: JSON.stringify({ score }) }),
  importPrompts: (prompts, { author, department }) =>
    request('/api/prompts/import', {
      method: 'POST',
      body: JSON.stringify({ prompts, author, department }),
    }),

  // Analytics
  getAnalytics: () => request('/api/analytics'),
}
