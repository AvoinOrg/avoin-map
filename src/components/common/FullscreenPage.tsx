'use client'

import React from 'react'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import { css, cx } from 'styled-system/css'

import { IntoSlot, Slot } from '#/components/context/slotsContext'
import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'

const FULLSCREEN_PAGE_SLOT = 'fullscreen-page'

type FullscreenPageProps = {
  children: React.ReactNode
  sx?: PandaStyleProp
}

export const FullscreenPageSlot = () => {
  return (
    <div
      className={cx(
        'fullscreen-page-slot',
        css({
          position: 'fixed',
          inset: 0,
          zIndex: 'modal',
          display: 'flex',
          pointerEvents: 'none',
          flexDirection: 'column',
          minHeight: 0,
          minWidth: 0,
        })
      )}
    >
      <Slot name={FULLSCREEN_PAGE_SLOT} />
    </div>
  )
}

export const FullscreenPage = ({ children, sx }: FullscreenPageProps) => {
  return (
    <IntoSlot name={FULLSCREEN_PAGE_SLOT}>
      <div
        className={cx(
          'fullscreen-page',
          css({
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            minWidth: 0,
            pointerEvents: 'auto',
          })
        )}
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
          <div
            className={cx(
              'fullscreen-page-inner',
              css({
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100%',
                width: '100%',
                '& > *': {
                  flexShrink: 0,
                },
              }),
              css(...pandaStylePropsToArray(sx))
            )}
            style={mergePandaStyleProps({ sx })}
          >
            {children}
          </div>
        </OverlayScrollbarsComponent>
      </div>
    </IntoSlot>
  )
}
