import React from 'react'

import { getUmamiScriptConfig } from '#/common/utils/umami'

type AppletLayoutProps = {
  children: React.ReactNode
  umamiWebsiteId?: string
}

const AppletLayout = ({ children, umamiWebsiteId }: AppletLayoutProps) => {
  const umamiScript = getUmamiScriptConfig(umamiWebsiteId)

  return (
    <>
      {umamiScript && (
        <script
          defer
          src={umamiScript.src}
          data-website-id={umamiScript.websiteId}
        />
      )}
      {children}
    </>
  )
}

export default AppletLayout
