import React, { useEffect, useMemo, useRef } from 'react'
import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog'
import { css, cx } from 'styled-system/css'

import { useUIStore } from '#/common/store/uiStore'
import { useTranslate } from '@tolgee/react'
import { ConfirmationDialogOptions } from '#/common/types/state'

const backdropClass = css({
  position: 'fixed',
  inset: 0,
  zIndex: 'modal',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
})

const viewportClass = css({
  position: 'fixed',
  inset: 0,
  zIndex: 'modal',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  p: 1,
})

const popupClass = css({
  maxWidth: '30rem',
  width: 'min(30rem, calc(100vw - 1rem))',
  mx: 1,
  borderRadius: '0.625rem',
  border: '1px solid',
  borderColor: 'neutral.main',
  backgroundColor: 'neutral.lighter',
  pt: 1,
  outline: 'none',
})

const titleClass = css({
  color: 'neutral.darker',
  fontFamily: 'var(--font-arimo)',
  fontSize: '1.125rem',
  fontWeight: 700,
  lineHeight: 'normal',
  letterSpacing: '0.1125rem',
  px: 3,
  pt: 3,
})

const titleWithContentClass = css({
  pb: 1,
})

const titleWithoutContentClass = css({
  pb: 2,
})

const contentClass = css({
  px: 3,
  pb: 0,
})

const descriptionClass = css({
  m: 0,
  color: 'neutral.darker',
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.875rem',
  fontWeight: 400,
  lineHeight: 'normal',
  letterSpacing: '0.0875rem',
})

const actionsClass = css({
  px: 3,
  pb: 3,
  pt: 3,
  display: 'flex',
  justifyContent: 'flex-end',
  gap: 1.5,
})

const actionButtonClass = css({
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.875rem',
  fontWeight: 700,
  lineHeight: 'normal',
  letterSpacing: '0.0875rem',
  minWidth: '6.5rem',
  px: 2.5,
  py: 1,
  borderRadius: '999px',
  border: '1px solid',
  borderColor: 'neutral.main',
  backgroundColor: 'neutral.light',
  color: 'neutral.darker',
  boxShadow: '1px 1px 7px 0px #EEECEC',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'primary.lighter',
    borderColor: 'primary.main',
  },
  '&:focus-visible': {
    outline: '2px solid var(--colors-secondary-dark)',
    outlineOffset: '2px',
  },
})

const compactActionButtonClass = css({
  flex: '1 1 0',
  minWidth: 0,
})

const ConfirmationDialog = () => {
  const confirmationDialogOptions = useUIStore(
    (state) => state.confirmationDialogOptions
  )
  const dialogPopupRef = useRef<HTMLDivElement | null>(null)
  const [dismissedDialogId, setDismissedDialogId] = React.useState<
    string | null
  >(null)
  const [shouldFillActionRow, setShouldFillActionRow] = React.useState(false)
  const { t } = useTranslate('avoin-map')
  const currentDialogId = confirmationDialogOptions.id
  const open = currentDialogId != null && currentDialogId !== dismissedDialogId

  useEffect(() => {
    if (!open) {
      return
    }

    const popupElement = dialogPopupRef.current
    if (popupElement == null || typeof ResizeObserver === 'undefined') return

    const updateActionLayout = () => {
      const nextShouldFillActionRow = popupElement.offsetWidth <= 330
      setShouldFillActionRow((prev) =>
        prev === nextShouldFillActionRow ? prev : nextShouldFillActionRow
      )
    }

    const animationFrame = requestAnimationFrame(updateActionLayout)

    const resizeObserver = new ResizeObserver(() => {
      updateActionLayout()
    })

    resizeObserver.observe(popupElement)

    return () => {
      cancelAnimationFrame(animationFrame)
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
    setDismissedDialogId(currentDialogId)
    setShouldFillActionRow(false)
    if (localOptions.onConfirm) {
      localOptions.onConfirm()
    }
  }

  const handleCancel = () => {
    setDismissedDialogId(currentDialogId)
    setShouldFillActionRow(false)
    if (localOptions.onCancel != null) {
      localOptions.onCancel()
    }
  }

  return (
    <BaseAlertDialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && open) {
          handleCancel()
        }
      }}
    >
      <BaseAlertDialog.Portal>
        <BaseAlertDialog.Backdrop
          className={backdropClass}
          onClick={handleCancel}
        />
        <BaseAlertDialog.Viewport className={viewportClass}>
          <BaseAlertDialog.Popup ref={dialogPopupRef} className={popupClass}>
            {localOptions.title != null && (
              <BaseAlertDialog.Title
                className={cx(
                  titleClass,
                  localOptions.content != null
                    ? titleWithContentClass
                    : titleWithoutContentClass
                )}
              >
                {localOptions.title}
              </BaseAlertDialog.Title>
            )}
            {localOptions.content != null && (
              <div className={contentClass}>
                <BaseAlertDialog.Description className={descriptionClass}>
                  {localOptions.content}
                </BaseAlertDialog.Description>
              </div>
            )}
            <div className={actionsClass}>
              <button
                type="button"
                onClick={handleCancel}
                aria-label={localOptions.cancelText}
                className={cx(
                  actionButtonClass,
                  shouldFillActionRow && compactActionButtonClass
                )}
              >
                {localOptions.cancelText}
              </button>
              <button
                type="button"
                onClick={handleAccept}
                aria-label={localOptions.confirmText}
                autoFocus
                className={cx(
                  actionButtonClass,
                  shouldFillActionRow && compactActionButtonClass
                )}
              >
                {localOptions.confirmText}
              </button>
            </div>
          </BaseAlertDialog.Popup>
        </BaseAlertDialog.Viewport>
      </BaseAlertDialog.Portal>
    </BaseAlertDialog.Root>
  )
}

export default ConfirmationDialog
