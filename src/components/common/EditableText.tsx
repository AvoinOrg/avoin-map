'use client'

import React from 'react'

import {
  AppSxProps,
  Box,
  toSxArray,
} from '#/common/style/theme/system'
import { IconButton } from '#/components/common/Button'
import { CheckcircleChecked, Cross, FountainPen } from '#/components/icons'

export type EditableTextEvent = {
  target: {
    value: string
  }
}

type EditableTextProps = {
  value: string
  onChange: (event: EditableTextEvent) => void
  valueAppendix?: string
  editButtonAriaLabel?: string
  saveButtonAriaLabel?: string
  cancelButtonAriaLabel?: string
  textFieldAriaLabel?: string
  sx?: AppSxProps
  textSx?: AppSxProps
  iconSx?: AppSxProps
}

type StyleItem = Exclude<NonNullable<AppSxProps>, readonly unknown[]>
const toStyleArray = (sx?: AppSxProps) => toSxArray(sx) as StyleItem[]

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
}: EditableTextProps) => {
  const [isValueFocused, setIsInputFocused] = React.useState(false)
  const draftValueRef = React.useRef(value)
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const editSessionRef = React.useRef(0)
  const skipBlurSessionRef = React.useRef<number | null>(null)
  const blurTimeoutRef = React.useRef<number | NodeJS.Timeout | null>(null)

  React.useLayoutEffect(() => {
    draftValueRef.current = value
  }, [value])

  React.useEffect(() => {
    return () => {
      if (blurTimeoutRef.current != null) {
        window.clearTimeout(blurTimeoutRef.current)
      }
    }
  }, [])

  const clearBlurTimeout = () => {
    if (blurTimeoutRef.current == null) {
      return
    }

    window.clearTimeout(blurTimeoutRef.current)
    blurTimeoutRef.current = null
  }

  const startEditSession = () => {
    editSessionRef.current += 1
    skipBlurSessionRef.current = null
    clearBlurTimeout()
    draftValueRef.current = value
  }

  const closeEditSession = () => {
    clearBlurTimeout()
    setIsInputFocused(false)
  }

  const commitDraft = () => {
    if (draftValueRef.current !== value) {
      onChange({ target: { value: draftValueRef.current } })
    }
  }

  const handleEdit = (event: React.MouseEvent | React.KeyboardEvent) => {
    event.stopPropagation()
    startEditSession()
    setIsInputFocused(true)
  }

  const handleEditKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleEdit(event)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    draftValueRef.current = event.target.value
  }

  const preventButtonBlur = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
  }

  const handleSave = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()

    skipBlurSessionRef.current = editSessionRef.current
    commitDraft()
    closeEditSession()
  }

  const handleCancel = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()

    skipBlurSessionRef.current = editSessionRef.current
    draftValueRef.current = value
    closeEditSession()
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const session = editSessionRef.current
    const nextFocusTarget = event.relatedTarget

    clearBlurTimeout()

    blurTimeoutRef.current = window.setTimeout(() => {
      if (session === skipBlurSessionRef.current) {
        return
      }

      if (session !== editSessionRef.current) {
        return
      }

      if (nextFocusTarget != null && rootRef.current?.contains(nextFocusTarget)) {
        return
      }

      commitDraft()
      closeEditSession()
    }, 100)
  }

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    skipBlurSessionRef.current = editSessionRef.current
    commitDraft()
    closeEditSession()
  }

  const handleInputClick = (event: React.MouseEvent<HTMLInputElement>) => {
    event.stopPropagation()
  }

  const handleInputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.stopPropagation()
  }

  const actionButtonStyles: StyleItem = {
    p: 0,
    m: 0,
    border: 'none',
    background: 'none',
    color: 'neutral.dark',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    '&:hover': {
      color: 'neutral.darker',
    },
  }

  const rootStyles: StyleItem[] = [
    {
      display: 'flex',
      alignItems: 'start',
      width: '100%',
      justifyContent: 'flex-start',
      minWidth: 0,
    },
    ...toStyleArray(sx),
  ]

  const displayTextStyles: StyleItem[] = [
    {
      flex: 1,
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    ...toStyleArray(textSx),
  ]

  const iconStyles: StyleItem[] = [
    {
      width: '19px',
      height: '19px',
      color: 'neutral.dark',
      transition: 'color 120ms ease',
      '&:hover': {
        color: 'neutral.darker',
      },
    },
    ...toStyleArray(iconSx),
  ]

  const inputTextSx = [
    {
      '& input': {
        flex: 1,
        minWidth: 0,
        border: 'none',
        outline: 'none',
        m: 0,
        p: 0,
        height: '100%',
        color: 'inherit',
        background: 'transparent',
        typography: 'inherit',
        width: '100%',
        font: 'inherit',
        lineHeight: 'normal',
      },
      '& input:focus-visible': {
        outline: 'none',
      },
    },
    ...toStyleArray(textSx).map(
      (styleItem) =>
        ({
          '& input': styleItem,
        }) as StyleItem
    ),
  ]

  if (!isValueFocused) {
    return (
      <Box ref={rootRef} sx={rootStyles}>
        <Box component="span" sx={displayTextStyles}>
          {`${value}${valueAppendix ?? ''}`}
        </Box>
        <IconButton
          type="button"
          aria-label={editButtonAriaLabel}
          onMouseDown={preventButtonBlur}
          onClick={handleEdit}
          onKeyDown={handleEditKeyDown}
          size="small"
          sx={[
            {
              ml: 1,
              px: 0,
              py: 0,
              minWidth: 0,
              width: '19px',
              height: '19px',
              border: 'none',
              background: 'none',
              color: 'neutral.dark',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              borderRadius: 0,
              '&:hover': {
                color: 'neutral.darker',
              },
            },
          ]}
        >
          <FountainPen sx={iconStyles} />
        </IconButton>
      </Box>
    )
  }

  return (
    <Box
      ref={rootRef}
      sx={[
        {
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          width: '100%',
          minWidth: 0,
          px: '0.75rem',
          py: '0.1rem',
          border: '1px solid',
          borderColor: 'neutral.light',
          borderRadius: '999px',
          backgroundColor: '#fff',
          boxShadow: 'inset 0px 0.5px 1px 0px #D9D9D9',
          minHeight: '1.75rem',
          '&:focus-within': {
            borderColor: 'neutral.darker',
          },
        },
        ...toStyleArray(sx),
      ]}
    >
      <Box component="span" sx={inputTextSx}>
        <input
          autoFocus
          key={`editable-text-input-${value}`}
          defaultValue={value}
          aria-label={textFieldAriaLabel}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleInputKeyDown}
          onClick={handleInputClick}
          onFocus={handleInputFocus}
        />
      </Box>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          ml: 0.25,
          flexShrink: 0,
        }}
      >
        <IconButton
          type="button"
          aria-label={saveButtonAriaLabel}
          onMouseDown={preventButtonBlur}
          onClick={handleSave}
          size="small"
          sx={[actionButtonStyles, { mr: 0.25 }]}
        >
          <CheckcircleChecked sx={iconStyles} />
        </IconButton>
        <IconButton
          type="button"
          aria-label={cancelButtonAriaLabel}
          onMouseDown={preventButtonBlur}
          onClick={handleCancel}
          size="small"
          sx={actionButtonStyles}
        >
          <Cross sx={iconStyles} />
        </IconButton>
      </Box>
    </Box>
  )
}

export default EditableText
