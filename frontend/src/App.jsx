import { AnimatePresence, motion } from 'framer-motion'
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'

import ProcessingState from './components/ProcessingState'
import PullCordLamp from './components/PullCordLamp'
import Results from './components/Results'
import Reveal from './components/Reveal'
import UploadCard from './components/UploadCard'
import { extractErrorMessage, generateFromVideo } from './lib/api'

// three.js is heavy, so the WebGL scene is fetched after the first paint.
const HeroScene = lazy(() => import('./components/HeroScene'))

const FEATURES = [
  { title: 'AI thumbnail', copy: 'A bold 9:16 cover image generated for your clip.' },
  { title: 'Two captions', copy: 'One descriptive, one built to go viral.' },
  { title: 'Trending tags', copy: 'Fresh hashtags matched to what you posted.' },
]

export default function App() {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [lampOn, setLampOn] = useState(false)
  const resultsRef = useRef(null)

  const busy = status === 'loading'

  useEffect(() => {
    if (status === 'done' && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [status])

  const handleSelect = useCallback((selected) => {
    setFile(selected)
    setResult(null)
    setError(null)
    setStatus('idle')
    setProgress(null)
  }, [])

  const handleReset = useCallback(() => {
    setFile(null)
    setResult(null)
    setError(null)
    setStatus('idle')
    setProgress(null)
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!file) return
    setStatus('loading')
    setError(null)
    setResult(null)
    setProgress(0)

    try {
      const data = await generateFromVideo(file, { onProgress: setProgress })
      setResult(data)
      setStatus('done')
    } catch (err) {
      setError(extractErrorMessage(err))
      setStatus('error')
    } finally {
      setProgress(null)
    }
  }, [file])

  // The lamp stays on while an upload/generation is running so the interface
  // can never disappear mid-request.
  const handleLampToggle = useCallback(() => {
    setLampOn((current) => {
      if (current) handleReset()
      return !current
    })
  }, [handleReset])

  return (
    <div className="relative min-h-screen">
      <section className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <Suspense fallback={null}>
            <HeroScene />
          </Suspense>
          <div className="absolute inset-0 bg-gradient-to-b from-ink-900/40 via-ink-900/70 to-ink-900" />
          <motion.div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(60rem 40rem at 50% 30%, rgba(168, 85, 247, 0.28), transparent 70%)',
            }}
            initial={false}
            animate={{ opacity: lampOn ? 1 : 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-hype-gradient text-sm font-black text-white shadow-glow">
              HR
            </span>
            <span className="text-lg font-bold tracking-tight text-white">HypeReel</span>
          </div>
          <a
            className="hidden text-sm font-medium text-slate-300 transition hover:text-white sm:block"
            href="#upload"
          >
            Try it now
          </a>
        </header>

        <div className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="pill !text-xs uppercase tracking-[0.25em] text-violet-200">AI reel toolkit</span>
            <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              <span className="gradient-text">Turn any clip</span>
              <br />
              <span className="text-white">into a viral reel</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base text-slate-300 sm:text-lg">
              Drop in a video and HypeReel generates a scroll-stopping thumbnail, two ready-to-post captions and the
              hashtags that are trending right now.
            </p>
          </motion.div>

          <div id="upload" className="mx-auto mt-10 flex max-w-2xl flex-col items-center">
            <PullCordLamp on={lampOn} onToggle={handleLampToggle} locked={busy} />

            <AnimatePresence initial={false}>
              {lampOn && (
                <motion.div
                  key="upload-card"
                  initial={{ opacity: 0, y: 40, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 24, scale: 0.96 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-10 w-full"
                >
                  <UploadCard
                    file={file}
                    busy={busy}
                    progress={progress}
                    error={status === 'error' ? error : null}
                    onSelect={handleSelect}
                    onGenerate={handleGenerate}
                    onReset={handleReset}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <div ref={resultsRef}>
        <AnimatePresence mode="wait">
          {busy && <ProcessingState key="processing" />}
          {status === 'done' && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Results result={result} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {status !== 'done' && (
        <section className="mx-auto grid max-w-5xl gap-6 px-5 pb-24 sm:grid-cols-3 sm:px-8">
          {FEATURES.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 0.08}>
              <div className="glass h-full p-6">
                <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{feature.copy}</p>
              </div>
            </Reveal>
          ))}
        </section>
      )}

      <footer className="border-t border-white/5 px-5 py-8 text-center text-xs text-slate-500 sm:px-8">
        HypeReel · AI captions, hashtags and thumbnails for short-form video
      </footer>
    </div>
  )
}
