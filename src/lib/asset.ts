/** Caminho de ficheiro em /public respeitando o base do build. */
export const asset = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`
export const img = (name: string, w?: 960 | 1672) => asset(`img/${name}${w ? `-${w}` : ''}.webp`)
