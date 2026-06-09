'use client'

import React, { useEffect, useRef } from 'react'
import { css, cx } from 'styled-system/css'

import { useUIStore } from '#/common/store'
import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import { LoadingSpinner } from '../Loading'

import SidebarToggleButton from './SidebarToggleButton'
import styles from './SidebarScaffold.module.css'

export type HomeSidebarProps = {
  sx?: PandaStyleProp
  children: React.ReactNode
}

type HomeSidebarCssVars = React.CSSProperties & {
  [key: `--sidebar-${string}`]: string
}

export const HomeSidebar = ({ sx, children }: HomeSidebarProps) => {
  const isSidebarDisabled = useUIStore((state) => state.isSidebarDisabled)
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
  const isSidebarLoading = useUIStore((state) => state.isSidebarLoading)
  const setSidebarWidth = useUIStore((state) => state.setSidebarWidth)

  const sidebarPanelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const measureWidth = () => {
      if (sidebarPanelRef.current) {
        setSidebarWidth(sidebarPanelRef.current.getBoundingClientRect().width)
      }
    }

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            measureWidth()
          })
        : null

    if (observer && sidebarPanelRef.current) {
      observer.observe(sidebarPanelRef.current)
    }

    window.addEventListener('resize', measureWidth)
    measureWidth()

    return () => {
      if (observer) {
        observer.disconnect()
      }
      window.removeEventListener('resize', measureWidth)
    }
  }, [setSidebarWidth])

  if (isSidebarDisabled) {
    return <>{children}</>
  }

  const containerVars: HomeSidebarCssVars = {
    '--sidebar-mobile-width': '100vw',
    '--sidebar-mobile-max-width': '100vw',
    '--sidebar-mobile-padding-block': '0',
    '--sidebar-mobile-margin-left': '0',
    '--sidebar-desktop-width': '42rem',
    '--sidebar-desktop-max-width': 'min(42rem, calc(100vw - 2rem))',
    '--sidebar-desktop-padding-block': '1rem',
    '--sidebar-desktop-margin-left': '1rem',
    '--sidebar-desktop-closed-gutter': '1rem',
    '--sidebar-desktop-panel-radius': '10px',
    '--sidebar-panel-background': '#f4f4f4',
    '--sidebar-content-background': '#f4f4f4',
  }

  return (
    <>
      <SidebarToggleButton />
      <div className={styles.sidebarRoot}>
        <div
          ref={sidebarPanelRef}
          className={cx(
            'sidebar-container',
            styles.sidebarContainer,
            styles.homeSidebarContainer,
            css(...pandaStylePropsToArray(sx))
          )}
          data-open={isSidebarOpen ? 'true' : 'false'}
          style={mergePandaStyleProps({
            sx,
            style: containerVars,
          })}
        >
          <div className={styles.homeSidebarPanelFrame}>
            {isSidebarLoading && (
              <div
                className={cx(
                  styles.loadingOverlay,
                  styles.homeLoadingOverlay
                )}
              >
                <LoadingSpinner size="5rem" />
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

export default HomeSidebar
