import { useState, useEffect, useRef, useCallback } from 'react'
import { generateWords } from '../lib/words'

export function useTypingTest(timeLimit = 30) {
  const [words, setWords] = useState(() => generateWords(80))
  const [typed, setTyped] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [correctWords, setCorrectWords] = useState(0)
  const [errorCount, setErrorCount] = useState(0)
  const [timeLeft, setTimeLeft] = useState(timeLimit)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [wordStatuses, setWordStatuses] = useState([])
  const [currentInput, setCurrentInput] = useState('')

  const timerRef = useRef(null)
  const inputRef = useRef(null)

  const wpm = finished
    ? Math.round((correctWords / timeLimit) * 60)
    : started
    ? Math.round((correctWords / Math.max(timeLimit - timeLeft, 1)) * 60)
    : 0

  const totalCharsTyped = wordStatuses.reduce((acc, s) => acc + (s === 'correct' ? words[wordStatuses.indexOf(s)]?.length + 1 : 0), 0)
  const accuracy = wordStatuses.length > 0
    ? Math.round((correctWords / Math.max(wordStatuses.length, 1)) * 100)
    : 100

  const startTimer = useCallback(() => {
    if (timerRef.current) return
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
  }, [])

  const handleInput = useCallback((value) => {
    if (finished) return

    if (!started && value.length > 0) {
      setStarted(true)
      startTimer()
    }

    if (value.endsWith(' ')) {
      const trimmed = value.trim()
      const currentWord = words[wordIndex]
      const isCorrect = trimmed === currentWord

      setWordStatuses(prev => {
        const next = [...prev]
        next[wordIndex] = isCorrect ? 'correct' : 'incorrect'
        return next
      })

      if (isCorrect) setCorrectWords(c => c + 1)
      else setErrorCount(e => e + 1)

      setWordIndex(i => i + 1)
      setCurrentInput('')
    } else {
      setCurrentInput(value)
    }
  }, [finished, started, wordIndex, words, startTimer])

  const reset = useCallback((newTime = timeLimit) => {
    clearInterval(timerRef.current)
    timerRef.current = null
    setWords(generateWords(80))
    setTyped('')
    setWordIndex(0)
    setCharIndex(0)
    setCorrectWords(0)
    setErrorCount(0)
    setTimeLeft(newTime)
    setStarted(false)
    setFinished(false)
    setWordStatuses([])
    setCurrentInput('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [timeLimit])

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  return {
    words,
    wordIndex,
    currentInput,
    wordStatuses,
    timeLeft,
    started,
    finished,
    wpm,
    accuracy,
    correctWords,
    errorCount,
    handleInput,
    reset,
    inputRef,
  }
}
