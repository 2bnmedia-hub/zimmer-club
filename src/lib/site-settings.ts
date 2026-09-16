export type SiteSettings = {
  zimiEnabled: boolean
}

const DEFAULTS: SiteSettings = { zimiEnabled: false }

export async function getSiteSettings(): Promise<SiteSettings> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return DEFAULTS

  try {
    const res = await fetch(`${url}/rest/v1/site_settings?id=eq.1&select=zimi_enabled`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      next: { revalidate: 60 },
    })
    if (!res.ok) return DEFAULTS
    const rows = await res.json()
    const row = rows?.[0]
    if (!row) return DEFAULTS
    return { zimiEnabled: !!row.zimi_enabled }
  } catch {
    return DEFAULTS
  }
}
