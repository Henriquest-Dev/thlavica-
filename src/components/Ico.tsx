import type { ReactElement, SVGProps } from 'react'

/**
 * Ícones próprios da Tlhavika (desenhados à mão, sem biblioteca).
 * - Pictogramas (grelha 32): formas cheias, cor principal em currentColor e um toque âmbar.
 * - Glifos de interface (grelha 24): traço de 2 px, cantos vivos.
 */

const P = 'currentColor'

const PICTO: Record<string, ReactElement> = {
  painel: (
    <>
      <path fill={P} d="M9 5h5.7l-2.8 6.5H6.2zM16.2 5h5.6L19 11.5h-5.6zM23.3 5H29l-2.8 6.5h-5.7zM5.7 12.8h5.6L8.7 19H3zM12.8 12.8h5.7L15.8 19h-5.6zM20 12.8h5.7L23 19h-5.7z" />
      <path className="a" d="M15 20.5h2v5h-2zM10 25.5h12v2H10z" />
    </>
  ),
  inversor: (
    <>
      <path fill={P} fillRule="evenodd" d="M8 4h16a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm2 4v7h12V8zm0 11v1.6h12V19zm0 3v1.6h12V22z" />
      <path className="a" d="M11 9h10v5H11z" />
    </>
  ),
  bateria: (
    <>
      <path fill={P} d="M12 3h8v2.5h2.5a1.5 1.5 0 0 1 1.5 1.5v19.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 8 26.5V7a1.5 1.5 0 0 1 1.5-1.5H12z" />
      <path className="a" d="M17.4 9 11 18.2h4.4L14 25l7-10.2h-4.5z" />
    </>
  ),
  bomba: (
    <>
      <path fill={P} d="M8 5h4v7.2a6.4 6.4 0 1 1-5.6 9.6V19H2v-3.6h4.4A6.4 6.4 0 0 1 8 12.5zM16 11.5h11a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H16.5a6.4 6.4 0 0 0 0-13zM4 26h24v2.5H4z" />
      <circle className="a" cx="10.2" cy="18.8" r="2.4" />
    </>
  ),
  submersivel: (
    <>
      <path fill={P} fillRule="evenodd" d="M14 2h4v3.2a3 3 0 0 1 3 3V22a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3V8.2a3 3 0 0 1 3-3zM11 10.5v1.4h10v-1.4zm0 3.6v1.4h10v-1.4zm0 3.6v1.4h10v-1.4z" />
      <path className="as" d="M4 28.6c2.5-2.6 4.5 2.6 7 0s4.5 2.6 7 0 4.5 2.6 7 0 2.5 .8 3 .4" />
    </>
  ),
  bombasolar: (
    <>
      <path fill={P} fillRule="evenodd" d="M9 6h3v2.8a2.6 2.6 0 0 1 2.4 2.6v13.2a2.6 2.6 0 0 1-2.6 2.6H9.2a2.6 2.6 0 0 1-2.6-2.6V11.4A2.6 2.6 0 0 1 9 8.8zM6.6 14v1.3h7.8V14zm0 3.3v1.3h7.8v-1.3zm0 3.3v1.3h7.8v-1.3z" />
      <circle className="a" cx="24" cy="9" r="3.6" />
      <path className="as" d="M24 2.5v1.8M24 13.7v1.8M17.5 9h1.8M28.7 9h1.8M19.4 4.4l1.3 1.3M27.3 12.3l1.3 1.3M28.6 4.4l-1.3 1.3M20.7 12.3l-1.3 1.3" />
      <path className="as" d="M17 28.6c2-2.6 3.6 2.6 5.5 0s3.5 2.6 5.5 0 2 .8 3 .4" />
    </>
  ),
  termo: (
    <>
      <path fill={P} fillRule="evenodd" d="M8 4h16a4.5 4.5 0 0 1 0 9H8a4.5 4.5 0 0 1 0-9zM8.6 15.5h17.2L22 27H2.6zM9.6 17.5l-1.4 7.2h1.7l1.5-7.2zm4 0-1.5 7.2h1.8l1.5-7.2zm4 0-1.5 7.2h1.8l1.5-7.2z" />
      <ellipse className="a" cx="24" cy="8.5" rx="2.4" ry="3.4" />
    </>
  ),
  candeeiro: (
    <>
      <path fill={P} d="M14.5 10h3v16.5h-3zM10 26h12v2.5H10z" />
      <path className="a" d="M3 5h16l2.4 4.6H4.6z" />
      <path className="as" d="M7 13v3M12 13v4M17 13v3" />
    </>
  ),
  sol: (
    <>
      <circle className="a" cx="16" cy="16" r="5.8" />
      <path fill="none" stroke={P} strokeWidth="3" d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M25.2 6.8l-2.8 2.8M9.6 22.4l-2.8 2.8" />
    </>
  ),
  gota: (
    <>
      <path fill={P} d="M16 3c4 5.5 9 10.2 9 15.5a9 9 0 0 1-18 0C7 13.2 12 8.5 16 3z" />
      <path className="as" d="M11 19a5 5 0 0 0 4 4.8" />
    </>
  ),
}

const GLYPH: Record<string, ReactElement> = {
  seta: <path d="M6 18 18 6M9 6h9v9" />,
  direita: <path d="M4 12h16M14 6l6 6-6 6" />,
  esquerda: <path d="M20 12H4M10 6l-6 6 6 6" />,
  mais: <path d="M12 5v14M5 12h14" />,
  menos: <path d="M5 12h14" />,
  visto: <path d="M4 12.5 9 17.5 20 6.5" />,
  fechar: <path d="M5 5l14 14M19 5 5 19" />,
  pesquisa: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l5.5 5.5" />
    </>
  ),
  telefone: <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z" />,
  correio: (
    <>
      <path d="M3 5h18v14H3z" />
      <path d="M3 6l9 7 9-7" />
    </>
  ),
  local: (
    <>
      <path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.4" />
    </>
  ),
  reproduzir: <path d="M8 5v14l11-7z" fill="currentColor" />,
  esq: <path d="M15 5l-7 7 7 7" />,
  dir: <path d="M9 5l7 7-7 7" />,
  painel: (
    <>
      <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" />
    </>
  ),
  cotacao: (
    <>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M9 12h7M9 16h7M15 3v4h4" />
    </>
  ),
  caixa: (
    <>
      <path d="M3 7l9-4 9 4v10l-9 4-9-4z" />
      <path d="M3 7l9 4 9-4M12 11v10" />
    </>
  ),
  etiqueta: (
    <>
      <path d="M3 12V3h9l9 9-9 9z" />
      <path d="M8 8h.01" strokeWidth="3" />
    </>
  ),
  video: (
    <>
      <path d="M3 5h18v14H3z" />
      <path d="M10 9l5 3-5 3z" />
    </>
  ),
  lixo: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />,
  editar: <path d="M4 20l1-5L16 4l4 4L9 19zM13 7l4 4" />,
  carregar: <path d="M12 16V4M6 10l6-6 6 6M4 20h16" />,
  olho: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  copiar: <path d="M8 8h12v12H8zM4 16V4h12" />,
  imprimir: (
    <>
      <path d="M7 9V3h10v6M7 17H3V9h18v8h-4M7 14h10v7H7z" />
    </>
  ),
  sair: <path d="M10 4H4v16h6M14 8l5 4-5 4M19 12H9" />,
  lista: (
    <>
      <path d="M8 4h8v3H8z" />
      <path d="M6 5H5v16h14V5h-1M9 12h6M9 16h6" />
    </>
  ),
  cima: <path d="M12 19V5M6 11l6-6 6 6" />,
  baixo: <path d="M12 5v14M6 13l6 6 6-6" />,
  calculadora: (
    <>
      <path d="M5 3h14v18H5z" />
      <path d="M8 7h8v3H8zM8 14h2M14 14h2M8 18h2M14 18h2" />
    </>
  ),
}

export type IcoName = keyof typeof PICTO | keyof typeof GLYPH

const WHATSAPP = (
  <path
    fill="currentColor"
    stroke="none"
    d="M12 2.5a9.4 9.4 0 0 0-8 14.3L2.7 21.5l4.8-1.2A9.4 9.4 0 1 0 12 2.5zm4.9 12.9c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1a11 11 0 0 1-4.7-3.8c-.9-1.2-1.3-2.4-1.3-3.2s.5-1.5.8-1.8c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2 1.1.9 2 1.2 2.3 1.4.3.1.4.1.6-.1l.8-1c.2-.2.4-.2.6-.1l1.8.9c.3.1.4.2.5.3 0 .2 0 .8-.2 1.4z"
  />
)

interface Props extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IcoName | 'whatsapp'
  size?: number
}

export function Ico({ name, size = 24, className = '', ...rest }: Props) {
  if (name === 'whatsapp')
    return (
      <svg className={`ico ${className}`} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...rest}>
        {WHATSAPP}
      </svg>
    )
  const picto = PICTO[name]
  if (picto)
    return (
      <svg className={`ico ico--p ${className}`} width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false" {...rest}>
        {picto}
      </svg>
    )
  return (
    <svg
      className={`ico ico--g ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {GLYPH[name]}
    </svg>
  )
}
