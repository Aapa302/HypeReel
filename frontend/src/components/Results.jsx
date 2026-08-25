import { motion } from 'framer-motion'

import Reveal from './Reveal'
import TiltCard from './TiltCard'
import useCopy from '../hooks/useCopy'

function CaptionCard({ label, accent, caption, copied, onCopy }) {
  return (
    <TiltCard className="h-full" intensity={0.8}>
      <div className="glass glass-glow flex h-full flex-col gap-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <span className={`text-xs font-semibold uppercase tracking-[0.2em] ${accent}`}>{label}</span>
          <button type="button" className="btn-ghost !px-4 !py-1.5 !text-xs" onClick={onCopy}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p className="text-[0.975rem] leading-relaxed text-slate-200">{caption}</p>
      </div>
    </TiltCard>
  )
}

export default function Results({ result, onReset }) {
  const { copied, copy } = useCopy()
  const hashtags = result.hashtags ?? []
  const allHashtags = hashtags.join(' ')

  return (
    <section id="results" className="mx-auto w-full max-w-5xl px-5 pb-24 pt-4 sm:px-8">
      <Reveal className="mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-violet-300/80">Your reel kit</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
          <span className="gradient-text">Ready to post</span>
        </h2>
      </Reveal>

      {result.thumbnailUrl ? (
        <Reveal className="mb-8" delay={0.05}>
          <TiltCard intensity={0.5}>
            <div className="glass glass-glow overflow-hidden p-6 sm:p-8">
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-stretch">
                <div className="relative shrink-0 rounded-3xl p-[2px] shadow-glow-strong">
                  <div className="absolute inset-0 animate-pulse-glow rounded-3xl bg-hype-gradient blur-[3px]" />
                  <img
                    src={result.thumbnailUrl}
                    alt="AI-generated thumbnail"
                    className="relative max-h-80 w-auto rounded-3xl object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-center gap-4 text-center sm:text-left">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300/90">AI thumbnail</p>
                    <h3 className="mt-2 text-2xl font-bold text-white">Scroll-stopping cover art</h3>
                    <p className="mt-2 text-sm text-slate-400">
                      Generated from your clip and tuned for a high click-through rate.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
                    <a className="btn-primary" href={result.thumbnailUrl} download="hypereel-thumbnail.png" target="_blank" rel="noreferrer">
                      Download
                    </a>
                    <button type="button" className="btn-ghost" onClick={() => copy(result.thumbnailUrl, 'thumb')}>
                      {copied === 'thumb' ? 'Link copied' : 'Copy link'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TiltCard>
        </Reveal>
      ) : (
        <Reveal className="mb-8">
          <p className="glass px-5 py-4 text-center text-sm text-amber-200/90">
            The AI thumbnail could not be generated for this clip — your captions and hashtags are still below.
          </p>
        </Reveal>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Reveal delay={0.05} className="h-full">
          <CaptionCard
            label="Descriptive"
            accent="text-sky-300/90"
            caption={result.descriptiveCaption}
            copied={copied === 'descriptive'}
            onCopy={() => copy(result.descriptiveCaption, 'descriptive')}
          />
        </Reveal>
        <Reveal delay={0.12} className="h-full">
          <CaptionCard
            label="Viral"
            accent="text-fuchsia-300/90"
            caption={result.viralCaption}
            copied={copied === 'viral'}
            onCopy={() => copy(result.viralCaption, 'viral')}
          />
        </Reveal>
      </div>

      {hashtags.length > 0 && (
        <Reveal className="mt-8" delay={0.05}>
          <div className="glass p-6 sm:p-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/90">Trending hashtags</p>
                <p className="mt-1 text-sm text-slate-400">Tap any tag to copy it.</p>
              </div>
              <button type="button" className="btn-primary !px-5 !py-2.5" onClick={() => copy(allHashtags, 'all')}>
                {copied === 'all' ? 'Copied all' : 'Copy all'}
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {hashtags.map((tag, index) => (
                <motion.button
                  key={tag}
                  type="button"
                  className="pill"
                  onClick={() => copy(tag, tag)}
                  initial={{ opacity: 0, y: 12, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.4, delay: index * 0.04 }}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {copied === tag ? 'Copied!' : tag}
                </motion.button>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      <Reveal className="mt-10 text-center">
        <button type="button" className="btn-ghost" onClick={onReset}>
          Generate for another video
        </button>
      </Reveal>
    </section>
  )
}
