'use client'

import React from 'react'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

import { IntoSlot, Slot } from '#/components/context/slotsContext'
import { Box, toSxArray, type AppSxProps } from '#/common/style/theme'

const FULLSCREEN_PAGE_SLOT = 'fullscreen-page'
type AppSxItem = Exclude<NonNullable<AppSxProps>, readonly unknown[]>
const toAppSxItemArray = (sx?: AppSxProps) => toSxArray(sx) as AppSxItem[]

type FullscreenPageProps = {
  children: React.ReactNode
  sx?: AppSxProps
}

export const FullscreenPageSlot = () => {
  return (
    <Box
      className="fullscreen-page-slot"
      sx={(theme) => ({
        position: 'fixed',
        inset: 0,
        zIndex: theme.zIndex.modal,
        display: 'flex',
        pointerEvents: 'none',
        flexDirection: 'column',
        minHeight: 0,
        minWidth: 0,
      })}
    >
      <Slot name={FULLSCREEN_PAGE_SLOT} />
    </Box>
  )
}

export const FullscreenPage = ({ children, sx }: FullscreenPageProps) => {
  return (
    <IntoSlot name={FULLSCREEN_PAGE_SLOT}>
      <Box
        className="fullscreen-page"
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          minWidth: 0,
          pointerEvents: 'auto',
        }}
      >
        <OverlayScrollbarsComponent
          className="osScroll"
          options={{
            overflow: { x: 'hidden', y: 'scroll' },
            scrollbars: {
              theme: 'os-theme-dark',
              autoHide: 'leave',
              autoHideDelay: 600,
            },
          }}
          style={{
            flex: 1,
            minHeight: 0,
            height: '100%',
            width: '100%',
          }}
          defer
        >
          <Box
            className="fullscreen-page-inner"
            sx={[
              {
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100%',
                width: '100%',
                '& > *': {
                  flexShrink: 0,
                },
              },
              ...toAppSxItemArray(sx),
            ]}
          >
            {children}
          </Box>
        </OverlayScrollbarsComponent>
      </Box>
    </IntoSlot>
  )
}
