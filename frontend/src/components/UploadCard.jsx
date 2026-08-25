import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import TiltCard from './TiltCard'
import { extractVideoThumbnail } from '../lib/videoThumbnail'

function formatSize(bytes) {
  if (!bytes) return ''
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return null
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${mins}:${String(secs).padStart(2, '0')}`
}

export default function UploadCard({ file, onSelect, onGenerate, onReset, busy, progress, error }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [previewState, setPreviewState] = useState(null)

  useEffect(() => {
    if (!file) return undefined

    let active = true

    extractVideoThumbnail(file)
      .then((result) => {
        if (active) setPreviewState({ file, ...result })
      })
      .catch((err) => {
        if (active) setPreviewState({ file, error: err.message })
      })

    return () => {
      active = false
    }
  }, [file])

  // Stale results from a previously selected file are ignored during render.
  const current = previewState?.file === file ? previewState : null
  const preview = current?.dataUrl ? current : null
  const previewError = current?.error ?? null

  const pickFile = (candidate) => {
    if (!candidate) return
    onSelect(candidate)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    if (busy) return
    pickFile(Array.from(event.dataTransfer.files).find((f) => f.type.startsWith('video/')) ?? event.dataTransfer.files[0])
  }

  const uploading = busy && progress !== null && progress < 100

  return (
    <TiltCard className="w-full" intensity={0.6}>
      <div className="glass glass-glow overflow-hidden p-5 sm:p-8">
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload a video"
          onClick={() => !busy && inputRef.current?.click()}
          onKeyDown={(event) => {
            if (!busy && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault()
              inputRef.current?.click()
            }
          }}
          onDragOver={(event) => {
            event.preventDefault()
            if (!busy) setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl
            border-2 border-dashed p-6 text-center transition ${
              dragging
                ? 'border-fuchsia-400/80 bg-fuchsia-500/10 shadow-glow-strong'
                : 'border-white/15 bg-white/[0.02] hover:border-violet-400/60 hover:bg-white/[0.05]'
            } ${busy ? 'cursor-progress opacity-80' : ''}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(event) => {
              pickFile(event.target.files?.[0])
              event.target.value = ''
            }}
          />

          <AnimatePresence mode="wait">
            {preview ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="flex w-full flex-col items-center gap-4"
              >
                <div className="relative rounded-2xl p-[2px] shadow-glow-strong">
                  <div className="absolute inset-0 rounded-2xl bg-hype-gradient opacity-80 blur-[2px]" />
                  <img
                    src={preview.dataUrl}
                    alt="Frame from the selected video"
                    className="relative max-h-56 w-auto rounded-2xl object-cover"
                  />
                </div>
                <div className="text-sm text-slate-300">
                  <p className="truncate font-semibold text-white">{file?.name}</p>
                  <p className="text-slate-400">
                    {[formatSize(file?.size), formatDuration(preview.duration)].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="animate-float rounded-2xl border border-white/15 bg-white/5 p-4 shadow-glow">
                  <svg className="h-8 w-8 text-fuchsia-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 15v2.5A2.5 2.5 0 006.5 20h11A2.5 2.5 0 0020 17.5V15" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-white sm:text-lg">
                  {file ? 'Reading your video…' : 'Drop your video here'}
                </p>
                <p className="max-w-xs text-sm text-slate-400">
                  {previewError || 'or tap to select a clip from your device · MP4, MOV, WebM up to 100MB'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {busy && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-xs font-medium uppercase tracking-widest text-slate-400">
                  <span>{uploading ? 'Uploading' : 'Generating'}</span>
                  <span>{uploading ? `${progress}%` : 'AI at work'}</span>
                </div>
                <div className="relative h-2.5 w-full overflow-hidden rounded-full border border-white/10 bg-white/5">
                  <motion.div
                    className="h-full rounded-full bg-hype-gradient shadow-glow-strong"
                    initial={{ width: 0 }}
                    animate={{ width: uploading ? `${progress}%` : '100%' }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                  <div className="pointer-events-none absolute inset-0">
                    <div className="animate-shimmer h-full w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" className="btn-primary" disabled={!file || busy} onClick={onGenerate}>
            {busy ? 'Processing…' : 'Generate hype'}
          </button>
          {file && !busy && (
            <button type="button" className="btn-ghost" onClick={onReset}>
              Choose another
            </button>
          )}
        </div>
      </div>
    </TiltCard>
  )
}
