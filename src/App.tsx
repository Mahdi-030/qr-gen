import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { ToastProvider } from './components/ui/ToastProvider'
import { Spinner } from './components/ui/primitives'
import { useTheme } from './hooks/useTheme'

const HomePage = lazy(() => import('./pages/HomePage'))
const FaqPage = lazy(() => import('./pages/FaqPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

/** Scrolls to #hash targets after navigation (including from other pages), else to the top. */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 })
      return
    }
    let tries = 0
    const id = decodeURIComponent(hash.slice(1))
    const t = window.setInterval(() => {
      const el = document.getElementById(id)
      if (el || ++tries > 20) {
        window.clearInterval(t)
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 60)
    return () => window.clearInterval(t)
  }, [pathname, hash])
  return null
}

function Fallback() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-accent" aria-live="polite">
      <Spinner className="size-8" />
    </div>
  )
}

export default function App() {
  const { theme, toggle } = useTheme()
  return (
    <BrowserRouter>
      <ToastProvider>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-xl focus:bg-accent focus:px-4 focus:py-2 focus:text-white">
          Skip to content
        </a>
        <Header theme={theme} onToggleTheme={toggle} />
        <ScrollManager />
        <main id="main">
          <Suspense fallback={<Fallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </ToastProvider>
    </BrowserRouter>
  )
}
