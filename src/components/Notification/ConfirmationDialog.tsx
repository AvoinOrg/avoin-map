import React, { useEffect, useMemo, useRef } from 'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

import { useUIStore } from '#/common/store'
import { useTranslate } from '@tolgee/react'
import { ConfirmationDialogOptions } from '#/common/types/state'

const actionButtonSx = {
  typography: 'body1',
  minWidth: '6.5rem',
  px: 2.5,
  py: 1,
  borderRadius: '999px',
  borderColor: 'neutral.main',
  backgroundColor: 'neutral.light',
  color: 'neutral.darker',
  boxShadow: '1px 1px 7px 0px #EEECEC',
  '&:hover': {
    backgroundColor: 'primary.lighter',
    borderColor: 'primary.main',
  },
}

const compactActionButtonSx = {
  flex: '1 1 0',
  minWidth: 0,
}

const ConfirmationDialog = () => {
  const confirmationDialogOptions = useUIStore(
    (state) => state.confirmationDialogOptions
  )
  const confirmationDialogIdRef = useRef<string | null>(null)
  const dialogPaperRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = React.useState(false)
  const [shouldFillActionRow, setShouldFillActionRow] = React.useState(false)
  const { t } = useTranslate('avoin-map')

  useEffect(() => {
    if (confirmationDialogOptions) {
      if (confirmationDialogIdRef.current != confirmationDialogOptions.id) {
        confirmationDialogIdRef.current = confirmationDialogOptions.id
        setOpen(true)
      } else if (confirmationDialogOptions.id == null && open) {
        setOpen(false)
      }
    }
  }, [confirmationDialogOptions, open])

  useEffect(() => {
    if (!open) {
      setShouldFillActionRow(false)
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

  const handleAccept = () => {
    setOpen(false)
    if (localOptions.onConfirm) {
      localOptions.onConfirm()
    }
  }

  const handleCancel = () => {
    setOpen(false)
    if (localOptions.onCancel != null) {
      localOptions.onCancel()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      slotProps={{
        paper: {
          ref: dialogPaperRef,
        },
      }}
      sx={{
        '& .MuiDialog-paper': {
          maxWidth: '30rem',
          mx: 1,
          borderRadius: '0.625rem',
          border: '1px solid',
          borderColor: 'neutral.main',
          backgroundColor: 'neutral.lighter',
          pt: 1,
          // boxShadow: '1px 1px 7px 0px #EEECEC',
        },
      }}
    >
      {localOptions.title != null && (
        <DialogTitle
          id="alert-dialog-title"
          sx={{
            typography: 'h2',
            color: 'neutral.darker',
            px: 3,
            pt: 3,
            pb: localOptions.content != null ? 1 : 2,
          }}
        >
          {localOptions.title}
        </DialogTitle>
      )}
      {localOptions.content != null && (
        <DialogContent sx={{ px: 3, pb: 0 }}>
          <DialogContentText
            sx={{ typography: 'body2', color: 'neutral.darker' }}
            id="alert-dialog-description"
          >
            {localOptions.content}
          </DialogContentText>
        </DialogContent>
      )}
      <DialogActions sx={{ px: 3, pb: 3, pt: 3, gap: 1.5 }}>
        <Button
          onClick={handleCancel}
          aria-label={localOptions.cancelText}
          variant="outlined"
          disableFocusRipple
          sx={[actionButtonSx, shouldFillActionRow ? compactActionButtonSx : {}]}
        >
          {localOptions.cancelText}
        </Button>
        <Button
          onClick={handleAccept}
          aria-label={localOptions.confirmText}
          autoFocus
          variant="outlined"
          disableFocusRipple
          sx={[actionButtonSx, shouldFillActionRow ? compactActionButtonSx : {}]}
        >
          {localOptions.confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationDialog
