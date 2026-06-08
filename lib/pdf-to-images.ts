/**
 * Render multiple pages of a PDF file to JPEG blobs.
 * Uses pdfjs-dist via dynamic import to avoid SSR issues (DOMMatrix not in Node.js).
 *
 * Used by portfolio analysis flow when the original PDF is too large for EdgeOne's
 * ~20MB request body limit. Rendered JPEGs are much smaller than the original PDF.
 */
export interface PdfPageImage {
  blob: Blob
  pageNumber: number
  width: number
  height: number
}

export interface PdfRenderResult {
  images: PdfPageImage[]
  totalPages: number
  selectedPages: number[]
  strategyNote: string
}

export interface PdfToImagesOptions {
  /** Max pages to render (default 12). Fewer pages = faster processing + smaller upload. */
  maxPages?: number
  /** Specific page numbers to render. When omitted, uses smart sampling across the full PDF. */
  pageNumbers?: number[]
  /** Max width in pixels (default 1200). Height scales proportionally. */
  maxWidth?: number
  /** JPEG quality 0-1 (default 0.72). */
  quality?: number
  /** Called after each page is rendered. */
  onProgress?: (current: number, total: number) => void
  /** AbortSignal for cancellation. */
  signal?: AbortSignal
}

export async function pdfPagesToImages(
  file: File,
  options: PdfToImagesOptions = {}
): Promise<PdfRenderResult> {
  const {
    maxPages = 12,
    pageNumbers,
    maxWidth = 1200,
    quality = 0.72,
    onProgress,
    signal,
  } = options

  // Dynamic import to avoid SSR — pdfjs-dist uses DOMMatrix which only exists in browsers
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  if (pdf.numPages === 0) {
    throw new Error('PDF 文件没有可读取的页面')
  }

  const selectedPages = pageNumbers?.length
    ? normalizePageNumbers(pageNumbers, pdf.numPages, maxPages)
    : buildSmartSamplePages(pdf.numPages, maxPages)
  const results: PdfPageImage[] = []

  for (let index = 0; index < selectedPages.length; index++) {
    if (signal?.aborted) throw new Error('处理已取消')

    const pageNumber = selectedPages[index]
    const page = await pdf.getPage(pageNumber)
    const baseViewport = page.getViewport({ scale: 1 })
    const scale = Math.min(maxWidth / baseViewport.width, 2) // never exceed 2× scale
    const viewport = page.getViewport({ scale })

    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 上下文不可用')

    await page.render({ canvas, viewport }).promise

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', quality)
    })

    if (!blob || blob.size === 0) {
      throw new Error(`第 ${pageNumber} 页渲染失败`)
    }

    results.push({
      blob,
      pageNumber,
      width: viewport.width,
      height: viewport.height,
    })

    onProgress?.(index + 1, selectedPages.length)
  }

  return {
    images: results,
    totalPages: pdf.numPages,
    selectedPages,
    strategyNote:
      selectedPages.length >= pdf.numPages
        ? '已分析完整 PDF。'
        : `已从 ${pdf.numPages} 页中智能抽样 ${selectedPages.length} 页，覆盖开头、中段、结尾和代表性项目页。`,
  }
}

function normalizePageNumbers(pageNumbers: number[], totalPages: number, maxPages: number): number[] {
  return [...new Set(pageNumbers)]
    .filter((page) => Number.isInteger(page) && page >= 1 && page <= totalPages)
    .slice(0, maxPages)
    .sort((a, b) => a - b)
}

export function buildSmartSamplePages(totalPages: number, maxPages: number): number[] {
  if (totalPages <= 0 || maxPages <= 0) return []
  if (totalPages <= maxPages) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const anchors = new Set<number>([1, totalPages])
  if (totalPages >= 2) anchors.add(2)
  if (totalPages >= 3) anchors.add(3)
  if (totalPages >= 4) anchors.add(totalPages - 1)

  for (let i = 0; anchors.size < maxPages && i < maxPages; i++) {
    const page = Math.round(1 + (i * (totalPages - 1)) / (maxPages - 1))
    anchors.add(page)
  }

  for (let page = 1; anchors.size < maxPages && page <= totalPages; page++) {
    anchors.add(page)
  }

  return [...anchors].sort((a, b) => a - b).slice(0, maxPages)
}

/**
 * Estimate whether a PDF is too large for direct upload.
 * Returns the recommended action.
 */
export function assessPdfSize(file: File): {
  action: 'direct' | 'compress' | 'reject'
  maxPages: number
  reason: string
} {
  const mb = file.size / (1024 * 1024)

  if (mb <= 12) {
    return {
      action: 'direct',
      maxPages: 0,
      reason: '文件大小在安全范围内，将直接上传原始 PDF。',
    }
  }

  if (mb <= 30) {
    const maxPages = Math.min(12, Math.max(8, Math.floor(14 * (12 / mb))))
    return {
      action: 'compress',
      maxPages,
      reason: `文件较大（${mb.toFixed(1)}MB），将自动智能抽样 ${maxPages} 页为图片后分析。`,
    }
  }

  return {
    action: 'reject',
    maxPages: 0,
    reason: `文件过大（${mb.toFixed(1)}MB），超过自动处理上限 30MB。请减少页数或导出较低分辨率版本后重试。`,
  }
}
