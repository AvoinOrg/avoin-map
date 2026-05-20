import { Button, SxProps, Theme } from '@mui/material'
import { useRef } from 'react'
import MenuOpenIcon from '@mui/icons-material/MenuOpen'
import { MAP_CONTROL_EDGE_GUTTER_PX } from '#/common/constants/map'
import { MapPinGlobe } from '#/components/icons'
import { useUIStore } from '../../common/store'

interface Props {
  sx?: SxProps<Theme>
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
    <Button
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
          borderRadius: '10px',
          color: '#FFFFFF',
          backgroundColor: '#4f4f4f',
          boxShadow: '0px 10px 24px rgba(0, 0, 0, 0.26)',
          zIndex: theme.zIndex.drawer + 12,
          pointerEvents: 'auto',
          transition: 'background-color 0.2s, transform 0.2s',
          transform: 'translateY(0)',
          '&:hover': {
            backgroundColor: '#424242',
            transform: 'translateY(-1px)',
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      disableRipple={true}
      color="inherit"
      aria-label={isSidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
      size="large"
    >
      {isSidebarOpen ? (
        <MapPinGlobe
          sx={{ width: '2rem', height: '2rem', mt: -0.4, mr: -0.42 }}
        />
      ) : (
        <MenuOpenIcon sx={{ fontSize: '1.75rem' }} />
      )}
    </Button>
  )
}

export default SidebarToggleButton
