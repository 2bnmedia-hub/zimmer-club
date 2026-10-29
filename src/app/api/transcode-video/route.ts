import { NextResponse } from 'next/server'
import { Sandbox } from '@vercel/sandbox'
import { createClient } from '@supabase/supabase-js'
import { createClient as createUserClient } from '@/lib/supabase/server'

export const maxDuration = 300

const ALLOWED_TABLES = ['property_videos', 'caravan_videos', 'attraction_videos'] as const
type AllowedTable = (typeof ALLOWED_TABLES)[number]

// Bucket, parent table and FK are fixed per video table — never taken from the request,
// so a caller can't point the service-role upload/update at another bucket or row.
const TABLE_META: Record<AllowedTable, { bucket: string; parent: string; fk: string }> = {
  property_videos:   { bucket: 'property-images',   parent: 'properties',  fk: 'property_id' },
  caravan_videos:    { bucket: 'caravan-images',    parent: 'caravans',    fk: 'caravan_id' },
  attraction_videos: { bucket: 'attraction-images', parent: 'attractions', fk: 'attraction_id' },
}

const FFMPEG_URL = 'https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz'

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 })
  }

  const { table, id } = (body || {}) as Record<string, unknown>
  if (typeof table !== 'string' || !ALLOWED_TABLES.includes(table as AllowedTable) || typeof id !== 'string') {
    return NextResponse.json({ ok: false, error: 'missing or invalid fields' }, { status: 400 })
  }
  const { bucket, parent, fk } = TABLE_META[table as AllowedTable]

  const userClient = await createUserClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabase.from(table).select(`url, ${fk}`).eq('id', id).maybeSingle()
  const video = data as unknown as Record<string, unknown> | null
  const parentId = video?.[fk]
  if (!video || typeof parentId !== 'string') {
    return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 })
  }
  const [{ data: owner }, { data: profile }] = await Promise.all([
    supabase.from(parent).select('owner_id').eq('id', parentId).maybeSingle(),
    supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
  ])
  if (owner?.owner_id !== user.id && profile?.role !== 'admin') {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
  }

  // Only transcode files that already live in this project's public bucket.
  const url = String(video.url ?? '')
  const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/`
  if (!url.startsWith(prefix) || url.endsWith('_h264.mp4') || url.includes('..')) {
    return NextResponse.json({ ok: false, error: 'invalid source' }, { status: 400 })
  }

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

    const logoDownload = await sandbox.runCommand('curl', ['-sL', '-o', '/tmp/logo.png', 'https://www.zimmer.club/logo.png'])
    const hasLogo = logoDownload.exitCode === 0

    // Re-encode to H.264/AAC (broad browser support, unlike source HEVC), cap at 1080p, fast-start
    // for streaming, and burn in the zimmer.club logo (top-right) as a copyright watermark.
    const transcode = hasLogo
      ? await sandbox.runCommand('/tmp/ffmpeg', [
          '-i', '/tmp/input', '-i', '/tmp/logo.png',
          '-filter_complex', "[0:v]scale='min(1920,iw)':-2[base];[1:v]scale=180:-1[wm];[base][wm]overlay=W-w-24:24",
          '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23',
          '-c:a', 'aac', '-b:a', '128k',
          '-movflags', '+faststart',
          '-y', '/tmp/output.mp4',
        ])
      : await sandbox.runCommand('/tmp/ffmpeg', [
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

    // Output path comes from trusted ids only, so a crafted source URL can't make the
    // service-role upsert overwrite another listing's file.
    const newPath = `${parentId}/${id}_h264.mp4`
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
