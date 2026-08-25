import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Short synthesised "click" for the lamp cord. Audio starts muted so the page
 * never makes noise on its own, and the AudioContext is only created after the
 * user unmutes (browsers block it before a gesture anyway).
 */
export default function useClickSound() {
  const [muted, setMuted] = useState(true)
  const contextRef = useRef(null)

  useEffect(
    () => () => {
      contextRef.current?.close()
      contextRef.current = null
    },
    [],
  )

  const play = useCallback(() => {
    if (muted) return

    const AudioCtx = window.AudioContext ?? window.webkitAudioContext
    if (!AudioCtx) return

    if (!contextRef.current) contextRef.current = new AudioCtx()
    const ctx = contextRef.current
    if (ctx.state === 'suspended') ctx.resume()

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(1400, now)
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.07)

    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.006)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11)

    osc.connect(gain).connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.12)
  }, [muted])

  const toggleMuted = useCallback(() => setMuted((value) => !value), [])

  return { muted, toggleMuted, play }
}
