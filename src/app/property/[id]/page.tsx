import { redirect } from 'next/navigation'

export default async function PropertyIdRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string>>
}) {
  const { id } = await params
  const sp = await searchParams
  const query = new URLSearchParams(sp).toString()
  redirect(`/properties/${id}${query ? `?${query}` : ''}`)
}
