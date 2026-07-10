import React from 'react'

import { Box } from '#/common/style/theme'
import TText from '#/components/common/TText'
import {
  BreadcrumbNav,
  IntoSidebarHeaderChildrenSlot,
  IntoSidebarPanelSlot,
  SidebarBoundary,
  SidebarContentBox,
} from '#/components/Sidebar'

import {
  getUiBaselineCategory,
  UI_BASELINE_NAMESPACE,
  type UiBaselineCategoryId,
} from '../common/categories'

type UiBaselineCategoryPageShellProps = {
  categoryId: UiBaselineCategoryId
  children: React.ReactNode
}

const UiBaselineCategoryPageShell = ({
  categoryId,
  children,
}: UiBaselineCategoryPageShellProps) => {
  const category = getUiBaselineCategory(categoryId)

  if (!category) {
    return null
  }

  return (
    <SidebarBoundary id={`ui-baseline-${categoryId}-simple`} mode="simple">
      <IntoSidebarHeaderChildrenSlot>
        <BreadcrumbNav collapseIfRoot />
      </IntoSidebarHeaderChildrenSlot>
      <IntoSidebarPanelSlot panelId="main">
        <SidebarContentBox>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <Box
              component="h1"
              sx={{
                m: 0,
                color: '#111111',
                fontSize: '1.125rem',
                fontWeight: 700,
                lineHeight: 1.25,
              }}
            >
              <TText
                ns={UI_BASELINE_NAMESPACE}
                keyName={category.breadcrumbKey}
              />
            </Box>
            {children}
          </Box>
        </SidebarContentBox>
      </IntoSidebarPanelSlot>
    </SidebarBoundary>
  )
}

export default UiBaselineCategoryPageShell
