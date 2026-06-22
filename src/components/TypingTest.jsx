import { useRef, useEffect, useState } from 'react'
import { useTypingTest } from '../hooks/useTypingTest'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import ResultCard from './ResultCard'
import './TypingTest.css'

const TIME_OPTIONS = [15, 30, 60]
const WORD_OPTIONS = [10, 25, 50, 100]

export default function TypingTest() {
  const [mode, setMode] = useState('time')       // 'time' | 'words'
  const [timeLimit, setTimeLimit] = useState(30)
  const [wordGoal, setWordGoal] = useState(25)
  const { user } = useAuth()

  const {
    words, wordIndex, currentInput, wordStatuses,
    timeLeft, timeTaken, started, finished,
    wpm, accuracy, correctWords, errorCount,
    handleInput, handleKeyDown, reset, inputRef,
  } = useTypingTest({ mode, timeLimit, wordGoal })

  const wordsRef = useRef(null)
  const savedRef = useRef(false)

  // Save result to Supabase
  useEffect(() => {
    if (finished && user && !savedRef.current) {
      savedRef.current = true
      supabase.from('results').insert({
        user_id: user.id,
        wpm,
        accuracy,
        correct_words: correctWords,
        error_count: errorCount,
        time_limit: mode === 'time' ? timeLimit : null,
        word_goal: mode === 'words' ? wordGoal : null,
        mode,
      })
    }
  }, [finished])

  // Scroll active word into view
  useEffect(() => {
    if (wordsRef.current) {
      const activeWord = wordsRef.current.querySelector('.word-active')
      if (activeWord) {
        activeWord.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
    }
  }, [wordIndex])

  const handleModeChange = (m) => {
    setMode(m)
    savedRef.current = false
  }

  const handleOptionChange = (val) => {
    if (mode === 'time') setTimeLimit(val)
    else setWordGoal(val)
    savedRef.current = false
  }

  // Reset whenever mode/limit changes
  useEffect(() => {
    savedRef.current = false
    reset()
  }, [mode, timeLimit, wordGoal])

  if (finished) {
    return (
      <ResultCard
        wpm={wpm}
        accuracy={accuracy}
        correctWords={correctWords}
        errorCount={errorCount}
        mode={mode}
        timeLimit={timeLimit}
        wordGoal={wordGoal}
        timeTaken={timeTaken}
        onRetry={() => { savedRef.current = false; reset() }}
      />
    )
  }

  const options = mode === 'time' ? TIME_OPTIONS : WORD_OPTIONS
  const activeOption = mode === 'time' ? timeLimit : wordGoal

  // Progress for word mode
  const wordProgress = mode === 'words'
    ? `${Math.min(wordIndex, wordGoal)} / ${wordGoal}`
    : null

  return (
    <div className="typing-container">
      <div className="test-header">
        <div className="mode-group">
          {/* Mode toggle */}
          <div className="mode-toggle">
            <button
              className={`mode-btn ${mode === 'time' ? 'active' : ''}`}
              onClick={() => handleModeChange('time')}
            >
              time
            </button>
            <button
              className={`mode-btn ${mode === 'words' ? 'active' : ''}`}
              onClick={() => handleModeChange('words')}
            >
              words
            </button>
          </div>

          <div className="divider-v" />

          {/* Options */}
          <div className="time-options">
            {options.map(o => (
              <button
                key={o}
                className={`time-btn ${activeOption === o ? 'active' : ''}`}
                onClick={() => handleOptionChange(o)}
              >
                {mode === 'time' ? `${o}s` : o}
              </button>
            ))}
          </div>
        </div>

        {/* Right: timer or word progress */}
        {mode === 'time' ? (
          <div className={`timer ${timeLeft <= 5 ? 'timer-urgent' : ''}`}>
            {timeLeft}
          </div>
        ) : (
          <div className="word-progress">
            {wordProgress}
          </div>
        )}
      </div>

      <div
        className="words-display"
        ref={wordsRef}
        onClick={() => inputRef.current?.focus()}
      >
        {words.slice(0, mode === 'words' ? wordGoal : words.length).map((word, wi) => {
          const status = wordStatuses[wi]
          const isActive = wi === wordIndex
          const isPast = wi < wordIndex && !status

          return (
            <span
              key={wi}
              className={[
                'word',
                status?.status === 'correct' ? 'word-correct' : '',
                status?.status === 'incorrect' ? 'word-incorrect' : '',
                isActive ? 'word-active' : '',
              ].join(' ')}
            >
              {word.split('').map((char, ci) => {
                let charClass = 'char'
                if (isActive) {
                  if (ci < currentInput.length) {
                    charClass += currentInput[ci] === char ? ' char-correct' : ' char-error'
                  } else if (ci === currentInput.length) {
                    charClass += ' char-cursor'
                  }
                } else if (status?.status === 'correct') {
                  charClass += ' char-correct'
                } else if (status?.status === 'incorrect') {
                  // show what they actually typed vs correct
                  const typedChar = status.typed?.[ci]
                  if (typedChar === undefined) charClass += ' char-missing'
                  else if (typedChar === char) charClass += ' char-correct'
                  else charClass += ' char-error'
                }
                return <span key={ci} className={charClass}>{char}</span>
              })}
              {/* Show extra typed chars that exceeded word length */}
              {status?.status === 'incorrect' && status.typed?.length > word.length &&
                status.typed.slice(word.length).split('').map((extra, ei) => (
                  <span key={`extra-${ei}`} className="char char-extra">{extra}</span>
                ))
              }
            </span>
          )
        })}
      </div>

      <input
        ref={inputRef}
        className="typing-input"
        value={currentInput}
        onChange={e => handleInput(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        placeholder={started ? '' : 'start typing...'}
      />

      <div className="test-footer">
        <button className="restart-btn" onClick={() => { savedRef.current = false; reset() }}>
          restart
        </button>
        {!user && (
          <p className="guest-note">sign in to save your results</p>
        )}
      </div>
    </div>
  )
}
