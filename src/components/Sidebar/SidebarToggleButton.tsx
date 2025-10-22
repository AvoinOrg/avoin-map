import { Button, SxProps, Theme } from '@mui/material'
import { styled } from '@mui/material/styles'

import Sandwich from '../icons/Sandwich'
import { useUIStore } from '../../common/store'

interface Props {
  sx?: SxProps<Theme>
}

const SidebarToggleButton = ({ sx }: Props) => {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen)
  const setIsSidebarOpen = useUIStore((state) => state.setIsSidebarOpen)
  const isSidebarDisabled = useUIStore((state) => state.isSidebarDisabled)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <Button
      onClick={toggleSidebar}
      className="sidebar-toggle-button"
      sx={[
        {
          m: 0,
          pt: 4,
          pl: 5,
          pb: 2,
          pr: 2,
          display: 'flex',
          '&:hover': {
            backgroundColor: 'transparent',
          },
          minWidth: 'unset',
          maxWidth: 'unset',
          ...(!isSidebarOpen && {
            alignItems: 'flex-start',
            pl: 0,
            pb: 4,
            pt: 0,
            pr: 0,
            marginLeft: '-3px', // a hack to visually align the button with the sidebar
          }),
          transition: 'padding 0.1s',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      disableRipple={true}
      color="inherit"
      aria-label="open drawer"
      disabled={isSidebarDisabled}
      size="large"
    >
      {isSidebarOpen ? (
        <MySandwich />
      ) : (
        <MySandwich
          sx={{
            transform: 'rotate(90deg)',
            mt: 5,
            mr: 2,
            ml: 2,
          }}
        />
      )}
    </Button>
  )
}

const MySandwich = styled(Sandwich)(({ theme }) => ({
  margin: '0',
  width: '48px',
  transition: 'transform 0.1s, margin 0.1s',
}))

export default SidebarToggleButton
