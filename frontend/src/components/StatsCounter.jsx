import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'

import { fetchStats } from '../lib/api'

export default function StatsCounter() {
  const [count, setCount] = useState(null)
  const value = useMotionValue(0)
  const rounded = useTransform(value, (latest) => Math.round(latest).toLocaleString())

  useEffect(() => {
    let active = true

    fetchStats().then((stats) => {
      // Missing or unavailable endpoint keeps the counter hidden.
      if (active && typeof stats?.generations === 'number') setCount(stats.generations)
    })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (count === null) return undefined
    const controls = animate(value, count, { duration: 1.2, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [count, value])

  if (count === null) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="pill mx-auto mt-6 inline-flex items-center gap-2 !py-1.5 !text-xs"
    >
      <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-emerald-400" />
      <span className="font-semibold text-white">
        <motion.span>{rounded}</motion.span> videos processed
      </span>
      <span className="text-slate-400">· trusted by creators</span>
    </motion.div>
  )
}
