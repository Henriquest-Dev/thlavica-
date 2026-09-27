import { Sun, Droplets, Flame, type LucideProps } from 'lucide-react'

const MAP = { sun: Sun, droplets: Droplets, flame: Flame }
export function SolutionIcon({ name, ...p }: { name: keyof typeof MAP } & LucideProps) {
  const C = MAP[name]
  return <C strokeWidth={1.6} {...p} />
}
