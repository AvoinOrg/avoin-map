import React, { useLayoutEffect, useRef, useState } from 'react'
import { Input as BaseInput } from '@base-ui/react/input'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import { CheckcircleChecked, Cross, EditDocument } from '#/components/icons'

interface Props {
  value: string
  onChange: (event: { target: { value: string } }) => void
  valueAppendix?: string
  editButtonAriaLabel?: string
  saveButtonAriaLabel?: string
  cancelButtonAriaLabel?: string
  textFieldAriaLabel?: string
  sx?: PandaStyleProp
  textSx?: PandaStyleProp
  iconSx?: PandaStyleProp
}

const wrapperClass = css({
  display: 'flex',
  alignItems: 'start',
  width: '100%',
  justifyContent: 'flex-start',
})

const textClass = css({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

const iconButtonClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  ml: 1,
  p: 0,
  height: '100%',
  border: 0,
  backgroundColor: 'transparent',
  color: 'neutral.dark',
  cursor: 'pointer',
  lineHeight: 0,
  '&:hover': {
    color: 'neutral.darker',
  },
  '&:focus-visible': {
    outline: '2px solid var(--colors-secondary-dark)',
    outlineOffset: '2px',
  },
})

const inputShellClass = css({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  borderRadius: '999px',
  border: '0.5px solid #D6D6D6',
  backgroundColor: '#FFFFFF',
  overflow: 'hidden',
  '&:focus-within': {
    borderColor: 'secondary.dark',
  },
})

const inputClass = css({
  flex: 1,
  minWidth: 0,
  border: 0,
  outline: 'none',
  backgroundColor: 'transparent',
  color: '#111111',
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.875rem',
  lineHeight: 'normal',
  p: '0.375rem 0.75rem',
})

const adornmentClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
  gap: '0.25rem',
  pr: '0.5rem',
})

const actionButtonClass = css({
  p: 0,
  m: 0,
  background: 'none',
  border: 'none',
  height: '100%',
  color: 'neutral.dark',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  lineHeight: 0,
  '&:hover': {
    color: 'neutral.darker',
  },
  '&:focus-visible': {
    outline: '2px solid var(--colors-secondary-dark)',
    outlineOffset: '2px',
  },
})

const EditableText = ({
  value,
  onChange,
  valueAppendix,
  editButtonAriaLabel = 'Edit text',
  saveButtonAriaLabel = 'Save text',
  cancelButtonAriaLabel = 'Cancel text editing',
  textFieldAriaLabel = 'Editable text',
  sx,
  textSx,
  iconSx,
}: Props) => {
  const [internalValue, setInternalValue] = useState(value)
  const [isValueFocused, setIsInputFocused] = useState(false)
  const isCanceledRef = useRef(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Keep the edit buffer aligned with external value updates.
    setInternalValue(value)
  }, [value])

  React.useEffect(() => {
    if (isValueFocused) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isValueFocused])

  const commitValue = (nextValue: string) => {
    setIsInputFocused(false)
    if (nextValue !== value) {
      onChange({ target: { value: nextValue } })
    }
  }

  const handleCancel = (event: React.SyntheticEvent) => {
    isCanceledRef.current = true
    setInternalValue(value)
    setIsInputFocused(false)
    event.stopPropagation()
  }

  const handleAccept = (event: React.SyntheticEvent) => {
    commitValue(internalValue)
    event.stopPropagation()
  }

  const handleBlur = () => {
    setTimeout(() => {
      if (isCanceledRef.current) {
        isCanceledRef.current = false
        return
      }
      commitValue(internalValue)
    }, 100)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      commitValue(internalValue)
    }
  }

  const handleEditClick = (event: React.SyntheticEvent) => {
    event.stopPropagation()
    setIsInputFocused(true)
  }

  return (
    <div
      className={cx(wrapperClass, css(...pandaStylePropsToArray(sx)))}
      style={mergePandaStyleProps({ sx })}
    >
      {!isValueFocused ? (
        <>
          <span
            className={cx(textClass, css(...pandaStylePropsToArray(textSx)))}
            style={mergePandaStyleProps({ sx: textSx })}
          >
            {`${value}${valueAppendix ?? ''}`}
          </span>
          <button
            type="button"
            onClick={handleEditClick}
            aria-label={editButtonAriaLabel}
            className={iconButtonClass}
          >
            <EditDocument
              sx={[
                {
                  width: '19px',
                  height: '19px',
                },
                ...pandaStylePropsToArray(iconSx),
              ]}
              aria-hidden="true"
            />
          </button>
        </>
      ) : (
        <span
          className={inputShellClass}
          onClick={(event) => event.stopPropagation()}
          onFocus={(event) => event.stopPropagation()}
        >
          <BaseInput
            ref={inputRef}
            value={internalValue}
            onChange={(event) => setInternalValue(event.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            aria-label={textFieldAriaLabel}
            className={cx(inputClass, css(...pandaStylePropsToArray(textSx)))}
            style={mergePandaStyleProps({ sx: textSx })}
          />
          <span className={adornmentClass}>
            <button
              type="button"
              aria-label={saveButtonAriaLabel}
              className={actionButtonClass}
              onClick={handleAccept}
            >
              <CheckcircleChecked
                sx={[
                  { width: '19px', height: '19px' },
                  ...pandaStylePropsToArray(iconSx),
                ]}
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              aria-label={cancelButtonAriaLabel}
              className={actionButtonClass}
              onClick={handleCancel}
            >
              <Cross
                sx={[
                  { width: '19px', height: '19px' },
                  ...pandaStylePropsToArray(iconSx),
                ]}
                aria-hidden="true"
              />
            </button>
          </span>
        </span>
      )}
    </div>
  )
}

export default EditableText
