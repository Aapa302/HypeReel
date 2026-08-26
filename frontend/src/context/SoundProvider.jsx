import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { SoundContext } from './soundContext'

/**
 * Shared Web Audio helpers for the lamp click and the generation success chime.
 * Audio starts muted so the page never makes noise on its own, and the
 * AudioContext is only created after the user unmutes (browsers block it
 * before a gesture anyway).
 */
export default function SoundProvider({ children }) {
  const [muted, setMuted] = useState(true)
  const contextRef = useRef(null)

  useEffect(
    () => () => {
      contextRef.current?.close()
      contextRef.current = null
    },
    [],
  )

  const getContext = useCallback(() => {
    if (muted) return null

    const AudioCtx = window.AudioContext ?? window.webkitAudioContext
    if (!AudioCtx) return null

    if (!contextRef.current) contextRef.current = new AudioCtx()
    const ctx = contextRef.current
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  }, [muted])

  const playClick = useCallback(() => {
    const ctx = getContext()
    if (!ctx) return

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
  }, [getContext])

  // Three-note arpeggio, quiet and short, played once results land.
  const playSuccess = useCallback(() => {
    const ctx = getContext()
    if (!ctx) return

    const start = ctx.currentTime + 0.02
    const notes = [659.25, 830.61, 1108.73]

    notes.forEach((frequency, index) => {
      const at = start + index * 0.1
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(frequency, at)

      gain.gain.setValueAtTime(0.0001, at)
      gain.gain.exponentialRampToValueAtTime(0.12, at + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.34)

      osc.connect(gain).connect(ctx.destination)
      osc.start(at)
      osc.stop(at + 0.36)
    })
  }, [getContext])

  const toggleMuted = useCallback(() => setMuted((value) => !value), [])

  const value = useMemo(
    () => ({ muted, toggleMuted, playClick, playSuccess }),
    [muted, toggleMuted, playClick, playSuccess],
  )

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}
