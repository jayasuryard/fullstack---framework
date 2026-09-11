/**
 * Responsive app shell — renders MainLayout on desktop viewports and
 * MobileLayout on narrow ones, switching live on resize so a single set of
 * nested routes exercises both the desktop sidebar and the mobile bottom nav.
 */
import { useEffect, useState } from 'react'
import { MainLayout } from './MainLayout'
import { MobileLayout } from './MobileLayout'

const MOBILE_QUERY = '(max-width: 767px)'

export const AppShell = () => {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches
  )

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY)
    const handleChange = (e) => setIsMobile(e.matches)
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])

  return isMobile ? <MobileLayout /> : <MainLayout />
}
