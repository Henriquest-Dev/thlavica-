import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { site } from '../config/site'

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

/** Título, descrição, Open Graph e URL canónico por página. */
export function usePageMeta(title: string, description: string = site.descricao, image?: string) {
  const { pathname } = useLocation()
  useEffect(() => {
    const full = title ? `${title} · ${site.nome}` : `${site.nome} — Energia solar e água em Moçambique`
    document.title = full
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', full)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:type', 'website')
    if (site.url) {
      setMeta('property', 'og:url', site.url + pathname)
      if (image) setMeta('property', 'og:image', site.url + image)
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
      if (!link) {
        link = document.createElement('link')
        link.rel = 'canonical'
        document.head.appendChild(link)
      }
      link.href = site.url + pathname
    }
  }, [title, description, image, pathname])
}
