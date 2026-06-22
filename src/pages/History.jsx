import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import './History.css'

export default function History() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (!user) { navigate('/auth'); return }

    supabase
      .from('results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        const rows = data || []
        setResults(rows)
        if (rows.length > 0) {
          const best = Math.max(...rows.map(r => r.wpm))
          const avg = Math.round(rows.reduce((a, r) => a + r.wpm, 0) / rows.length)
          const avgAcc = Math.round(rows.reduce((a, r) => a + r.accuracy, 0) / rows.length)
          setStats({ best, avg, avgAcc, total: rows.length })
        }
        setLoading(false)
      })
  }, [user])

  return (
    <main className="history-page">
      <div className="history-container">
        <h1 className="history-title">your history</h1>

        {loading ? (
          <div className="history-loading">loading...</div>
        ) : results.length === 0 ? (
          <div className="history-empty">
            no results yet — <span onClick={() => navigate('/')} className="history-link">take a test</span>
          </div>
        ) : (
          <>
            {stats && (
              <div className="history-stats">
                <div className="hstat">
                  <span className="hstat-value">{stats.best}</span>
                  <span className="hstat-label">best wpm</span>
                </div>
                <div className="hstat-divider" />
                <div className="hstat">
                  <span className="hstat-value">{stats.avg}</span>
                  <span className="hstat-label">avg wpm</span>
                </div>
                <div className="hstat-divider" />
                <div className="hstat">
                  <span className="hstat-value">{stats.avgAcc}%</span>
                  <span className="hstat-label">avg accuracy</span>
                </div>
                <div className="hstat-divider" />
                <div className="hstat">
                  <span className="hstat-value">{stats.total}</span>
                  <span className="hstat-label">tests taken</span>
                </div>
              </div>
            )}

            <div className="history-table-wrap">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>wpm</th>
                    <th>accuracy</th>
                    <th>correct</th>
                    <th>errors</th>
                    <th>time</th>
                    <th>date</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.id}>
                      <td className="hwpm">{r.wpm}</td>
                      <td className="hacc">{r.accuracy}%</td>
                      <td>{r.correct_words}</td>
                      <td className={r.error_count > 0 ? 'herr' : ''}>{r.error_count}</td>
                      <td>{r.time_limit}s</td>
                      <td className="hdate">
                        {new Date(r.created_at).toLocaleDateString()} {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
