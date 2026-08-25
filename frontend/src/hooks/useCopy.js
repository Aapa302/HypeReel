import { useCallback, useEffect, useRef, useState } from 'react'

import { copyText } from '../lib/clipboard'

export default function useCopy(timeout = 1800) {
  const [copied, setCopied] = useState(null)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = useCallback(
    async (text, key = 'default') => {
      try {
        await copyText(text)
        setCopied(key)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopied(null), timeout)
      } catch {
        setCopied(null)
      }
    },
    [timeout],
  )

  return { copied, copy }
}
