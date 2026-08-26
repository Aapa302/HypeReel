import { motion, useAnimationControls } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'

import { copyText } from '../lib/clipboard'

const CONFIRM_MS = 1500

export default function HashtagChip({ tag, delay = 0 }) {
  const controls = useAnimationControls()
  const [copied, setCopied] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const handleClick = useCallback(async () => {
    controls.start({
      scale: [1, 1.18, 1],
      transition: { duration: 0.36, times: [0, 0.4, 1], ease: [0.22, 1, 0.36, 1] },
    })

    try {
      await copyText(tag)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), CONFIRM_MS)
    } catch {
      setCopied(false)
    }
  }, [controls, tag])

  return (
    <motion.div
      className="inline-flex"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.4, delay }}
    >
      <motion.button
        type="button"
        className="pill"
        onClick={handleClick}
        animate={controls}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          key={copied ? 'copied' : 'idle'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18 }}
          className="inline-flex items-center gap-1.5"
        >
          {copied && (
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {copied ? 'Copied!' : tag}
        </motion.span>
      </motion.button>
    </motion.div>
  )
}
