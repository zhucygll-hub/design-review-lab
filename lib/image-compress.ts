/**
 * Compress an image file client-side before upload.
 * Uses Canvas API — no native deps, works in all browsers.
 * Returns a Blob suitable for FormData.
 */
export function compressImageClient(
  file: File,
  maxWidth = 1200,
  quality = 0.75
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Skip non-image files
    if (!file.type.startsWith('image/')) {
      resolve(file)
      return
    }

    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img
      if (width <= maxWidth) {
        // Already small enough, just convert
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else resolve(file) // fallback to original
          },
          'image/jpeg',
          quality
        )
        return
      }

      // Scale down
      height = Math.round((height * maxWidth) / width)
      width = maxWidth

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else resolve(file) // fallback to original
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(file) // can't compress, use original
    }

    img.src = url
  })
}
