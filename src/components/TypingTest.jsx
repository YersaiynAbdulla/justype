import { useRef, useEffect, useState } from 'react'
import { useTypingTest } from '../hooks/useTypingTest'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import ResultCard from './ResultCard'
import './TypingTest.css'

const TIME_OPTIONS = [15, 30, 60]

export default function TypingTest() {
  const [timeLimit, setTimeLimit] = useState(30)
  const { user } = useAuth()
  const {
    words, wordIndex, currentInput, wordStatuses,
    timeLeft, started, finished,
    wpm, accuracy, correctWords, errorCount,
    handleInput, reset, inputRef,
  } = useTypingTest(timeLimit)

  const wordsRef = useRef(null)
  const savedRef = useRef(false)

  useEffect(() => {
    if (finished && user && !savedRef.current) {
      savedRef.current = true
      supabase.from('results').insert({
        user_id: user.id,
        wpm,
        accuracy,
        correct_words: correctWords,
        error_count: errorCount,
        time_limit: timeLimit,
      })
    }
  }, [finished, user, wpm, accuracy, correctWords, errorCount, timeLimit])

  useEffect(() => {
    savedRef.current = false
  }, [wordIndex === 0 && !started])

  useEffect(() => {
    if (wordsRef.current) {
      const activeWord = wordsRef.current.querySelector('.word-active')
      if (activeWord) {
        activeWord.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }
  }, [wordIndex])

  const handleTimeChange = (t) => {
    setTimeLimit(t)
    reset(t)
  }

  if (finished) {
    return (
      <ResultCard
        wpm={wpm}
        accuracy={accuracy}
        correctWords={correctWords}
        errorCount={errorCount}
        timeLimit={timeLimit}
        onRetry={() => { savedRef.current = false; reset(timeLimit) }}
      />
    )
  }

  return (
    <div className="typing-container">
      <div className="test-header">
        <div className="time-options">
          {TIME_OPTIONS.map(t => (
            <button
              key={t}
              className={`time-btn ${timeLimit === t ? 'active' : ''}`}
              onClick={() => handleTimeChange(t)}
            >
              {t}s
            </button>
          ))}
        </div>
        <div className={`timer ${timeLeft <= 5 ? 'timer-urgent' : ''}`}>
          {timeLeft}
        </div>
      </div>

      <div className="words-display" ref={wordsRef} onClick={() => inputRef.current?.focus()}>
        {words.map((word, wi) => {
          const status = wordStatuses[wi]
          const isActive = wi === wordIndex

          return (
            <span
              key={wi}
              className={`word ${status === 'correct' ? 'word-correct' : ''} ${status === 'incorrect' ? 'word-incorrect' : ''} ${isActive ? 'word-active' : ''}`}
            >
              {word.split('').map((char, ci) => {
                let charClass = 'char'
                if (isActive) {
                  if (ci < currentInput.length) {
                    charClass += currentInput[ci] === char ? ' char-correct' : ' char-error'
                  } else if (ci === currentInput.length) {
                    charClass += ' char-cursor'
                  }
                } else if (status === 'correct') {
                  charClass += ' char-correct'
                } else if (status === 'incorrect') {
                  charClass += ' char-error'
                }
                return <span key={ci} className={charClass}>{char}</span>
              })}
            </span>
          )
        })}
      </div>

      <input
        ref={inputRef}
        className="typing-input"
        value={currentInput}
        onChange={e => handleInput(e.target.value)}
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        placeholder={started ? '' : 'start typing...'}
      />

      <div className="test-footer">
        <button className="restart-btn" onClick={() => { savedRef.current = false; reset(timeLimit) }}>
          restart
        </button>
        {!user && (
          <p className="guest-note">sign in to save your results</p>
        )}
      </div>
    </div>
  )
}
