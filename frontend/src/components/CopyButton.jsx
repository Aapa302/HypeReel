import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'

import { copyText } from '../lib/clipboard'

const CONFIRM_MS = 1500

/**
 * Copy button that swaps its label for "Copied!" plus a checkmark for a moment
 * after a successful copy, fading between the two states.
 */
export default function CopyButton({ value, label = 'Copy', copiedLabel = 'Copied!', className = 'btn-ghost' }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const handleClick = useCallback(async () => {
    try {
      await copyText(value)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), CONFIRM_MS)
    } catch {
      setCopied(false)
    }
  }, [value])

  return (
    <button type="button" className={className} onClick={handleClick} aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={copied ? 'copied' : 'idle'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="inline-flex items-center gap-1.5"
        >
          {copied && (
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {copied ? copiedLabel : label}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
