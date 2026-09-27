import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import '@fontsource-variable/inter-tight'
import './styles.css'
import { initSmooth } from './lib/smooth'
import { Layout } from './components/Layout'
import Home from './pages/Home'

const Solution = lazy(() => import('./pages/Solution'))
const Products = lazy(() => import('./pages/Products'))
const Applications = lazy(() => import('./pages/Applications'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const NotFound = lazy(() => import('./pages/NotFound'))

initSmooth()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Suspense fallback={<div className="loading" />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="solucoes/:id" element={<Solution />} />
            <Route path="produtos" element={<Products />} />
            <Route path="aplicacoes" element={<Applications />} />
            <Route path="sobre" element={<About />} />
            <Route path="contacto" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
