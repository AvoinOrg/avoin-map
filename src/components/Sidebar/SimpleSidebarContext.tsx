import React, { createContext, useContext } from 'react'

type SimpleSidebarContextValue = {
  isSimpleSidebar: boolean
  mobileStackedContentBefore?: React.ReactNode
  mobileStackedContentAfter?: React.ReactNode
}

const SimpleSidebarContext = createContext<SimpleSidebarContextValue>({
  isSimpleSidebar: false,
})

export const SimpleSidebarProvider = ({
  value,
  children,
}: {
  value: SimpleSidebarContextValue
  children: React.ReactNode
}) => {
  return (
    <SimpleSidebarContext.Provider value={value}>
      {children}
    </SimpleSidebarContext.Provider>
  )
}

export const useSimpleSidebarContext = () => {
  return useContext(SimpleSidebarContext)
}
