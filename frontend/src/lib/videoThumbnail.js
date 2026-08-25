const SEEK_RATIO = 0.25
const MAX_WIDTH = 640

/**
 * Grabs a frame from a local video file with a hidden <video> element and a
 * <canvas>, returning it as a data URL for previewing before upload.
 */
export function extractVideoThumbnail(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true
    video.crossOrigin = 'anonymous'
    video.src = url

    let settled = false

    const cleanup = () => {
      video.removeAttribute('src')
      video.load()
      URL.revokeObjectURL(url)
    }

    const fail = (message) => {
      if (settled) return
      settled = true
      cleanup()
      reject(new Error(message))
    }

    const capture = () => {
      if (settled) return
      const width = video.videoWidth
      const height = video.videoHeight
      if (!width || !height) {
        fail('Could not read the video dimensions.')
        return
      }

      const scale = Math.min(1, MAX_WIDTH / width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(width * scale)
      canvas.height = Math.round(height * scale)

      const context = canvas.getContext('2d')
      if (!context) {
        fail('Canvas is not available in this browser.')
        return
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      settled = true
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
      cleanup()
      resolve({ dataUrl, width: canvas.width, height: canvas.height, duration: video.duration })
    }

    video.addEventListener('loadeddata', () => {
      const target = Number.isFinite(video.duration) && video.duration > 0 ? video.duration * SEEK_RATIO : 0
      if (target > 0) {
        video.currentTime = Math.min(target, Math.max(0, video.duration - 0.1))
      } else {
        capture()
      }
    })
    video.addEventListener('seeked', capture)
    video.addEventListener('error', () => fail('This video file could not be read by the browser.'))

    setTimeout(() => fail('Timed out while reading the video file.'), 10000)
  })
}
