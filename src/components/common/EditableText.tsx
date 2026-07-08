'use client'

import React from 'react'

import {
  AppSxProps,
  Box,
  toSxArray,
} from '#/common/style/theme/system'
import { IconButton } from '#/components/common/Button'
import { Cross, Done, FountainPen } from '#/components/icons'

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
  const controlMinHeight = 28
  const editIconSize = 14
  const actionIconSize = 14
  const actionButtonHitSize = 20

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
    minWidth: `${actionButtonHitSize}px`,
    width: `${actionButtonHitSize}px`,
    height: `${actionButtonHitSize}px`,
    borderRadius: '50%',
    border: 'none',
    background: 'transparent',
    color: 'neutral.dark',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    transition: 'background-color 120ms ease, color 120ms ease',
    '&:hover': {
      color: 'neutral.darker',
      backgroundColor: 'action.hover',
    },
    '&:focus-visible': {
      color: 'neutral.darker',
      backgroundColor: 'action.hover',
    },
  }

  const rootStyles: StyleItem[] = [
    {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      justifyContent: 'flex-start',
      minWidth: 0,
      minHeight: `${controlMinHeight}px`,
    },
    ...toStyleArray(sx),
  ]

  const displayTextStyles: StyleItem[] = [
    {
      flex: '0 1 auto',
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    ...toStyleArray(textSx),
  ]

  const displayIconStyles: StyleItem[] = [
    {
      width: `${editIconSize}px`,
      height: `${editIconSize}px`,
      color: 'neutral.dark',
      transition: 'color 120ms ease',
      '&:hover': {
        color: 'neutral.darker',
      },
    },
    ...toStyleArray(iconSx),
  ]

  const actionIconStyles: StyleItem[] = [
    {
      width: `${actionIconSize}px`,
      height: `${actionIconSize}px`,
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
          sx={[actionButtonStyles, { ml: 0.5, flexShrink: 0 }]}
        >
          <FountainPen sx={displayIconStyles} />
        </IconButton>
      </Box>
    )
  }

  return (
    <Box
      ref={rootRef}
      sx={[
        {
          gap: 0,
        },
        ...rootStyles,
      ]}
    >
      <Box
        component="span"
        sx={[
          {
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'neutral.light',
            pb: 0.25,
          },
          ...inputTextSx,
        ]}
      >
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
          sx={[actionButtonStyles, { mr: 0.125 }]}
        >
          <Done sx={actionIconStyles} />
        </IconButton>
        <IconButton
          type="button"
          aria-label={cancelButtonAriaLabel}
          onMouseDown={preventButtonBlur}
          onClick={handleCancel}
          size="small"
          sx={actionButtonStyles}
        >
          <Cross sx={actionIconStyles} />
        </IconButton>
      </Box>
    </Box>
  )
}

export default EditableText
