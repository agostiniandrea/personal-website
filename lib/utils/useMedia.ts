import { useEffect, useState } from 'react'

interface IUseMedia {
  isMobile: boolean
  isDesktop: boolean
  isTablet: boolean
  isTouchScreen: boolean
}

export const useMedia = (): IUseMedia => {
  const [isMobile, setMobile] = useState(false)
  const [isTablet, setTablet] = useState(false)
  const [isDesktop, setDesktop] = useState(false)
  const [isTouchScreen, setTouchScreen] = useState(false)

  useEffect(() => {
    if (typeof window == 'undefined') return

    const mobileListener = window.matchMedia(
      '(min-width: 0px) and (max-width: 600px)',
    )

    if (isMobile !== mobileListener.matches) {
      setMobile(mobileListener.matches)
    }

    const tabletListener = window.matchMedia(
      '(min-width: 600px) and (max-width: 1200px)',
    )

    if (isTablet !== tabletListener.matches) {
      setTablet(tabletListener.matches)
    }

    const desktopListener = window.matchMedia(
      '(min-width: 1200px) and (min-width: 1536px)',
    )

    if (isDesktop !== desktopListener.matches) {
      setDesktop(desktopListener.matches)
    }

    const touchScreenListener = window.matchMedia('(pointer:coarse)')

    if (isTouchScreen !== touchScreenListener.matches) {
      setTouchScreen(touchScreenListener.matches)
    }

    const handleMobileListener = ({ matches }: MediaQueryListEvent) =>
      setMobile(matches)

    const handleTabletListener = ({ matches }: MediaQueryListEvent) =>
      setTablet(matches)

    const handleDesktopListener = ({ matches }: MediaQueryListEvent) =>
      setDesktop(matches)

    const handleTouchScreenListener = ({ matches }: MediaQueryListEvent) =>
      setTouchScreen(matches)

    mobileListener.addEventListener('change', handleMobileListener)

    tabletListener.addEventListener('change', handleTabletListener)

    desktopListener.addEventListener('change', handleDesktopListener)

    touchScreenListener.addEventListener('change', handleTouchScreenListener)

    return () => {
      mobileListener.removeEventListener('change', handleMobileListener)
      tabletListener.removeEventListener('change', handleTabletListener)
      desktopListener.removeEventListener('change', handleDesktopListener)
      touchScreenListener.removeEventListener(
        'change',
        handleTouchScreenListener,
      )
    }
  }, [])

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouchScreen,
  }
}
