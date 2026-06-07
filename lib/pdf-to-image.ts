/**
 * Render the first page of a PDF file to a JPEG blob.
 * Uses pdfjs-dist via dynamic import to avoid SSR issues (DOMMatrix not in Node.js).
 * Returns null if conversion fails (caller should show a helpful message).
 */
export async function pdfFirstPageToImage(file: File): Promise<Blob | null> {
  try {
    // Dynamic import to avoid SSR — pdfjs-dist uses DOMMatrix which only exists in browsers
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    if (pdf.numPages === 0) return null

    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 1.5 }) // 1.5× for decent resolution

    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    await page.render({ canvas, viewport }).promise

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        'image/jpeg',
        0.85
      )
    })
  } catch (err) {
    console.error('PDF first page render failed:', err)
    return null
  }
}
