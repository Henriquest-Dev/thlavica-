import { ArrowUpRight } from 'lucide-react'
export function Arrow({ size = 14 }: { size?: number }) {
  return <ArrowUpRight size={size} strokeWidth={2} aria-hidden="true" />
}
