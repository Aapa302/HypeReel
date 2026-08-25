import { motion, useAnimationControls } from 'framer-motion'
import { useCallback, useRef } from 'react'

import useClickSound from '../hooks/useClickSound'

const PULL_DISTANCE = 34
const PULL_THRESHOLD = 12

function MuteToggle({ muted, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={!muted}
      aria-label={muted ? 'Unmute the lamp click' : 'Mute the lamp click'}
      className="pill inline-flex items-center gap-2 !px-3 !py-1.5 !text-xs text-slate-300"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 9.5h3L11 6v12l-4-3.5H4z" strokeLinecap="round" strokeLinejoin="round" />
        {muted ? (
          <path d="M15.5 9.5l5 5m0-5l-5 5" strokeLinecap="round" />
        ) : (
          <path d="M15.5 9a4 4 0 010 6m2.5-8.5a7 7 0 010 11" strokeLinecap="round" />
        )}
      </svg>
      {muted ? 'Sound off' : 'Sound on'}
    </button>
  )
}

/**
 * Hero entry point: an SVG desk lamp with a draggable pull cord. Pulling the
 * cord toggles `on`, which the hero uses to reveal the upload card.
 */
export default function PullCordLamp({ on, onToggle, locked = false }) {
  const cord = useAnimationControls()
  const { muted, toggleMuted, play } = useClickSound()
  const dragged = useRef(false)

  const pull = useCallback(() => {
    cord.start({
      y: [0, PULL_DISTANCE, 0],
      transition: { duration: 0.62, times: [0, 0.3, 1], ease: [0.22, 1, 0.36, 1] },
    })
    play()
    if (!locked) onToggle()
  }, [cord, locked, onToggle, play])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-[248px] w-[240px] select-none sm:h-[288px] sm:w-[280px]">
        {/* Radial glow behind the shade, plus a soft cone of light below it. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[26%] -z-10 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
          style={{
            background:
              'radial-gradient(circle, rgba(236,72,153,0.55) 0%, rgba(168,85,247,0.35) 35%, rgba(56,189,248,0.16) 60%, transparent 72%)',
          }}
          animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.65 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[30%] -z-10 h-[300px] w-[320px] -translate-x-1/2 blur-2xl"
          style={{
            background:
              'radial-gradient(60% 100% at 50% 0%, rgba(168,85,247,0.45) 0%, rgba(56,189,248,0.14) 55%, transparent 80%)',
            clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
          }}
          animate={{ opacity: on ? 0.9 : 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />

        <svg viewBox="0 0 240 260" className="h-full w-full" role="img" aria-label="Desk lamp">
          <defs>
            <linearGradient id="lamp-shade" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1b2140" />
              <stop offset="55%" stopColor="#131834" />
              <stop offset="100%" stopColor="#0a0d20" />
            </linearGradient>
            <linearGradient id="lamp-rim" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <radialGradient id="lamp-bulb" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#fdf4ff" />
              <stop offset="45%" stopColor="#e879f9" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* base */}
          <ellipse cx="120" cy="238" rx="54" ry="11" fill="url(#lamp-shade)" stroke="rgba(255,255,255,0.14)" />
          <ellipse cx="120" cy="233" rx="34" ry="7" fill="rgba(255,255,255,0.05)" />

          {/* pole */}
          <rect x="116" y="104" width="8" height="130" rx="4" fill="url(#lamp-shade)" stroke="rgba(255,255,255,0.12)" />

          {/* dome shade */}
          <path
            d="M46 104a74 66 0 0 1 148 0z"
            fill="url(#lamp-shade)"
            stroke="rgba(255,255,255,0.16)"
            strokeWidth="1.5"
          />
          <path d="M46 104a74 66 0 0 1 148 0" fill="none" stroke="url(#lamp-rim)" strokeWidth="2.5" opacity="0.6" />
          <path
            d="M60 96a60 52 0 0 1 60-52"
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* bulb + rim light, only visible when the lamp is on */}
          <motion.ellipse
            cx="120"
            cy="104"
            rx="74"
            ry="9"
            fill="url(#lamp-rim)"
            initial={false}
            animate={{ opacity: on ? 0.95 : 0.25 }}
            transition={{ duration: 0.5 }}
          />
          <motion.circle
            cx="120"
            cy="102"
            r="34"
            fill="url(#lamp-bulb)"
            initial={false}
            animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.6 }}
            style={{ transformOrigin: '120px 102px' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>

        {/* pull cord — tap or drag down */}
        <motion.div
          className="absolute left-[calc(50%+66px)] top-[36%] flex origin-top cursor-grab flex-col items-center active:cursor-grabbing"
          animate={cord}
          drag="y"
          dragDirectionLock
          dragConstraints={{ top: 0, bottom: PULL_DISTANCE }}
          dragElastic={0.25}
          dragMomentum={false}
          onDragStart={() => {
            dragged.current = true
          }}
          onDragEnd={(_, info) => {
            if (info.offset.y > PULL_THRESHOLD) pull()
            else cord.start({ y: 0, transition: { type: 'spring', stiffness: 320, damping: 18 } })
          }}
          onTap={() => {
            if (dragged.current) {
              dragged.current = false
              return
            }
            pull()
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              pull()
            }
          }}
          role="button"
          tabIndex={0}
          aria-pressed={on}
          aria-label={on ? 'Pull the cord to turn the lamp off' : 'Pull the cord to turn the lamp on'}
          style={{ touchAction: 'none' }}
        >
          <span className="h-16 w-[2px] rounded-full bg-gradient-to-b from-white/40 to-white/15 sm:h-20" />
          <motion.span
            className="-mt-1 grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-white/10 shadow-glow backdrop-blur-md"
            animate={{
              boxShadow: on
                ? '0 0 32px -4px rgba(236,72,153,0.75)'
                : '0 0 22px -8px rgba(168,85,247,0.55)',
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
          >
            <span className="h-3.5 w-3.5 rounded-full bg-hype-gradient" />
          </motion.span>
          <span className="mt-2 whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400">
            Pull
          </span>
        </motion.div>
      </div>

      <div className="flex items-center gap-3">
        <p className="text-sm text-slate-400">{on ? 'Lamp on — drop your clip below' : 'Pull the cord to start'}</p>
        <MuteToggle muted={muted} onToggle={toggleMuted} />
      </div>
    </div>
  )
}
