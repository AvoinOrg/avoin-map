import React from 'react'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import { visuallyHiddenClass } from '#/components/common/formControlStyles'
import { Cross } from '#/components/icons'

type Props = {
  children: React.ReactNode
  modalBody: React.ReactNode
  sx?: PandaStyleProp
  textContainerSx?: PandaStyleProp
  triggerAriaLabel?: string
}

const triggerClass = css({
  background: 'none',
  border: 'none',
  p: 0,
  m: 0,
  color: 'inherit',
  textAlign: 'inherit',
  '&:hover': { cursor: 'pointer' },
  '&:focus-visible': {
    outline: '2px solid var(--colors-secondary-dark)',
    outlineOffset: '2px',
  },
})

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
  overflow: 'auto',
})

const popupClass = css({
  position: 'relative',
  width: '100%',
  maxHeight: '100vh',
  overflow: 'auto',
  backgroundColor: 'background.paper',
  boxShadow: '24',
  p: 4,
  border: 'none',
  outline: 'none',
  desktop: {
    width: '800px',
    maxHeight: '80vh',
  },
})

const closeButtonClass = css({
  position: 'absolute',
  right: 8,
  top: 8,
  width: '2.5rem',
  height: '2.5rem',
  p: 0,
  border: 'none',
  background: 'transparent',
  color: 'inherit',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  '&:focus-visible': {
    outline: '2px solid var(--colors-secondary-dark)',
    outlineOffset: '2px',
  },
})

const bodyClass = css({
  mt: 2,
})

const ClickableModal = ({
  modalBody,
  children,
  sx,
  textContainerSx,
  triggerAriaLabel = 'Open modal',
}: Props) => {
  const [open, setOpen] = React.useState(false)
  const titleId = React.useId()
  const descriptionId = React.useId()

  return (
    <BaseDialog.Root open={open} onOpenChange={setOpen}>
      <BaseDialog.Trigger
        type="button"
        aria-label={triggerAriaLabel}
        className={cx(triggerClass, css(...pandaStylePropsToArray(sx)))}
        style={mergePandaStyleProps({ sx })}
      >
        {children}
      </BaseDialog.Trigger>

      <BaseDialog.Portal>
        <BaseDialog.Backdrop className={backdropClass} />
        <BaseDialog.Viewport className={viewportClass}>
          <BaseDialog.Popup
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            className={cx(popupClass, css(...pandaStylePropsToArray(sx)))}
            style={mergePandaStyleProps({ sx })}
          >
            <BaseDialog.Title id={titleId} className={visuallyHiddenClass}>
              {triggerAriaLabel}
            </BaseDialog.Title>
            <BaseDialog.Close
              type="button"
              aria-label="close"
              className={closeButtonClass}
            >
              <Cross sx={{ width: '1rem', height: '1rem' }} />
            </BaseDialog.Close>
            <BaseDialog.Description
              id={descriptionId}
              render={
                <div
                  className={cx(
                    bodyClass,
                    css(...pandaStylePropsToArray(textContainerSx))
                  )}
                  style={mergePandaStyleProps({ sx: textContainerSx })}
                />
              }
            >
              {modalBody}
            </BaseDialog.Description>
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  )
}

export default ClickableModal
