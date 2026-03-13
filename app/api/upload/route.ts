import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/session'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { rateLimit, LIMITS, rateLimitExceeded } from '@/lib/rateLimit'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function getExt(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
  }
  return map[mime] || '.jpg'
}

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(request, LIMITS.upload, 'upload:files')
    if (rl.limited) return rateLimitExceeded(rl.resetAt)

    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const type = formData.get('type') as string | null
    if (type !== 'listing' && type !== 'profile' && type !== 'message') {
      return NextResponse.json({ error: 'Invalid type. Use "listing", "profile", or "message".' }, { status: 400 })
    }

    const files = formData.getAll('file') as File[]
    const singleFile = formData.get('file') as File | null
    const toProcess: File[] = singleFile && singleFile.size > 0 ? [singleFile] : files.filter((f) => f && f.size > 0)

    if (toProcess.length === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if ((type === 'profile' || type === 'message') && toProcess.length > 1) {
      return NextResponse.json({ error: type === 'profile' ? 'Profile allows only one image' : 'Message allows only one image' }, { status: 400 })
    }

    const baseDir = path.join(process.cwd(), 'public', 'uploads', type)
    await mkdir(baseDir, { recursive: true })

    const urls: string[] = []

    for (const file of toProcess) {
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, WebP, or GIF.' }, { status: 400 })
      }

      const ext = getExt(file.type)
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`
      const filePath = path.join(baseDir, name)
      const bytes = await file.arrayBuffer()
      await writeFile(filePath, Buffer.from(bytes))

      urls.push(`/uploads/${type}/${name}`)
    }

    if (urls.length === 1) {
      return NextResponse.json({ url: urls[0] })
    }
    return NextResponse.json({ urls })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
