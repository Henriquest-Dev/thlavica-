import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { scrollTop } from '../lib/smooth'

export function Layout() {
  const { pathname } = useLocation()
  useEffect(() => {
    scrollTop()
  }, [pathname])
  return (
    <>
      <a className="skip" href="#main">
        Saltar para o conteúdo
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <div key={pathname} className="route">
          <Outlet />
        </div>
      </main>
      <Footer />
    </>
  )
}
