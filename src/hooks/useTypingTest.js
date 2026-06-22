import { useState, useEffect, useRef, useCallback } from 'react'
import { generateWords } from '../lib/words'

// mode: 'time' | 'words'
// timeLimit: seconds (time mode)
// wordGoal: number of words (words mode)
export function useTypingTest({ mode = 'time', timeLimit = 30, wordGoal = 25 } = {}) {
  const [words, setWords] = useState(() => generateWords(mode === 'words' ? wordGoal : 80))
  const [wordIndex, setWordIndex] = useState(0)
  const [currentInput, setCurrentInput] = useState('')
  // wordStatuses[i] = { status: 'correct'|'incorrect', typed: string }
  const [wordStatuses, setWordStatuses] = useState([])
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [elapsedMs, setElapsedMs] = useState(0)

  const timerRef = useRef(null)
  const startTimeRef = useRef(null)
  const inputRef = useRef(null)

  // --- derived stats ---
  const correctWords = wordStatuses.filter(s => s.status === 'correct').length
  const errorCount = wordStatuses.filter(s => s.status === 'incorrect').length
  const totalTyped = wordStatuses.length

  const elapsedSec = mode === 'time'
    ? Math.max(timeLimit - timeLeft, 1)
    : Math.max(elapsedMs / 1000, 1)

  const wpm = finished || started
    ? Math.round((correctWords / elapsedSec) * 60)
    : 0

  const accuracy = totalTyped > 0
    ? Math.round((correctWords / totalTyped) * 100)
    : 100

  const timeTaken = mode === 'words' ? (elapsedMs / 1000).toFixed(1) : null

  // --- timer ---
  const startTimer = useCallback(() => {
    if (timerRef.current) return
    startTimeRef.current = Date.now()

    if (mode === 'time') {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current)
            setFinished(true)
            return 0
          }
          return t - 1
        })
      }, 1000)
    } else {
      // word mode: just track elapsed
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startTimeRef.current)
      }, 100)
    }
  }, [mode])

  // --- input handler ---
  const handleInput = useCallback((value) => {
    if (finished) return

    // Start on first keystroke
    if (!started && value.length > 0) {
      setStarted(true)
      startTimer()
    }

    // Space = submit current word
    if (value.endsWith(' ')) {
      const trimmed = value.trimEnd()
      // Don't allow submitting empty input
      if (trimmed.length === 0) return

      const currentWord = words[wordIndex]
      const isCorrect = trimmed === currentWord

      setWordStatuses(prev => {
        const next = [...prev]
        next[wordIndex] = { status: isCorrect ? 'correct' : 'incorrect', typed: trimmed }
        return next
      })

      const nextIndex = wordIndex + 1

      // Word mode: check if done
      if (mode === 'words' && nextIndex >= wordGoal) {
        clearInterval(timerRef.current)
        setElapsedMs(Date.now() - startTimeRef.current)
        setWordIndex(nextIndex)
        setCurrentInput('')
        setFinished(true)
        return
      }

      setWordIndex(nextIndex)
      setCurrentInput('')
      return
    }

    // Backspace at start of input = go back to previous word
    if (value === '' && currentInput === '' && wordIndex > 0) {
      const prevIndex = wordIndex - 1
      setWordIndex(prevIndex)
      // Restore previous word's typed value so user can fix it
      const prevTyped = wordStatuses[prevIndex]?.typed ?? ''
      setCurrentInput(prevTyped)
      // Remove previous word's status so it's "active" again
      setWordStatuses(prev => {
        const next = [...prev]
        next[prevIndex] = undefined
        return next
      })
      return
    }

    setCurrentInput(value)
  }, [finished, started, wordIndex, words, startTimer, currentInput, wordStatuses, mode, wordGoal])

  // --- keyboard handler for backspace detection ---
  const handleKeyDown = useCallback((e) => {
    // Detect backspace when input is already empty â†’ go back
    if (e.key === 'Backspace' && currentInput === '' && wordIndex > 0) {
      e.preventDefault()
      const prevIndex = wordIndex - 1
      const prevTyped = wordStatuses[prevIndex]?.typed ?? ''
      setWordIndex(prevIndex)
      setCurrentInput(prevTyped)
      setWordStatuses(prev => {
        const next = [...prev]
        next[prevIndex] = undefined
        return next
      })
    }
  }, [currentInput, wordIndex, wordStatuses])

  // --- reset ---
  const reset = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = null
    startTimeRef.current = null
    setWords(generateWords(mode === 'words' ? wordGoal : 80))
    setWordIndex(0)
    setCurrentInput('')
    setWordStatuses([])
    setStarted(false)
    setFinished(false)
    setTimeLeft(timeLimit)
    setElapsedMs(0)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [mode, wordGoal, timeLimit])

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  return {
    words,
    wordIndex,
    currentInput,
    wordStatuses,
    timeLeft,
    elapsedMs,
    timeTaken,
    started,
    finished,
    wpm,
    accuracy,
    correctWords,
    errorCount,
    handleInput,
    handleKeyDown,
    reset,
    inputRef,
  }
}
