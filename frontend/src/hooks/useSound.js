import { useContext } from 'react'

import { SoundContext } from '../context/soundContext'

export default function useSound() {
  return useContext(SoundContext)
}
