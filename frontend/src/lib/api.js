import axios from 'axios'

const baseURL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')

export const api = axios.create({ baseURL })

export function extractErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data?.error
    if (typeof apiError === 'string') return apiError
    if (error.code === 'ERR_NETWORK') {
      return baseURL
        ? `Could not reach the HypeReel API at ${baseURL}. Is the backend running?`
        : 'VITE_API_URL is not set, so the frontend does not know where the HypeReel API lives.'
    }
  }
  return error?.message || 'Something went wrong while generating your assets.'
}

/**
 * Returns `null` when /api/stats is unavailable (older backend deploys, or
 * Firestore not configured) so callers can hide the counter instead of erroring.
 */
export async function fetchStats() {
  try {
    const response = await api.get('/api/stats')
    return response.data
  } catch {
    return null
  }
}

export async function generateFromVideo(file, { onProgress, signal } = {}) {
  const form = new FormData()
  form.append('video', file)

  const response = await api.post('/api/generate', form, {
    signal,
    onUploadProgress: (event) => {
      if (!onProgress) return
      const percent = event.total ? Math.round((event.loaded / event.total) * 100) : null
      onProgress(percent)
    },
  })

  return response.data
}
