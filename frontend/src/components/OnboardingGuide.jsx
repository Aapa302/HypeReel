import { motion } from 'framer-motion'

const STEPS = [
  {
    title: 'Upload your clip',
    copy: 'Drop in any short video — MP4, MOV or WebM.',
    icon: (
      <>
        <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 15v2.5A2.5 2.5 0 006.5 20h11A2.5 2.5 0 0020 17.5V15" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: 'AI writes the hype',
    copy: 'Two captions and trending hashtags, generated for your footage.',
    icon: (
      <>
        <path d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 16.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    title: 'Post and go viral',
    copy: 'Copy, paste and publish to Reels, Shorts or TikTok.',
    icon: (
      <>
        <path d="M4 18l5-6 4 3 3-4 4 7z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 6h6" strokeLinecap="round" />
      </>
    ),
  },
]

export default function OnboardingGuide({ onDismiss, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16, scale: 0.98 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`glass glass-glow w-full p-6 sm:p-8 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-300/90">How it works</p>
          <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">Three steps to a viral reel</h2>
        </div>
        <button type="button" className="btn-ghost !px-4 !py-2 !text-xs" onClick={onDismiss}>
          Got it
        </button>
      </div>

      <ol className="mt-6 grid gap-4 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <motion.li
            key={step.title}
            initial={{ opacity: 0, y: 18, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.15 + index * 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="flex items-center gap-3">
              <motion.span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/5 text-fuchsia-300 shadow-glow"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, delay: index * 0.4, ease: 'easeInOut' }}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  {step.icon}
                </svg>
              </motion.span>
              <span className="text-sm font-bold text-white">
                {index + 1}. {step.title}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-400">{step.copy}</p>
          </motion.li>
        ))}
      </ol>
    </motion.div>
  )
}
