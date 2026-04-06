'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { LoadingSpinner } from '#/components/Loading'
import { SidebarContentBox } from '#/components/Sidebar'
import { getRoute } from '#/common/routing/routing-client'
import { routeTree } from '#/common/routing/routes/hiilikartta'

const Page = () => {
  const router = useRouter()

  useEffect(() => {
    router.replace(getRoute({ routeNode: routeTree.plans, routeTree }))
  }, [router])

  return (
    <SidebarContentBox>
      <LoadingSpinner />
    </SidebarContentBox>
  )
}

export default Page
