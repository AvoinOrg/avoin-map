import { Button as BaseButton } from '@base-ui/react/button'
import { useRef } from 'react'
import { css, cx } from 'styled-system/css'

import { MAP_CONTROL_EDGE_GUTTER_PX } from '#/common/constants/map'
import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import { MapPinGlobe, Sandwich } from '#/components/icons'
import { useUIStore } from '../../common/store'

interface Props {
  styleProps?: PandaStyleProp
}

const sidebarToggleButtonSx = {
  m: 0,
  p: 0,
  border: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'fixed',
  right: `${MAP_CONTROL_EDGE_GUTTER_PX}px`,
  bottom: `${MAP_CONTROL_EDGE_GUTTER_PX}px`,
  width: '45px',
  minWidth: '45px',
  height: '45px',
  borderRadius: '10px',
  color: '#FFFFFF',
  backgroundColor: '#4f4f4f',
  boxShadow: '0px 10px 24px rgba(0, 0, 0, 0.26)',
  zIndex: 'calc(var(--z-index-drawer) + 12)',
  pointerEvents: 'auto',
  cursor: 'pointer',
  transition: 'background-color 0.2s, transform 0.2s',
  transform: 'translateY(0)',
  '&:hover': {
    backgroundColor: '#424242',
    transform: 'translateY(-1px)',
  },
  '&:focus-visible': {
    outline: '2px solid rgba(255,255,255,0.85)',
    outlineOffset: '2px',
  },
} as const

const SidebarToggleButton = ({ styleProps }: Props) => {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
  const setIsSidebarOpen = useUIStore((state) => state.setIsSidebarOpen)
  const isSidebarDisabled = useUIStore((state) => state.isSidebarDisabled)
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  if (isSidebarDisabled) {
    return null
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <BaseButton
      ref={buttonRef}
      onClick={toggleSidebar}
      className={cx(
        'sidebar-toggle-button',
        css(sidebarToggleButtonSx, ...pandaStylePropsToArray(styleProps))
      )}
      style={mergePandaStyleProps({
        styleProps: [sidebarToggleButtonSx, ...pandaStylePropsToArray(styleProps)],
      })}
      aria-label={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
    >
      {isSidebarOpen ? (
        <MapPinGlobe
          styleProps={{ width: '2rem', height: '2rem', mt: -0.4, mr: -0.42 }}
        />
      ) : (
        <Sandwich styleProps={{ width: '1.75rem', height: '1rem' }} />
      )}
    </BaseButton>
  )
}

export default SidebarToggleButton
