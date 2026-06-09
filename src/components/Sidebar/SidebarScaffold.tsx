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

import styles from './SidebarScaffold.module.css'

type SidebarScaffoldProps = {
  children: React.ReactNode
  topContent?: React.ReactNode
  bottomContent?: React.ReactNode
  trailingContent?: React.ReactNode
  actionRail?: React.ReactNode
  hideMainContainer?: boolean
  containerSx?: PandaStyleProp
  panelSx?: PandaStyleProp
  contentSx?: PandaStyleProp
  mobileWidth?: string
  mobileMaxWidth?: string
  desktopWidth?: string
  desktopMaxWidth?: string
  desktopGutter?: string
  desktopPaddingBlock?: string
  desktopPanelBorderRadius?: string
  panelBackgroundColor?: string
  contentBackgroundColor?: string
}

type SidebarScaffoldCssVars = React.CSSProperties & {
  [key: `--sidebar-${string}`]: string
}

const SidebarScaffold = ({
  children,
  topContent,
  bottomContent,
  trailingContent,
  actionRail,
  hideMainContainer = false,
  containerSx,
  panelSx,
  contentSx,
  mobileWidth = '100vw',
  mobileMaxWidth = '100vw',
  desktopWidth = '30rem',
  desktopMaxWidth = 'min(30rem, calc(100vw - 2rem))',
  desktopGutter = '1rem',
  desktopPaddingBlock = desktopGutter,
  desktopPanelBorderRadius = '10px',
  panelBackgroundColor = '#f4f4f4',
  contentBackgroundColor = panelBackgroundColor,
}: SidebarScaffoldProps) => {
  const isSidebarDisabled = useUIStore((state) => state.isSidebarDisabled)
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
  const setSidebarWidth = useUIStore((state) => state.setSidebarWidth)
  const isSidebarLoading = useUIStore((state) => state.isSidebarLoading)

  const sidebarRef = useRef<HTMLDivElement | null>(null)
  const sidebarContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const measure = () => {
      if (sidebarRef.current) {
        setSidebarWidth(sidebarRef.current.getBoundingClientRect().width)
      }
    }

    const observer =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            measure()
          })
        : null

    if (observer) {
      if (sidebarRef.current) {
        observer.observe(sidebarRef.current)
      }
      if (sidebarContainerRef.current) {
        observer.observe(sidebarContainerRef.current)
      }
    }

    window.addEventListener('resize', measure)
    measure()

    return () => {
      if (observer) {
        observer.disconnect()
      }
      window.removeEventListener('resize', measure)
    }
  }, [setSidebarWidth])

  if (isSidebarDisabled) {
    return <>{children}</>
  }

  const containerVars: SidebarScaffoldCssVars = {
    '--sidebar-mobile-width': mobileWidth,
    '--sidebar-mobile-max-width': mobileMaxWidth,
    '--sidebar-mobile-padding-block': '0',
    '--sidebar-mobile-margin-left': '0',
    '--sidebar-desktop-width': desktopWidth,
    '--sidebar-desktop-max-width': desktopMaxWidth,
    '--sidebar-desktop-padding-block': desktopPaddingBlock,
    '--sidebar-desktop-margin-left': desktopGutter,
    '--sidebar-desktop-closed-gutter': desktopGutter,
    '--sidebar-desktop-panel-radius': desktopPanelBorderRadius,
    '--sidebar-panel-background': panelBackgroundColor,
    '--sidebar-content-background': contentBackgroundColor,
  }

  return (
    <div
      ref={sidebarRef}
      className={styles.sidebarRoot}
    >
      <div
        className={cx(
          'sidebar-container',
          styles.sidebarContainer,
          css(...pandaStylePropsToArray(containerSx))
        )}
        ref={sidebarContainerRef}
        data-open={isSidebarOpen ? 'true' : 'false'}
        data-hidden-main={hideMainContainer ? 'true' : undefined}
        style={mergePandaStyleProps({
          sx: containerSx,
          style: containerVars,
        })}
      >
        <div className={styles.sidebarBodyRow}>
          <div className={styles.sidebarPanelFrame}>
            <div
              className={cx(
                styles.sidebarPanel,
                css(...pandaStylePropsToArray(panelSx))
              )}
              style={mergePandaStyleProps({ sx: panelSx })}
            >
              {topContent}
              {isSidebarLoading && (
                <div className={styles.loadingOverlay}>
                  <LoadingSpinner size="5rem" />
                </div>
              )}
              <div
                className={cx(
                  styles.sidebarContent,
                  css(...pandaStylePropsToArray(contentSx))
                )}
                style={mergePandaStyleProps({ sx: contentSx })}
              >
                {children}
              </div>
              {bottomContent && (
                <div className={styles.sidebarBottomContent}>
                  {bottomContent}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {trailingContent}
      {actionRail}
    </div>
  )
}

export default SidebarScaffold
