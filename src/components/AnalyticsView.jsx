import { useEffect, useState } from 'react'
import { api } from '../lib/api'

function efficiencyTier(score) {
  if (score >= 75) return { label: 'High', cls: 'tier--high' }
  if (score >= 45) return { label: 'Medium', cls: 'tier--mid' }
  if (score > 0) return { label: 'Low', cls: 'tier--low' }
  return { label: 'No data', cls: 'tier--none' }
}

export default function AnalyticsView() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    api
      .getAnalytics()
      .then((d) => {
        if (alive) setData(d)
      })
      .catch((err) => alive && setError(err.message))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [])

  if (loading) return <div className="analytics__loading">Loading analytics…</div>
  if (error) return <div className="status-line status-line--error">{error}</div>
  if (!data) return null

  const maxEff = Math.max(...data.departments.map((d) => d.efficiencyScore), 1)

  return (
    <div className="analytics">
      <div className="analytics__header">
        <h2 className="analytics__title">AI Efficiency Dashboard</h2>
        <p className="analytics__subtitle">
          Measures how actively each department is creating, refining, and reusing prompts. Higher
          reuse and quality scores mean teams are extracting more value from every prompt they
          write.
        </p>
      </div>

      <div className="analytics__totals">
        <div className="stat-tile">
          <div className="stat-tile__label">Total prompts</div>
          <div className="stat-tile__value">{data.totals.prompts}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile__label">Departments</div>
          <div className="stat-tile__value">{data.totals.departments}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile__label">Total uses</div>
          <div className="stat-tile__value">{data.totals.uses}</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile__label">Uses · last 7 days</div>
          <div className="stat-tile__value">{data.totals.usesLast7d}</div>
        </div>
      </div>

      <div className="analytics__section">
        <h3 className="analytics__section-title">Department efficiency</h3>
        <div className="analytics__legend">
          Score = 50% reuse rate · 30% quality rating · 20% recent activity
        </div>
        <table className="analytics__table">
          <thead>
            <tr>
              <th>Department</th>
              <th className="num">Prompts</th>
              <th className="num">Uses</th>
              <th className="num">Reuse rate</th>
              <th className="num">Avg quality</th>
              <th className="num">Last 7d</th>
              <th>Efficiency</th>
            </tr>
          </thead>
          <tbody>
            {data.departments.length === 0 ? (
              <tr>
                <td colSpan="7" className="analytics__empty">
                  No departments yet.
                </td>
              </tr>
            ) : (
              data.departments.map((d) => {
                const tier = efficiencyTier(d.efficiencyScore)
                return (
                  <tr key={d.id}>
                    <td>
                      <div className="analytics__dept-name">{d.name}</div>
                    </td>
                    <td className="num">{d.prompts}</td>
                    <td className="num">{d.totalUses}</td>
                    <td className="num">{d.reuseRate.toFixed(1)}×</td>
                    <td className="num">{d.avgQuality > 0 ? `${d.avgQuality.toFixed(1)}/5` : '—'}</td>
                    <td className="num">{d.usesLast7d}</td>
                    <td>
                      <div className="analytics__bar-wrap">
                        <div
                          className={`analytics__bar ${tier.cls}`}
                          style={{ width: `${(d.efficiencyScore / maxEff) * 100}%` }}
                        />
                        <span className="analytics__bar-label">
                          {d.efficiencyScore} · {tier.label}
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="analytics__section">
        <h3 className="analytics__section-title">Top prompts by reuse</h3>
        {data.topPrompts.length === 0 ? (
          <div className="analytics__empty">No prompts yet.</div>
        ) : (
          <ol className="analytics__top-list">
            {data.topPrompts.map((p) => (
              <li key={p.id} className="analytics__top-item">
                <div className="analytics__top-title">{p.title}</div>
                <div className="analytics__top-meta">
                  <span>{p.department}</span>
                  <span>·</span>
                  <span>{p.author}</span>
                  <span>·</span>
                  <span>{p.useCount} uses</span>
                  {p.qualityScore > 0 && (
                    <>
                      <span>·</span>
                      <span>★ {p.qualityScore.toFixed(1)}</span>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}
