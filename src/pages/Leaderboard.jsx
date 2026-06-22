import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import './Leaderboard.css'

const TIME_FILTERS = [15, 30, 60]

export default function Leaderboard() {
  const [filter, setFilter] = useState(30)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    supabase
      .from('leaderboard')
      .select('*')
      .eq('time_limit', filter)
      .order('wpm', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setRows(data || [])
        setLoading(false)
      })
  }, [filter])

  return (
    <main className="lb-page">
      <div className="lb-container">
        <div className="lb-header">
          <h1 className="lb-title">leaderboard</h1>
          <div className="lb-filters">
            {TIME_FILTERS.map(t => (
              <button
                key={t}
                className={`lb-filter-btn ${filter === t ? 'active' : ''}`}
                onClick={() => setFilter(t)}
              >
                {t}s
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="lb-loading">loading...</div>
        ) : rows.length === 0 ? (
          <div className="lb-empty">no results yet. be the first!</div>
        ) : (
          <div className="lb-table-wrap">
            <table className="lb-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>player</th>
                  <th>wpm</th>
                  <th>accuracy</th>
                  <th>date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.id} className={i < 3 ? `top-${i + 1}` : ''}>
                    <td className="rank">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </td>
                    <td className="player">{row.email || 'anonymous'}</td>
                    <td className="wpm-cell">{row.wpm}</td>
                    <td className="acc-cell">{row.accuracy}%</td>
                    <td className="date-cell">{new Date(row.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
