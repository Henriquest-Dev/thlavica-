import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { UiProvider } from './Ui'
import { SearchOverlay } from './SearchOverlay'
import { QuoteDrawer } from './QuoteDrawer'
import { PromoPopup } from './Promos'
import { AdminLogin } from './AdminLogin'
import { scrollTop } from '../lib/smooth'

export function Layout() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    scrollTop()
  }, [pathname, hash])
  return (
    <UiProvider>
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
      <SearchOverlay />
      <QuoteDrawer />
      <PromoPopup />
      <AdminLogin />
    </UiProvider>
  )
}
