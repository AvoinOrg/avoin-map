/** @jsxImportSource @emotion/react */
'use client'

import { useMapStore } from '#/common/store'
import { NavBar } from '#/components/NavBar'
import { MainMenu, Sidebar } from '#/components/Sidebar'
import { useEffect } from 'react'

const Page = () => {
  const setMapContext = useMapStore((state) => state.setMapContext)

  useEffect(() => {
    setMapContext('main')
  }, [])

  return (
    <>
      <Sidebar>
        <MainMenu />
      </Sidebar>
      <NavBar />
    </>
  )
}

export default Page
