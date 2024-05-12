'use client'

import '#/common/style/index.css'

import React, { useEffect, useState } from 'react'
import { SessionProvider } from 'next-auth/react'
import { SWRProvider } from '#/components/utils/SWRProvider'

const LayoutClient = ({ children }: { children: React.ReactNode }) => {
  const [isHydrated, setIsHydrated] = useState(false)
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return (
    <html lang="en">
      <body>
        {/* <RootStyleRegistry> */}
        {isHydrated && (
          <SessionProvider>
            <SWRProvider>{children}</SWRProvider>
          </SessionProvider>
        )}
        {/* </RootStyleRegistry> */}
      </body>
    </html>
  )
}

export default LayoutClient
