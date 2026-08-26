import { createContext } from 'react'

export const SoundContext = createContext({
  muted: true,
  toggleMuted: () => {},
  playClick: () => {},
  playSuccess: () => {},
})
