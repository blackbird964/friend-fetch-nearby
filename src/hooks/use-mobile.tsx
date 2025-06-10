
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT
      console.log('[useIsMobile] Screen width:', window.innerWidth, 'isMobile:', mobile)
      setIsMobile(mobile)
    }
    mql.addEventListener("change", onChange)
    // Set initial value
    const mobile = window.innerWidth < MOBILE_BREAKPOINT
    console.log('[useIsMobile] Initial screen width:', window.innerWidth, 'isMobile:', mobile)
    setIsMobile(mobile)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
