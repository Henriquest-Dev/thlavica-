import { useMemo } from 'react'
import { categories as BASE, solutions, type Category, type CategoryId, type Contact, type Picto, type SolutionId } from '../data/site'
import { readStored, updateStored, useStored } from './store'

/**
 * Categorias do site: as de origem, com o nome, o texto, a área e o ícone que o painel tiver mudado,
 * mais as que o painel criou. Ficam em `settings.categorias` (sincronizado com o Supabase).
 */

export const PICTOS: { id: Picto; label: string }[] = [
  { id: 'painel', label: 'Painel solar' },
  { id: 'inversor', label: 'Inversor' },
  { id: 'bateria', label: 'Bateria' },
  { id: 'bomba', label: 'Bomba' },
  { id: 'submersivel', label: 'Submersível' },
  { id: 'bombasolar', label: 'Bomba solar' },
  { id: 'termo', label: 'Termoacumulador' },
  { id: 'candeeiro', label: 'Outros' },
]

export const MAX_CATEGORIES = 40
export const MAX_NAME = 40
export const MAX_TEXT = 120

const SOL_IDS = new Set<string>(solutions.map((s) => s.id))
const PIC_IDS = new Set<string>(PICTOS.map((p) => p.id))
const BASE_IDS = new Set<string>(BASE.map((c) => c.id))
const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

/** Edição guardada: uma categoria de origem alterada, ou uma categoria nova. */
export type CategoryEdit = Pick<Category, 'id' | 'name' | 'text' | 'solution' | 'pic'>

/** Texto → identificador para o endereço (/categoria/<id>). */
export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/, '')
}

/** Um id novo, que não repete nenhum existente. */
export function newCategoryId(name: string, taken: string[]): string {
  const root = slugify(name) || 'categoria'
  let id = root
  for (let n = 2; taken.includes(id); n++) id = `${root}-${n}`
  return id
}

/** Os dados vêm do servidor: só se aceita o que está bem formado. */
export function cleanCategoryEdits(v: unknown): CategoryEdit[] {
  if (!Array.isArray(v)) return []
  const s = (x: unknown, max: number) => (typeof x === 'string' ? x.trim().slice(0, max) : '')
  const seen = new Set<string>()
  const out: CategoryEdit[] = []
  for (const raw of v as Record<string, unknown>[]) {
    const id = s(raw?.id, 40)
    const name = s(raw?.name, MAX_NAME)
    if (!ID_RE.test(id) || !name || seen.has(id)) continue
    seen.add(id)
    out.push({
      id,
      name,
      text: s(raw?.text, MAX_TEXT),
      solution: (SOL_IDS.has(raw?.solution as string) ? raw.solution : 'energia-solar') as SolutionId,
      pic: (PIC_IDS.has(raw?.pic as string) ? raw.pic : 'candeeiro') as Picto,
    })
  }
  return out.slice(0, MAX_CATEGORIES)
}

/** Junta as categorias de origem com as edições do painel (as novas ficam no fim). */
export function mergeCategories(edits: unknown): Category[] {
  const list = cleanCategoryEdits(edits)
  const byId = new Map(list.map((e) => [e.id, e]))
  const base = BASE.map((c) => {
    const e = byId.get(c.id)
    return e ? { ...c, ...e } : c
  })
  const extra: Category[] = list.filter((e) => !BASE_IDS.has(e.id)).map((e) => ({ ...e, custom: true }))
  return [...base, ...extra]
}

const NO_SETTINGS: Partial<Contact> = {}

export function useCategories(): Category[] {
  const [s] = useStored<Partial<Contact>>('settings', NO_SETTINGS)
  return useMemo(() => mergeCategories(s.categorias), [s.categorias])
}

export function getCategories(): Category[] {
  return mergeCategories(readStored<Partial<Contact>>('settings', NO_SETTINGS).categorias)
}

/** Categorias de uma solução: as de origem dessa solução e as que o painel lhe associou. */
export function categoriesOfSolution(list: Category[], solution: SolutionId, baseIds: CategoryId[]): Category[] {
  return list.filter((c) => (c.custom ? c.solution === solution : baseIds.includes(c.id)))
}

/** Grava (cria ou altera) uma categoria. */
export function saveCategory(c: CategoryEdit): boolean {
  return updateStored<Partial<Contact>>('settings', NO_SETTINGS, (s) => {
    const list = cleanCategoryEdits(s.categorias)
    const next = list.some((x) => x.id === c.id) ? list.map((x) => (x.id === c.id ? c : x)) : [...list, c]
    return { ...s, categorias: cleanCategoryEdits(next) }
  })
}

/** Apaga uma categoria criada no painel, ou repõe uma de origem como estava. */
export function removeCategory(id: string): boolean {
  return updateStored<Partial<Contact>>('settings', NO_SETTINGS, (s) => ({ ...s, categorias: cleanCategoryEdits(s.categorias).filter((x) => x.id !== id) }))
}

export const isBaseCategory = (id: string) => BASE_IDS.has(id)
