import { redirect } from 'next/navigation'

export default async function SlugCatchAll({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string>>
}) {
  const { slug } = await params
  const sp = await searchParams
  const query = new URLSearchParams(sp).toString()
  const target = `/properties/${slug}${query ? `?${query}` : ''}`
  redirect(target)
}
