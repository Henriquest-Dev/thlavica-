import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import '@fontsource-variable/plus-jakarta-sans'
import './styles.css'
import { initSmooth } from './lib/smooth'
import { startSync } from './lib/sync'
import { Layout } from './components/Layout'
import Home from './pages/Home'

const Solution = lazy(() => import('./pages/Solution'))
const Products = lazy(() => import('./pages/Products'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const Services = lazy(() => import('./pages/Services'))
const Applications = lazy(() => import('./pages/Applications'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const NotFound = lazy(() => import('./pages/NotFound'))
const AdminLayout = lazy(() => import('./admin/AdminLayout'))
const Overview = lazy(() => import('./admin/Overview'))
const Quotes = lazy(() => import('./admin/Quotes'))
const CatalogAdmin = lazy(() => import('./admin/CatalogAdmin'))
const PromosAdmin = lazy(() => import('./admin/PromosAdmin'))
const MediaAdmin = lazy(() => import('./admin/MediaAdmin'))
const Settings = lazy(() => import('./admin/Settings'))

initSmooth()
startSync()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Suspense fallback={<div className="loading" />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="solucoes/:id" element={<Solution />} />
            <Route path="produtos" element={<Products />} />
            <Route path="categoria/:cat" element={<Products />} />
            <Route path="produtos/:id" element={<ProductPage />} />
            <Route path="servicos" element={<Services />} />
            <Route path="aplicacoes" element={<Applications />} />
            <Route path="sobre" element={<About />} />
            <Route path="contacto" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Overview />} />
            <Route path="cotacoes" element={<Quotes />} />
            <Route path="catalogo" element={<CatalogAdmin />} />
            <Route path="promocoes" element={<PromosAdmin />} />
            <Route path="midia" element={<MediaAdmin />} />
            <Route path="contactos" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
