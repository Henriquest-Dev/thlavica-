import type { CategoryId } from '../data/products'

const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

const ICONS: Record<CategoryId, React.ReactNode> = {
  paineis: (
    <>
      <path {...P} d="M4 18 L7 6 H21 L18 18 Z" />
      <path {...P} d="M5.5 12 H19.5 M11 6 L9.5 18 M16 6 L14 18" />
      <path {...P} d="M11 18 V21 M8 21 H14" />
    </>
  ),
  inversores: (
    <>
      <rect {...P} x="5" y="3" width="14" height="18" rx="2" />
      <rect {...P} x="8" y="6" width="8" height="5" rx="1" />
      <path {...P} d="M8 15 H16 M8 18 H13" />
    </>
  ),
  baterias: (
    <>
      <rect {...P} x="6" y="5" width="12" height="16" rx="2" />
      <path {...P} d="M10 3 H14 M12.5 9 L10 13.5 H14 L11.5 18" />
    </>
  ),
  'bombas-pressurizadoras': (
    <>
      <circle {...P} cx="9" cy="14" r="4" />
      <rect {...P} x="13" y="10" width="8" height="8" rx="1.5" />
      <path {...P} d="M9 10 V5 H6 M5 14 H2" />
    </>
  ),
  'bombas-submersiveis': (
    <>
      <rect {...P} x="9" y="7" width="6" height="14" rx="2" />
      <path {...P} d="M12 7 V2 M9 12 H15 M9 16 H15" />
    </>
  ),
  'bombagem-solar': (
    <>
      <circle {...P} cx="6" cy="6" r="2.5" />
      <path {...P} d="M12 4 L16 4 L14 10 L10 10 Z" />
      <path {...P} d="M13 10 V13 M8 21 C8 18 10 16 12 13 C14 16 16 18 16 21" />
    </>
  ),
  termoacumuladores: (
    <>
      <rect {...P} x="3" y="4" width="18" height="5" rx="2.5" />
      <path {...P} d="M6 9 L4 20 M10 9 L9 20 M14 9 L15 20 M18 9 L20 20" />
    </>
  ),
  acessorios: (
    <>
      <path {...P} d="M12 21 V9 M8 5 H16 L15 9 H9 Z" />
      <path {...P} d="M5 3 L7 5 M19 3 L17 5" />
    </>
  ),
}

export function CategoryIcon({ id }: { id: CategoryId }) {
  return (
    <svg className="cat-icon" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
      {ICONS[id]}
    </svg>
  )
}
