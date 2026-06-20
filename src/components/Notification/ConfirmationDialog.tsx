import React, { useEffect, useMemo, useRef } from 'react'
import { Dialog } from '@base-ui/react/dialog'

import { useUIStore } from '#/common/store/uiStore'
import { useTranslate } from '@tolgee/react'
import { ConfirmationDialogOptions } from '#/common/types/state'
import { Box, type AppTheme } from '#/common/style/theme/system'

type SystemButtonProps = React.ComponentProps<typeof Box> &
  React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.RefAttributes<HTMLButtonElement>

const titleId = 'alert-dialog-title'
const descriptionId = 'alert-dialog-description'

const assignRef = <T,>(ref: React.Ref<T> | undefined, value: T | null) => {
  if (typeof ref === 'function') {
    ref(value)
    return
  }

  if (ref != null) {
    ref.current = value
  }
}

const actionButtonSx = {
  typography: 'body1',
  minWidth: '6.5rem',
  px: 2.5,
  py: 1,
  borderRadius: '999px',
  border: '1px solid',
  borderColor: 'neutral.main',
  backgroundColor: 'neutral.light',
  color: 'neutral.darker',
  boxShadow: '1px 1px 7px 0px #EEECEC',
  '&:hover': {
    cursor: 'pointer',
    backgroundColor: 'primary.lighter',
    borderColor: 'primary.main',
  },
  '&:focus-visible': {
    outline: (theme: AppTheme) =>
      `2px solid ${theme.palette.secondary.dark}`,
    outlineOffset: 2,
  },
}

const compactActionButtonSx = {
  flex: '1 1 0',
  minWidth: 0,
}

const resetButtonSx = {
  font: 'inherit',
  textAlign: 'center',
  lineHeight: 1.5,
  m: 0,
  '&:disabled': {
    cursor: 'default',
  },
}

const dialogActionButtonSx = {
  ...resetButtonSx,
  ...actionButtonSx,
}

const dialogPopupSx = {
  position: 'relative',
  width: 'calc(100vw - 1rem)',
  maxWidth: '30rem',
  mx: 1,
  borderRadius: '0.625rem',
  border: '1px solid',
  borderColor: 'neutral.main',
  backgroundColor: 'neutral.lighter',
  color: 'neutral.darker',
  pt: 1,
  outline: 'none',
  '&[data-ending-style]': {
    display: 'none',
  },
}

const backdropSx = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  '&[data-ending-style]': {
    display: 'none',
  },
}

const viewportSx = {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'auto',
  p: 1,
}

const actionRowSx = {
  px: 3,
  pb: 3,
  pt: 3,
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 1.5,
}

const compactActionRowSx = {
  width: '100%',
}

const titleSx = {
  typography: 'h2',
  color: 'neutral.darker',
  px: 3,
  pt: 3,
  m: 0,
}

const contentSx = {
  px: 3,
  pb: 0,
}

const descriptionSx = {
  typography: 'body2',
  color: 'neutral.darker',
  m: 0,
}

const ConfirmationDialog = () => {
  const confirmationDialogOptions = useUIStore(
    (state) => state.confirmationDialogOptions
  )
  const dialogPaperRef = useRef<HTMLElement | null>(null)
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null)
  const handledCloseIdRef = useRef<string | null>(null)
  const [closedDialogId, setClosedDialogId] = React.useState<string | null>(
    null
  )
  const [shouldFillActionRow, setShouldFillActionRow] = React.useState(false)
  const { t } = useTranslate('avoin-map')
  const activeDialogId = confirmationDialogOptions.id
  const open = activeDialogId != null && activeDialogId !== closedDialogId

  useEffect(() => {
    if (!open) {
      return
    }

    const paperElement = dialogPaperRef.current
    if (paperElement == null || typeof ResizeObserver === 'undefined') return

    const updateActionLayout = () => {
      const nextShouldFillActionRow = paperElement.offsetWidth <= 330
      setShouldFillActionRow((prev) =>
        prev === nextShouldFillActionRow ? prev : nextShouldFillActionRow
      )
    }

    updateActionLayout()

    const resizeObserver = new ResizeObserver(() => {
      updateActionLayout()
    })

    resizeObserver.observe(paperElement)

    return () => {
      resizeObserver.disconnect()
    }
  }, [open])

  const localOptions: ConfirmationDialogOptions = useMemo(() => {
    const options = { ...confirmationDialogOptions }
    if (options.confirmText == null) {
      options.confirmText = t('components.confirmation_dialog.confirm')
    }
    if (options.cancelText == null) {
      options.cancelText = t('components.confirmation_dialog.cancel')
    }
    return options
  }, [confirmationDialogOptions, t])

  const closeCurrentDialog = () => {
    setClosedDialogId(activeDialogId)

    if (handledCloseIdRef.current === activeDialogId) {
      return false
    }

    handledCloseIdRef.current = activeDialogId
    return true
  }

  const handleAccept = () => {
    if (!closeCurrentDialog()) return

    if (localOptions.onConfirm) {
      localOptions.onConfirm()
    }
  }

  const handleCancel = () => {
    if (!closeCurrentDialog()) return

    if (localOptions.onCancel != null) {
      localOptions.onCancel()
    }
  }

  const ariaLabel =
    localOptions.title == null
      ? `${localOptions.confirmText} / ${localOptions.cancelText}`
      : undefined

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && open) {
          handleCancel()
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop
          render={(backdropProps) => (
            <Box
              {...backdropProps}
              sx={(theme) => ({
                ...backdropSx,
                zIndex: theme.zIndex.modal,
              })}
            />
          )}
        />
        <Dialog.Viewport
          render={(viewportProps) => (
            <Box
              {...viewportProps}
              sx={(theme) => ({
                ...viewportSx,
                zIndex: theme.zIndex.modal,
              })}
            />
          )}
        >
          <Dialog.Popup
            aria-label={ariaLabel}
            aria-labelledby={localOptions.title != null ? titleId : undefined}
            aria-describedby={
              localOptions.content != null ? descriptionId : undefined
            }
            initialFocus={confirmButtonRef}
            finalFocus={true}
            render={(popupProps) => {
              const { ref: popupRef, ...restPopupProps } = popupProps

              return (
                <Box
                  {...restPopupProps}
                  ref={(node) => {
                    assignRef(popupRef, node)
                    dialogPaperRef.current = node
                  }}
                  sx={dialogPopupSx}
                />
              )
            }}
          >
            {localOptions.title != null && (
              <Dialog.Title
                id={titleId}
                render={(titleProps) => (
                  <Box
                    {...titleProps}
                    component="h2"
                    sx={[
                      titleSx,
                      { pb: localOptions.content != null ? 1 : 2 },
                    ]}
                  />
                )}
              >
                {localOptions.title}
              </Dialog.Title>
            )}
            {localOptions.content != null && (
              <Box sx={contentSx}>
                <Dialog.Description
                  id={descriptionId}
                  render={(descriptionProps) => (
                    <Box
                      {...descriptionProps}
                      component="p"
                      sx={descriptionSx}
                    />
                  )}
                >
                  {localOptions.content}
                </Dialog.Description>
              </Box>
            )}
            <Box
              sx={[
                actionRowSx,
                shouldFillActionRow ? compactActionRowSx : {},
              ]}
            >
              <Box
                {...({
                  component: 'button',
                  type: 'button',
                  onClick: handleCancel,
                  'aria-label': localOptions.cancelText,
                } as SystemButtonProps)}
                sx={[
                  dialogActionButtonSx,
                  shouldFillActionRow ? compactActionButtonSx : {},
                ]}
              >
                {localOptions.cancelText}
              </Box>
              <Box
                {...({
                  component: 'button',
                  type: 'button',
                  ref: (node: HTMLButtonElement | null) => {
                    confirmButtonRef.current = node
                  },
                  onClick: handleAccept,
                  'aria-label': localOptions.confirmText,
                } as SystemButtonProps)}
                sx={[
                  dialogActionButtonSx,
                  shouldFillActionRow ? compactActionButtonSx : {},
                ]}
              >
                {localOptions.confirmText}
              </Box>
            </Box>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default ConfirmationDialog
