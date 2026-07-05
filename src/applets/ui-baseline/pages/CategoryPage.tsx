'use client'

import React from 'react'

import { Box } from '#/common/style/theme'
import TText from '#/components/common/TText'
import { BreadcrumbNav, SidebarContentBox } from '#/components/Sidebar'

import {
  getUiBaselineCategory,
  UI_BASELINE_NAMESPACE,
  type UiBaselineCategoryId,
} from '../common/categories'
import CategoryContent from './CategoryContent'

type CategoryPageProps = {
  categoryId: UiBaselineCategoryId
  children?: React.ReactNode
}

const CategoryPage = ({ categoryId, children }: CategoryPageProps) => {
  const category = getUiBaselineCategory(categoryId)

  if (!category) {
    return null
  }

  return (
    <SidebarContentBox
      sxOuter={{ height: '100%' }}
      scrollbarSide="left"
      sxInner={{
        p: 0,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        height: '100%',
      }}
    >
      <Box
        sx={{
          px: { mobile: '2rem', desktop: '2rem' },
          pt: { mobile: '1rem', desktop: '1.125rem' },
          pb: { mobile: '1.5rem', desktop: '1.75rem' },
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <BreadcrumbNav
          sx={{
            minHeight: '1.25rem',
            flexGrow: 0,
          }}
        />
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
          <TText ns={UI_BASELINE_NAMESPACE} keyName={category.breadcrumbKey} />
        </Box>
        {children ?? <CategoryContent categoryId={category.id} />}
      </Box>
    </SidebarContentBox>
  )
}

export default CategoryPage
