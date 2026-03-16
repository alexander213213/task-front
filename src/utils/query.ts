export function withQuery(path: string, query: Record<string, string | undefined>) {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) {
    if (v && v.trim()) qs.set(k, v.trim())
  }
  const s = qs.toString()
  return s ? `${path}?${s}` : path
}