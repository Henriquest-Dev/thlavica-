import { useEffect } from 'react'

export function useMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} · Tlhavika` : 'Tlhavika — Energia solar e água em Moçambique'
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  }, [title, description])
}
