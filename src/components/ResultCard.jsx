import { Link } from 'react-router-dom'
import './ResultCard.css'

export default function ResultCard({
  wpm, accuracy, correctWords, errorCount,
  mode, timeLimit, wordGoal, timeTaken,
  onRetry
}) {
  return (
    <div className="result-container">
      <div className="result-wpm">
        <span className="result-wpm-number">{wpm}</span>
        <span className="result-wpm-label">wpm</span>
      </div>

      <div className="result-stats">
        <div className="stat">
          <span className="stat-value">{accuracy}%</span>
          <span className="stat-label">accuracy</span>
        </div>
        <div className="stat-divider" />
        <div className="stat">
          <span className="stat-value">{correctWords}</span>
          <span className="stat-label">correct</span>
        </div>
        <div className="stat-divider" />
        <div className="stat">
          <span className="stat-value">{errorCount}</span>
          <span className="stat-label">errors</span>
        </div>
        <div className="stat-divider" />
        {mode === 'words' ? (
          <div className="stat">
            <span className="stat-value">{timeTaken}s</span>
            <span className="stat-label">time taken</span>
          </div>
        ) : (
          <div className="stat">
            <span className="stat-value">{timeLimit}s</span>
            <span className="stat-label">time</span>
          </div>
        )}
        <div className="stat-divider" />
        <div className="stat">
          <span className="stat-value">{mode === 'words' ? wordGoal : '∞'}</span>
          <span className="stat-label">{mode === 'words' ? 'words' : 'mode'}</span>
        </div>
      </div>

      <div className="result-actions">
        <button className="retry-btn" onClick={onRetry}>
          try again
        </button>
        <Link to="/leaderboard" className="leaderboard-link">
          view leaderboard →
        </Link>
      </div>
    </div>
  )
}
