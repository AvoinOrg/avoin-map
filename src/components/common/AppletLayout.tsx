import React from 'react'
import Script from 'next/script'

type AppletLayoutProps = {
  children: React.ReactNode
  umamiWebsiteId?: string
}

const AppletLayout = ({ children, umamiWebsiteId }: AppletLayoutProps) => {
  const umamiScriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL
  const shouldLoadUmami = umamiScriptUrl && umamiWebsiteId

  return (
    <>
      {shouldLoadUmami && (
        <Script
          defer
          src={umamiScriptUrl}
          data-website-id={umamiWebsiteId}
          strategy="afterInteractive"
        />
      )}
      {children}
    </>
  )
}

export default AppletLayout
