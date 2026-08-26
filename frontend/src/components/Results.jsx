import { motion } from 'framer-motion'
import { useState } from 'react'

import CopyButton from './CopyButton'
import HashtagChip from './HashtagChip'
import Reveal from './Reveal'
import TiltCard from './TiltCard'
import useIsMobile from '../hooks/useIsMobile'
import { flattenHashtags, groupHashtags } from '../lib/hashtags'

const SWIPE_THRESHOLD = 60

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function CaptionCard({ label, accent, caption, onRegenerate, regenerating }) {
  return (
    <TiltCard className="h-full" intensity={0.8}>
      <div className="glass glass-glow flex h-full flex-col gap-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <span className={`text-xs font-semibold uppercase tracking-[0.2em] ${accent}`}>{label}</span>
          <div className="flex items-center gap-2">
            {/* The backend regenerates captions and hashtags in one call, so
                this button refreshes the whole result set. */}
            {onRegenerate && (
              <button
                type="button"
                className="btn-ghost !px-4 !py-1.5 !text-xs"
                onClick={onRegenerate}
                disabled={regenerating}
              >
                {regenerating ? (
                  <>
                    <Spinner />
                    Regenerating…
                  </>
                ) : (
                  'Regenerate All'
                )}
              </button>
            )}
            <CopyButton value={caption} className="btn-ghost !px-4 !py-1.5 !text-xs" />
          </div>
        </div>
        <p className="text-[0.975rem] leading-relaxed text-slate-200">{caption}</p>
      </div>
    </TiltCard>
  )
}

function CaptionCarousel({ cards }) {
  const [active, setActive] = useState(0)

  return (
    <div>
      <div className="overflow-hidden">
        <motion.div
          className="flex"
          drag="x"
          dragElastic={0.12}
          dragMomentum={false}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, info) => {
            if (info.offset.x < -SWIPE_THRESHOLD) setActive((index) => Math.min(index + 1, cards.length - 1))
            else if (info.offset.x > SWIPE_THRESHOLD) setActive((index) => Math.max(index - 1, 0))
          }}
          animate={{ x: `-${active * 100}%` }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          style={{ touchAction: 'pan-y' }}
        >
          {cards.map((card) => (
            <div key={card.key} className="w-full shrink-0 px-0.5">
              {card.node}
            </div>
          ))}
        </motion.div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {cards.map((card, index) => (
          <button
            key={card.key}
            type="button"
            aria-label={`Show ${card.key} caption`}
            aria-current={index === active}
            onClick={() => setActive(index)}
            className="p-1.5"
          >
            <motion.span
              className="block h-2 rounded-full"
              animate={{
                width: index === active ? 22 : 8,
                backgroundColor: index === active ? '#e879f9' : 'rgba(148,163,184,0.45)',
              }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </button>
        ))}
      </div>
      <p className="mt-1 text-center text-[11px] uppercase tracking-[0.2em] text-slate-500">Swipe for more</p>
    </div>
  )
}

export default function Results({ result, onReset, onRegenerate, regenerating = false }) {
  const isMobile = useIsMobile()
  const hashtagGroups = groupHashtags(result.hashtags)
  const allHashtags = flattenHashtags(hashtagGroups).join(' ')

  const captionCards = [
    {
      key: 'descriptive',
      node: (
        <CaptionCard
          label="Descriptive"
          accent="text-sky-300/90"
          caption={result.descriptiveCaption}
          onRegenerate={onRegenerate}
          regenerating={regenerating}
        />
      ),
    },
    {
      key: 'viral',
      node: (
        <CaptionCard
          label="Viral"
          accent="text-fuchsia-300/90"
          caption={result.viralCaption}
          onRegenerate={onRegenerate}
          regenerating={regenerating}
        />
      ),
    },
  ]

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
                    <CopyButton value={result.thumbnailUrl} label="Copy link" copiedLabel="Link copied!" />
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

      {isMobile ? (
        <Reveal delay={0.05}>
          <CaptionCarousel cards={captionCards} />
        </Reveal>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {captionCards.map((card, index) => (
            <Reveal key={card.key} delay={0.05 + index * 0.07} className="h-full">
              {card.node}
            </Reveal>
          ))}
        </div>
      )}

      {hashtagGroups.length > 0 && (
        <Reveal className="mt-8" delay={0.05}>
          <div className="glass p-6 sm:p-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/90">Trending hashtags</p>
                <p className="mt-1 text-sm text-slate-400">Tap any tag to copy it.</p>
              </div>
              <CopyButton
                value={allHashtags}
                label="Copy all"
                copiedLabel="Copied all!"
                className="btn-primary !px-5 !py-2.5"
              />
            </div>

            <div className="flex flex-col gap-6">
              {hashtagGroups.map((group, groupIndex) => (
                <div key={group.label ?? 'all'}>
                  {group.label && (
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      {group.label}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    {group.tags.map((tag, index) => (
                      <HashtagChip key={`${group.label ?? 'all'}-${tag}`} tag={tag} delay={(groupIndex * 4 + index) * 0.04} />
                    ))}
                  </div>
                </div>
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
