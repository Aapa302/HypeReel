import { motion } from 'framer-motion'
import { Suspense, lazy } from 'react'

const LoadingOrb = lazy(() => import('./LoadingOrb'))

const STEPS = ['Uploading your clip', 'Watching the footage', 'Writing captions', 'Painting the thumbnail']

export default function ProcessingState() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-2xl px-5 pb-20 sm:px-8"
    >
      <div className="glass glass-glow flex flex-col items-center gap-4 p-8 text-center">
        <Suspense fallback={<div className="h-40 w-40" />}>
          <LoadingOrb />
        </Suspense>
        <h2 className="text-2xl font-bold text-white sm:text-3xl">Processing your video…</h2>
        <p className="max-w-sm text-sm text-slate-400">
          Our AI is watching the clip, writing captions and generating a thumbnail. This usually takes under a minute.
        </p>
        <ul className="mt-2 flex flex-wrap justify-center gap-2">
          {STEPS.map((step, index) => (
            <motion.li
              key={step}
              className="pill !text-xs"
              initial={{ opacity: 0.35 }}
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: index * 0.5 }}
            >
              {step}
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.section>
  )
}
