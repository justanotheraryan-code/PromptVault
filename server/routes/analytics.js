import { Router } from 'express'
import { Prompt } from '../models/Prompt.js'
import { PromptUse } from '../models/PromptUse.js'
import { Department } from '../models/Department.js'

const router = Router()

router.get('/', async (_req, res) => {
  const [totalPrompts, totalDepartments, totalUses] = await Promise.all([
    Prompt.countDocuments(),
    Department.countDocuments(),
    PromptUse.countDocuments(),
  ])

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const usesLast7d = await PromptUse.countDocuments({ usedAt: { $gte: since } })

  const departments = await Department.find().lean()

  const promptStats = await Prompt.aggregate([
    {
      $group: {
        _id: '$department',
        prompts: { $sum: 1 },
        totalUses: { $sum: '$useCount' },
        avgQuality: { $avg: '$qualityScore' },
        ratedPrompts: {
          $sum: { $cond: [{ $gt: ['$qualityRatings', 0] }, 1, 0] },
        },
      },
    },
  ])
  const promptStatsByDept = Object.fromEntries(promptStats.map((s) => [String(s._id), s]))

  const recentUses = await PromptUse.aggregate([
    { $match: { usedAt: { $gte: since } } },
    { $group: { _id: '$department', count: { $sum: 1 } } },
  ])
  const recentByDept = Object.fromEntries(recentUses.map((r) => [String(r._id), r.count]))

  const topPrompts = await Prompt.find()
    .sort({ useCount: -1 })
    .limit(5)
    .populate('department', 'name')
    .lean()

  const departmentBreakdown = departments
    .map((d) => {
      const stats = promptStatsByDept[String(d._id)] || {
        prompts: 0,
        totalUses: 0,
        avgQuality: 0,
        ratedPrompts: 0,
      }
      const reuseRate = stats.prompts > 0 ? stats.totalUses / stats.prompts : 0
      const efficiencyScore = computeEfficiency({
        prompts: stats.prompts,
        totalUses: stats.totalUses,
        avgQuality: stats.avgQuality || 0,
        recentUses: recentByDept[String(d._id)] || 0,
      })
      return {
        id: String(d._id),
        name: d.name,
        prompts: stats.prompts,
        totalUses: stats.totalUses,
        avgQuality: Math.round((stats.avgQuality || 0) * 10) / 10,
        ratedPrompts: stats.ratedPrompts,
        reuseRate: Math.round(reuseRate * 10) / 10,
        usesLast7d: recentByDept[String(d._id)] || 0,
        efficiencyScore,
      }
    })
    .sort((a, b) => b.efficiencyScore - a.efficiencyScore)

  res.json({
    totals: {
      prompts: totalPrompts,
      departments: totalDepartments,
      uses: totalUses,
      usesLast7d,
    },
    departments: departmentBreakdown,
    topPrompts: topPrompts.map((p) => ({
      id: String(p._id),
      title: p.title,
      department: p.department?.name || '—',
      author: p.author,
      useCount: p.useCount || 0,
      qualityScore: p.qualityScore || 0,
    })),
  })
})

function computeEfficiency({ prompts, totalUses, avgQuality, recentUses }) {
  if (prompts === 0) return 0
  const reuse = Math.min(totalUses / prompts, 10) / 10
  const quality = (avgQuality || 0) / 5
  const recency = Math.min(recentUses / Math.max(prompts, 1), 5) / 5
  const score = reuse * 50 + quality * 30 + recency * 20
  return Math.round(score)
}

export default router
