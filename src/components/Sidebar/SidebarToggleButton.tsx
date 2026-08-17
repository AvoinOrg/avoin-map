import { useRef } from 'react'
import { MAP_CONTROL_EDGE_GUTTER_PX } from '#/common/constants/map'
import type { AppBoxProps } from '#/common/style/theme/system'
import { Box } from '#/common/style/theme/system'
import { MapPinGlobe, Sandwich } from '#/components/icons'
import { useUIStore } from '../../common/store'

type SidebarStyleProps = AppBoxProps['sx']
const nativeButtonType = {
  type: 'button',
} satisfies Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'>

interface Props {
  sx?: SidebarStyleProps
}

const SidebarToggleButton = ({ sx }: Props) => {
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
    <Box
      component="button"
      {...nativeButtonType}
      ref={buttonRef}
      onClick={toggleSidebar}
      className="sidebar-toggle-button"
      sx={[
        (theme) => ({
          m: 0,
          p: 0,
          display: 'inline-flex',
          position: 'fixed',
          right: `${MAP_CONTROL_EDGE_GUTTER_PX}px`,
          bottom: `${MAP_CONTROL_EDGE_GUTTER_PX}px`,
          width: '45px',
          minWidth: '45px',
          height: '45px',
          border: 0,
          borderRadius: '10px',
          appearance: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          font: 'inherit',
          color: '#FFFFFF',
          backgroundColor: '#4f4f4f',
          boxShadow: '0px 10px 24px rgba(0, 0, 0, 0.26)',
          zIndex: (theme.zIndex?.drawer ?? 1200) + 12,
          pointerEvents: 'auto',
          transition: 'background-color 0.2s, transform 0.2s',
          transform: 'translateY(0)',
          '&:hover': {
            backgroundColor: '#424242',
            transform: 'translateY(-1px)',
          },
          '&:focus-visible': {
            outline: `2px solid ${theme.palette?.secondary?.dark ?? '#1976d2'}`,
            outlineOffset: 2,
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      aria-label={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
    >
      {isSidebarOpen ? (
        <MapPinGlobe
          sx={{ width: '2rem', height: '2rem', mt: -0.4, mr: -0.42 }}
        />
      ) : (
        <Sandwich sx={{ width: '1.7rem', height: '1rem' }} />
      )}
    </Box>
  )
}

export default SidebarToggleButton
