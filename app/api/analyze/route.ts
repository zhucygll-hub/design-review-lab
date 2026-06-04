import { NextRequest, NextResponse } from 'next/server'

// Minimal test route — if this still 500s, EdgeOne has a fundamental
// incompatibility with Next.js App Router API routes in this project.

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const designType = (formData.get('designType') as string) || 'commercial'

    return NextResponse.json({
      ok: true,
      received: {
        hasFile: !!file,
        fileName: file?.name || '(none)',
        fileType: file?.type || '(none)',
        fileSize: file?.size ?? 0,
        designType,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
