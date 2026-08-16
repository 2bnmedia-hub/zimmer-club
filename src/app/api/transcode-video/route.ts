import { NextResponse } from 'next/server'
import { Sandbox } from '@vercel/sandbox'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 300

const ALLOWED_TABLES = ['property_videos', 'caravan_videos', 'attraction_videos'] as const
type AllowedTable = (typeof ALLOWED_TABLES)[number]

const FFMPEG_URL = 'https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz'

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 })
  }

  const { table, id, url, bucket, storagePath } = (body || {}) as Record<string, unknown>
  if (
    typeof table !== 'string' || !ALLOWED_TABLES.includes(table as AllowedTable) ||
    typeof id !== 'string' || typeof url !== 'string' ||
    typeof bucket !== 'string' || typeof storagePath !== 'string'
  ) {
    return NextResponse.json({ ok: false, error: 'missing or invalid fields' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let sandbox: Sandbox | null = null
  try {
    sandbox = await Sandbox.create({ runtime: 'node22', timeout: 280_000, resources: { vcpus: 4 } })

    // Static ffmpeg build — avoids relying on dnf package availability/licensing on the sandbox image
    const setup = await sandbox.runCommand('sh', ['-c',
      `(sudo dnf install -y xz 2>&1 || true) && curl -sL -o /tmp/ffmpeg.tar.xz ${FFMPEG_URL} && tar -xJf /tmp/ffmpeg.tar.xz -C /tmp && mv /tmp/ffmpeg-*-amd64-static/ffmpeg /tmp/ffmpeg && chmod +x /tmp/ffmpeg`
    ])
    if (setup.exitCode !== 0) {
      throw new Error(`ffmpeg setup failed: ${await setup.stderr()}`)
    }

    const download = await sandbox.runCommand('curl', ['-sL', '-o', '/tmp/input', url])
    if (download.exitCode !== 0) {
      throw new Error(`source download failed: ${await download.stderr()}`)
    }

    // Re-encode to H.264/AAC (broad browser support, unlike source HEVC), cap at 1080p, fast-start for streaming
    const transcode = await sandbox.runCommand('/tmp/ffmpeg', [
      '-i', '/tmp/input',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23',
      '-vf', "scale='min(1920,iw)':-2",
      '-c:a', 'aac', '-b:a', '128k',
      '-movflags', '+faststart',
      '-y', '/tmp/output.mp4',
    ])
    if (transcode.exitCode !== 0) {
      throw new Error(`transcode failed: ${await transcode.stderr()}`)
    }

    const outputBuffer = await sandbox.fs.readFile('/tmp/output.mp4')

    const newPath = storagePath.replace(/\.[^./]+$/, '') + '_h264.mp4'
    const { error: upErr } = await supabase.storage.from(bucket).upload(newPath, outputBuffer, {
      contentType: 'video/mp4',
      upsert: true,
    })
    if (upErr) throw new Error(`storage upload failed: ${upErr.message}`)

    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(newPath)

    const { error: dbErr } = await supabase.from(table).update({ url: pub.publicUrl }).eq('id', id)
    if (dbErr) throw new Error(`db update failed: ${dbErr.message}`)

    return NextResponse.json({ ok: true, url: pub.publicUrl })
  } catch (err: any) {
    console.error('[transcode-video]', err?.message || err)
    return NextResponse.json({ ok: false, error: err?.message || 'transcode failed' }, { status: 500 })
  } finally {
    if (sandbox) await sandbox.stop().catch(() => {})
  }
}
