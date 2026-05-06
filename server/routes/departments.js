import { Router } from 'express'
import { Department, slugify } from '../models/Department.js'
import { Prompt } from '../models/Prompt.js'

const router = Router()

router.get('/', async (_req, res) => {
  const departments = await Department.find().sort({ name: 1 }).lean()
  const counts = await Prompt.aggregate([
    { $group: { _id: '$department', count: { $sum: 1 } } },
  ])
  const countByDept = Object.fromEntries(counts.map((c) => [String(c._id), c.count]))
  res.json(
    departments.map((d) => ({
      id: String(d._id),
      name: d.name,
      slug: d.slug,
      promptCount: countByDept[String(d._id)] || 0,
      createdAt: d.createdAt,
    }))
  )
})

router.post('/', async (req, res) => {
  const name = String(req.body?.name || '').trim()
  if (!name) return res.status(400).json({ error: 'Department name required' })
  if (name.length > 60) return res.status(400).json({ error: 'Name too long' })
  const slug = slugify(name)
  if (!slug) return res.status(400).json({ error: 'Invalid name' })
  try {
    const existing = await Department.findOne({ $or: [{ name }, { slug }] })
    if (existing) {
      return res.json({ id: String(existing._id), name: existing.name, slug: existing.slug, promptCount: 0 })
    }
    const dept = await Department.create({ name, slug })
    res.status(201).json({ id: String(dept._id), name: dept.name, slug: dept.slug, promptCount: 0 })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  const promptsInDept = await Prompt.countDocuments({ department: req.params.id })
  if (promptsInDept > 0) {
    return res.status(409).json({ error: `Cannot delete — ${promptsInDept} prompt(s) still in this department` })
  }
  await Department.findByIdAndDelete(req.params.id)
  res.json({ ok: true })
})

export default router
