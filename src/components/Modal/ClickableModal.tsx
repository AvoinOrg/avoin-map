import React from 'react'
import { Dialog } from '@base-ui/react/dialog'

import {
  Box,
  type AppSxProps,
  type AppTheme,
  toSxArray,
} from '#/common/style/theme/system'
import { Cross } from '#/components/icons'

type Props = {
  children: React.ReactNode
  defaultOpen?: boolean
  modalBody: React.ReactNode
  sx?: AppSxProps
  textContainerSx?: AppSxProps
  triggerAriaLabel?: string
}

const resetButtonSx = {
  background: 'none',
  border: 'none',
  p: 0,
  m: 0,
  color: 'inherit',
  font: 'inherit',
  textAlign: 'inherit',
  '&:hover': { cursor: 'pointer' },
  '&:focus-visible': {
    outline: (theme: AppTheme) =>
      `2px solid ${theme.palette.secondary.dark}`,
    outlineOffset: 2,
  },
}

const MODAL_SURFACE_BORDER_RADIUS = '10px'

const closeButtonSx = {
  position: 'absolute',
  right: 8,
  top: 8,
  width: 40,
  height: 40,
  minWidth: 40,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: '1px solid transparent',
  borderRadius: '50%',
  color: 'inherit',
  p: 0,
  m: 0,
  '&:hover': {
    backgroundColor: 'action.hover',
    cursor: 'pointer',
  },
  '&:focus-visible': {
    backgroundColor: 'action.hover',
    outline: 'none',
    boxShadow: (theme: AppTheme) =>
      `0 0 0 2px ${theme.palette.secondary.dark}`,
  },
}

const ClickableModal = ({
  defaultOpen = false,
  modalBody,
  children,
  sx,
  textContainerSx,
  triggerAriaLabel = 'Open modal',
}: Props) => {
  const [open, setOpen] = React.useState(defaultOpen)

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
      }}
    >
      <Dialog.Trigger
        aria-label={triggerAriaLabel}
        type="button"
        render={(triggerProps) => (
          <Box
            {...triggerProps}
            component="button"
            sx={[resetButtonSx, ...toSxArray(sx)]}
          >
            {children}
          </Box>
        )}
      />

      <Dialog.Portal>
        <Dialog.Backdrop
          render={(backdropProps) => (
            <Box
              {...backdropProps}
              sx={(theme) => ({
                position: 'fixed',
                inset: 0,
                zIndex: theme.zIndex.modal,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              })}
            />
          )}
        />
        <Dialog.Viewport
          render={(viewportProps) => (
            <Box
              {...viewportProps}
              sx={(theme) => ({
                position: 'fixed',
                inset: 0,
                zIndex: theme.zIndex.modal,
                display: 'flex',
                alignItems: {
                  mobile: 'stretch',
                  desktop: 'center',
                },
                justifyContent: 'center',
                overflow: 'auto',
              })}
            />
          )}
        >
          <Dialog.Popup
            aria-label={triggerAriaLabel}
            render={(popupProps) => (
              <Box
                {...popupProps}
                sx={[
                  {
                    position: 'relative',
                    width: {
                      mobile: '100%',
                      desktop: '800px',
                    },
                    maxWidth: '100%',
                    maxHeight: {
                      mobile: '100vh',
                      desktop: '80vh',
                    },
                    overflow: 'auto',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    border: 'none',
                    outline: 'none',
                    borderRadius: MODAL_SURFACE_BORDER_RADIUS,
                  },
                  ...toSxArray(sx),
                ]}
              />
            )}
          >
            <Dialog.Close
              aria-label="close"
              render={(closeProps) => (
                <Box {...closeProps} component="button" sx={closeButtonSx}>
                  <Cross sx={{ width: 16, height: 16 }} />
                </Box>
              )}
            />
            <Box sx={[{ mt: 2 }, ...toSxArray(textContainerSx)]}>
              {modalBody}
            </Box>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ClickableModal
