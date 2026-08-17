import React from 'react'

import type { AppSxProps } from '#/common/style/theme'
import { Box } from '#/common/style/theme'
import { LoadingSpinner } from '#/components/Loading/LoadingSpinner'

import SidebarContentBox from './SidebarContentBox'
import type { SidebarContentBoxProps } from './SidebarContentBox'

export type SidebarLoadingBlockProps = Pick<
  SidebarContentBoxProps,
  'scrollFadeColor' | 'scrollbarSide' | 'sxOuter' | 'sxInner'
> & {
  sx?: AppSxProps
}

export const SidebarLoadingBlock = ({
  scrollFadeColor,
  scrollbarSide,
  sxOuter,
  sxInner,
  sx,
}: SidebarLoadingBlockProps) => (
  <SidebarContentBox
    scrollFadeColor={scrollFadeColor}
    scrollbarSide={scrollbarSide}
    sxOuter={sxOuter}
    sxInner={sxInner}
  >
    <Box
      sx={[
        {
          display: 'flex',
          width: '100%',
          minHeight: '3rem',
          alignItems: 'center',
          justifyContent: 'center',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <LoadingSpinner />
    </Box>
  </SidebarContentBox>
)
