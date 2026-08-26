import useSound from '../hooks/useSound'

export default function SoundToggle() {
  const { muted, toggleMuted } = useSound()

  return (
    <button
      type="button"
      onClick={toggleMuted}
      aria-pressed={!muted}
      aria-label={muted ? 'Unmute HypeReel sounds' : 'Mute HypeReel sounds'}
      className="pill grid h-9 w-9 place-items-center !px-0 !py-0 text-slate-300"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 9.5h3L11 6v12l-4-3.5H4z" strokeLinecap="round" strokeLinejoin="round" />
        {muted ? (
          <path d="M15.5 9.5l5 5m0-5l-5 5" strokeLinecap="round" />
        ) : (
          <path d="M15.5 9a4 4 0 010 6m2.5-8.5a7 7 0 010 11" strokeLinecap="round" />
        )}
      </svg>
    </button>
  )
}
