import { Router } from 'express'
import { Prompt } from '../models/Prompt.js'
import { PromptUse } from '../models/PromptUse.js'
import { Department } from '../models/Department.js'

const router = Router()

const ALLOWED_CATEGORIES = ['writing', 'code', 'strategy', 'analysis']

function serialize(p) {
  return {
    id: String(p._id),
    title: p.title,
    body: p.body,
    category: p.category,
    tags: p.tags || [],
    department: p.department ? String(p.department._id || p.department) : null,
    departmentName: p.department && p.department.name ? p.department.name : undefined,
    author: p.author,
    qualityScore: p.qualityScore || 0,
    qualityRatings: p.qualityRatings || 0,
    useCount: p.useCount || 0,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }
}

router.get('/', async (req, res) => {
  const { department, category, tag, q, author } = req.query
  const filter = {}
  if (department) filter.department = department
  if (category && category !== 'all' && category !== 'ALL') {
    filter.category = String(category).toLowerCase()
  }
  if (tag) filter.tags = tag
  if (author) filter.author = author
  if (q) {
    const re = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    filter.$or = [{ title: re }, { body: re }, { tags: re }]
  }
  const prompts = await Prompt.find(filter).populate('department', 'name slug').sort({ createdAt: -1 }).lean()
  res.json(prompts.map(serialize))
})

router.post('/', async (req, res) => {
  const { title, body, category, tags, department, author } = req.body || {}
  if (!title || !body) return res.status(400).json({ error: 'Title and body required' })
  if (!department) return res.status(400).json({ error: 'Department required' })
  if (!author) return res.status(400).json({ error: 'Author required' })
  if (!ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' })
  }
  const dept = await Department.findById(department)
  if (!dept) return res.status(400).json({ error: 'Unknown department' })
  const prompt = await Prompt.create({
    title: String(title).trim(),
    body: String(body).trim(),
    category,
    tags: Array.isArray(tags) ? tags.map((t) => String(t).toLowerCase().trim()).filter(Boolean) : [],
    department: dept._id,
    author: String(author).trim(),
  })
  const populated = await prompt.populate('department', 'name slug')
  res.status(201).json(serialize(populated))
})

router.patch('/:id', async (req, res) => {
  const update = {}
  const { title, body, category, tags } = req.body || {}
  if (title !== undefined) update.title = String(title).trim()
  if (body !== undefined) update.body = String(body).trim()
  if (category !== undefined) {
    if (!ALLOWED_CATEGORIES.includes(category)) return res.status(400).json({ error: 'Invalid category' })
    update.category = category
  }
  if (tags !== undefined) {
    update.tags = Array.isArray(tags) ? tags.map((t) => String(t).toLowerCase().trim()).filter(Boolean) : []
  }
  const updated = await Prompt.findByIdAndUpdate(req.params.id, update, { new: true }).populate('department', 'name slug')
  if (!updated) return res.status(404).json({ error: 'Not found' })
  res.json(serialize(updated))
})

router.delete('/:id', async (req, res) => {
  const removed = await Prompt.findByIdAndDelete(req.params.id)
  if (!removed) return res.status(404).json({ error: 'Not found' })
  await PromptUse.deleteMany({ prompt: req.params.id })
  res.json({ ok: true })
})

router.post('/:id/use', async (req, res) => {
  const { author, department } = req.body || {}
  if (!author || !department) return res.status(400).json({ error: 'author and department required' })
  const prompt = await Prompt.findByIdAndUpdate(
    req.params.id,
    { $inc: { useCount: 1 } },
    { new: true }
  ).populate('department', 'name slug')
  if (!prompt) return res.status(404).json({ error: 'Not found' })
  await PromptUse.create({ prompt: prompt._id, department, author })
  res.json(serialize(prompt))
})

router.post('/:id/score', async (req, res) => {
  const score = Number(req.body?.score)
  if (!Number.isFinite(score) || score < 1 || score > 5) {
    return res.status(400).json({ error: 'score must be 1–5' })
  }
  const prompt = await Prompt.findById(req.params.id)
  if (!prompt) return res.status(404).json({ error: 'Not found' })
  const totalRatings = prompt.qualityRatings || 0
  const currentAvg = prompt.qualityScore || 0
  const newRatings = totalRatings + 1
  const newAvg = (currentAvg * totalRatings + score) / newRatings
  prompt.qualityRatings = newRatings
  prompt.qualityScore = Math.round(newAvg * 10) / 10
  await prompt.save()
  const populated = await prompt.populate('department', 'name slug')
  res.json(serialize(populated))
})

router.post('/import', async (req, res) => {
  const { prompts, department, author } = req.body || {}
  if (!Array.isArray(prompts)) return res.status(400).json({ error: 'prompts array required' })
  if (!department || !author) return res.status(400).json({ error: 'department and author required' })
  const dept = await Department.findById(department)
  if (!dept) return res.status(400).json({ error: 'Unknown department' })
  let added = 0
  for (const p of prompts) {
    if (!p?.title || !p?.body) continue
    const cat = ALLOWED_CATEGORIES.includes(p.category) ? p.category : 'writing'
    await Prompt.create({
      title: String(p.title).trim(),
      body: String(p.body).trim(),
      category: cat,
      tags: Array.isArray(p.tags) ? p.tags.map((t) => String(t).toLowerCase().trim()).filter(Boolean) : [],
      department: dept._id,
      author: String(author).trim(),
    })
    added++
  }
  res.json({ added })
})

export default router
