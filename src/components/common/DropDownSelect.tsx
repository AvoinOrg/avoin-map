'use client'

import { Select as BaseSelect } from '@base-ui/react/select'
import { useTranslate } from '@tolgee/react'
import React from 'react'

import {
  Box,
  type AppSxProps,
  toSxArray,
} from '#/common/style/theme/system'
import { SelectOption } from '#/common/types/general'
import ArrowDown from '#/components/icons/ArrowDown'
import CheckcircleCheckedFilled from '#/components/icons/CheckcircleCheckedFilled'

export type DropDownSelectValue = string

export type DropDownValueChangeEvent = {
  target: {
    value: DropDownSelectValue
  }
  nativeEvent?: Event
}

export type DropDownValueChangeHandler = (
  event: DropDownValueChangeEvent
) => void

type ComponentSxArrayItem = Exclude<NonNullable<AppSxProps>, readonly unknown[]>

type Props = {
  value: unknown
  options: SelectOption[]
  onChange: DropDownValueChangeHandler
  label?: string
  ariaLabel?: string
  allowEmpty?: boolean
  placeholder?: React.ReactNode
  renderOption?: (option: SelectOption) => React.ReactNode
  renderSelectedValue?: (
    selectedOption: SelectOption | undefined,
    selectedValue: string
  ) => React.ReactNode
  sx?: AppSxProps
  selectSx?: AppSxProps
  labelSx?: AppSxProps
  iconSx?: AppSxProps
  typographySx?: AppSxProps
  menuPaperSx?: AppSxProps
  menuItemSx?: AppSxProps
  disabled?: boolean
  successIndicatorMode?: 'outside' | 'hidden'
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  autoFocus?: boolean
}

type DropDownMenuEntry = {
  key: string
  value: string
  label: string
  ariaLabel: string
  content: React.ReactNode
}

const toComponentSxArray = (sx?: AppSxProps) =>
  toSxArray(sx) as ComponentSxArrayItem[]

const normalizeValue = (value: unknown) => (value == null ? '' : String(value))

const subscribeToHydration = (onStoreChange: () => void) => {
  const animationFrame = window.requestAnimationFrame(onStoreChange)

  return () => {
    window.cancelAnimationFrame(animationFrame)
  }
}

const getHydratedSnapshot = () => true
const getServerHydratedSnapshot = () => false

const getOptionAriaLabel = (option: SelectOption) =>
  typeof option.label === 'string' ? option.label : String(option.value)

const optionTextSx = {
  fontSize: '0.6875rem',
  fontWeight: 400,
  lineHeight: 'normal',
  letterSpacing: '0.04em',
  color: '#111111',
} as const

const getSelectedContent = ({
  selectedValue,
  selectedOption,
  placeholder,
  renderSelectedValue,
}: {
  selectedValue: string
  selectedOption: SelectOption | undefined
  placeholder?: React.ReactNode
  renderSelectedValue?: Props['renderSelectedValue']
}) => {
  if (selectedValue === '' && placeholder != null) {
    return (
      <Box
        component="span"
        sx={{
          display: 'block',
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: '#A0A0A0',
        }}
      >
        {placeholder}
      </Box>
    )
  }

  if (renderSelectedValue) {
    return renderSelectedValue(selectedOption, selectedValue)
  }

  return selectedOption?.label ?? selectedValue
}

type SelectTriggerContentProps = {
  selectedContent: React.ReactNode
  iconSx?: AppSxProps
  open: boolean
}

const SelectTriggerContent = ({
  selectedContent,
  iconSx,
  open,
}: SelectTriggerContentProps) => (
  <>
    <Box component="span" className="MuiSelect-select" data-slot="value">
      {selectedContent}
    </Box>
    <Box
      component="span"
      className={[
        'MuiSelect-icon',
        open ? 'MuiSelect-iconOpen' : undefined,
      ]
        .filter(Boolean)
        .join(' ')}
      data-slot="icon"
      sx={[
        {
          position: 'absolute',
          right: '0.4rem',
          top: '50%',
          transform: open
            ? 'translateY(-50%) rotate(180deg)'
            : 'translateY(-50%)',
          width: '0.75rem',
          height: '0.375rem',
          color: 'currentColor',
          pointerEvents: 'none',
        },
        ...toComponentSxArray(iconSx),
      ]}
    >
      <ArrowDown
        sx={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </Box>
    <Box
      component="fieldset"
      className="MuiOutlinedInput-notchedOutline"
      aria-hidden="true"
    >
      <Box component="legend">
        <Box component="span" />
      </Box>
    </Box>
  </>
)

type DropDownSelectItemContentProps = {
  item: DropDownMenuEntry
  itemProps: React.HTMLAttributes<HTMLElement>
  highlighted: boolean
  selected: boolean
  highlightedValueRef: React.MutableRefObject<string | null>
  typographySx?: AppSxProps
  menuItemSx?: AppSxProps
}

const DropDownSelectItemContent = ({
  item,
  itemProps,
  highlighted,
  selected,
  highlightedValueRef,
  typographySx,
  menuItemSx,
}: DropDownSelectItemContentProps) => {
  React.useLayoutEffect(() => {
    if (highlighted) {
      highlightedValueRef.current = item.value
    }
  }, [highlighted, highlightedValueRef, item.value])

  return (
    <Box
      {...itemProps}
      data-slot="option"
      data-selected={selected ? '' : undefined}
      sx={[
        {
          m: 0,
          px: 1.5,
          py: 1,
          minHeight: '2rem',
          display: 'flex',
          alignItems: 'center',
          cursor: 'default',
          userSelect: 'none',
          outline: 0,
          '&[data-highlighted], &:hover, &:focus-visible': {
            backgroundColor: 'rgba(44, 142, 116, 0.08)',
          },
          '&[data-selected]': {
            fontWeight: 700,
          },
        },
        optionTextSx,
        ...toComponentSxArray(typographySx),
        ...toComponentSxArray(menuItemSx),
      ]}
    >
      {item.content}
    </Box>
  )
}

const DropDownSelect = ({
  value,
  options,
  onChange,
  label,
  ariaLabel,
  allowEmpty,
  placeholder,
  renderOption,
  renderSelectedValue,
  sx,
  selectSx,
  labelSx,
  iconSx,
  typographySx,
  menuPaperSx,
  menuItemSx,
  disabled,
  successIndicatorMode = 'hidden',
  open,
  defaultOpen,
  onOpenChange,
  autoFocus,
}: Props) => {
  const { t } = useTranslate('avoin-map')
  const generatedId = React.useId()
  const labelId = label ? `${generatedId}-label` : undefined
  const selectId = `${generatedId}-select`
  const isMounted = React.useSyncExternalStore(
    subscribeToHydration,
    getHydratedSnapshot,
    getServerHydratedSnapshot
  )
  const normalizedValue = normalizeValue(value)
  const [visualOpen, setVisualOpen] = React.useState(
    defaultOpen ?? false
  )
  const resolvedOpen = open ?? visualOpen
  const highlightedValueRef = React.useRef<string | null>(null)

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        highlightedValueRef.current = null
      }

      setVisualOpen(nextOpen)
      onOpenChange?.(nextOpen)
    },
    [onOpenChange]
  )

  const commitValue = React.useCallback(
    (nextValue: unknown, nativeEvent?: Event) => {
      onChange({
        target: { value: normalizeValue(nextValue) },
        nativeEvent,
      })
    },
    [onChange]
  )

  const commitHighlightedValue = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key !== 'Enter' || !resolvedOpen) {
        return
      }

      const highlightedValue = highlightedValueRef.current

      if (highlightedValue == null) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      commitValue(highlightedValue, event.nativeEvent)
      handleOpenChange(false)
    },
    [commitValue, handleOpenChange, resolvedOpen]
  )

  const selectedOption = options.find(
    (option) => option.value === normalizedValue
  )
  const hasValidSelection =
    !disabled && normalizedValue !== '' && selectedOption != null
  const useEmpty = allowEmpty || value == null || normalizedValue === ''
  const hasInvalidValue = normalizedValue !== '' && selectedOption == null

  const selectedContent = getSelectedContent({
    selectedValue: normalizedValue,
    selectedOption,
    placeholder,
    renderSelectedValue,
  })

  const menuEntries: DropDownMenuEntry[] = [
    ...(hasInvalidValue
      ? [
          {
            key: `invalid-${normalizedValue}`,
            value: normalizedValue,
            label: normalizedValue,
            ariaLabel: `Invalid value ${normalizedValue}`,
            content: (
              <i>
                {t('components.drop_down_select.invalid_value')}
                {` (${normalizedValue})`}
              </i>
            ),
          },
        ]
      : []),
    ...(useEmpty
      ? [
          {
            key: 'empty-selection',
            value: '',
            label: '',
            ariaLabel: 'Empty selection',
            content: (
              <i>
                {t('components.drop_down_select.empty_selection')}
              </i>
            ),
          },
        ]
      : []),
    ...options.map((option) => ({
      key: `option-${option.value}`,
      value: option.value,
      label: getOptionAriaLabel(option),
      ariaLabel: getOptionAriaLabel(option),
      content: renderOption ? renderOption(option) : option.label,
    })),
  ]

  return (
    <Box
      sx={[
        {
          position: 'relative',
          display: successIndicatorMode === 'outside' ? 'flex' : 'block',
          alignItems: 'center',
          gap: successIndicatorMode === 'outside' ? '0.5rem' : 0,
          maxWidth: '100%',
          borderRadius: '999px',
        },
        ...toComponentSxArray(sx),
      ]}
    >
      <Box
        sx={{
          width: '100%',
          minWidth: 0,
          flex: successIndicatorMode === 'outside' ? 1 : undefined,
          borderRadius: '999px',
          position: 'relative',
        }}
      >
        {label && (
          <Box
            id={labelId}
            component="span"
            sx={[
              {
                position: 'absolute',
                zIndex: 1,
                left: '0.875rem',
                top: normalizedValue || placeholder != null ? '-0.5rem' : 0,
                px: 0.5,
                backgroundColor: 'background.main',
                color: resolvedOpen ? 'secondary.dark' : '#111111',
                fontSize: '0.625rem',
                fontWeight: 400,
                letterSpacing: '0.0875rem',
                lineHeight: 'normal',
              },
              ...toComponentSxArray(labelSx),
            ]}
          >
            {label}
          </Box>
        )}
        {isMounted ? (
          <BaseSelect.Root<string>
            id={selectId}
            modal={false}
            value={normalizedValue}
            disabled={disabled}
            open={resolvedOpen}
            onOpenChange={handleOpenChange}
            onValueChange={(nextValue, eventDetails) => {
              commitValue(nextValue, eventDetails.event)
            }}
          >
            <BaseSelect.Trigger
              aria-label={ariaLabel ?? label}
              aria-labelledby={
                ariaLabel == null && labelId ? labelId : undefined
              }
              render={(triggerProps, triggerState) => (
                <Box
                  component="button"
                  {...triggerProps}
                  id={selectId}
                  autoFocus={autoFocus}
                  onKeyDown={(event) => {
                    triggerProps.onKeyDown?.(event)
                    commitHighlightedValue(event)
                  }}
                  className={[
                    triggerProps.className,
                    'MuiOutlinedInput-root',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  data-slot="trigger"
                  data-popup-open={triggerState.open ? '' : undefined}
                  sx={[
                    {
                      width: '100%',
                      minWidth: 0,
                      height: '2rem',
                      minHeight: '2rem',
                      m: 0,
                      p: 0,
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: 0,
                      borderRadius: '999px',
                      backgroundColor: '#FFFFFF',
                      color: '#111111',
                      boxShadow: 'inset 0px 0.5px 1px 0px #D9D9D9',
                      font: 'inherit',
                      textAlign: 'left',
                      cursor: disabled ? 'default' : 'pointer',
                      outline: 0,
                      '&:focus-visible .MuiOutlinedInput-notchedOutline, &[data-popup-open] .MuiOutlinedInput-notchedOutline':
                        {
                          borderColor: 'secondary.dark',
                        },
                      '&:disabled': {
                        color: '#8a8a8a',
                        cursor: 'default',
                      },
                      '.MuiOutlinedInput-notchedOutline': {
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        border: '1px solid #D6D6D6',
                        borderRadius: '999px',
                      },
                      '.MuiOutlinedInput-notchedOutline legend': {
                        maxWidth: 0,
                      },
                      '.MuiSelect-select': {
                        minHeight: '1.25rem',
                        minWidth: 0,
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        py: '0.1875rem',
                        pl: '1rem',
                        pr: '2.5rem',
                        backgroundColor: 'transparent',
                        fontSize: '0.6875rem',
                        fontWeight: 400,
                        lineHeight: 'normal',
                        letterSpacing: '0.04em',
                        color: '#111111',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      },
                    },
                    ...toComponentSxArray(selectSx),
                  ]}
                >
                  <SelectTriggerContent
                    selectedContent={selectedContent}
                    iconSx={iconSx}
                    open={triggerState.open}
                  />
                </Box>
              )}
            />

            <BaseSelect.Portal>
              <BaseSelect.Positioner
                align="start"
                side="bottom"
                sideOffset={4}
                alignItemWithTrigger={false}
                render={(positionerProps) => (
                  <Box
                    {...positionerProps}
                    sx={{
                      zIndex: (theme) => theme.zIndex.modal + 1,
                      minWidth: 'var(--anchor-width)',
                      maxWidth: 'min(24rem, calc(100vw - 2rem))',
                    }}
                  />
                )}
              >
                <BaseSelect.Popup
                  render={(popupProps) => (
                    <Box
                      {...popupProps}
                      data-slot="popup"
                      onKeyDown={(event) => {
                        popupProps.onKeyDown?.(event)
                        commitHighlightedValue(event)
                      }}
                      sx={[
                        {
                          maxHeight: 'min(18rem, calc(100vh - 2rem))',
                          overflowY: 'auto',
                          borderRadius: '10px',
                          border: '0.1px solid #A0A0A0',
                          backgroundColor: 'common.white',
                          boxShadow:
                            '0 1px 3px 0 rgba(214, 214, 214, 0.50) inset',
                        },
                        ...toComponentSxArray(menuPaperSx),
                      ]}
                    />
                  )}
                >
                  <BaseSelect.List>
                    {menuEntries.map((item) => (
                      <BaseSelect.Item
                        key={item.key}
                        value={item.value}
                        label={item.label}
                        aria-label={item.ariaLabel}
                        render={(itemProps, itemState) => (
                          <DropDownSelectItemContent
                            item={item}
                            itemProps={itemProps}
                            highlighted={itemState.highlighted}
                            selected={itemState.selected}
                            highlightedValueRef={highlightedValueRef}
                            typographySx={typographySx}
                            menuItemSx={menuItemSx}
                          />
                        )}
                      />
                    ))}
                  </BaseSelect.List>
                </BaseSelect.Popup>
              </BaseSelect.Positioner>
            </BaseSelect.Portal>
          </BaseSelect.Root>
        ) : (
          <Box
            component="div"
            id={selectId}
            role="combobox"
            aria-label={ariaLabel ?? label}
            aria-labelledby={ariaLabel == null && labelId ? labelId : undefined}
            aria-expanded={false}
            aria-disabled={disabled ? 'true' : undefined}
            className="MuiOutlinedInput-root"
            data-slot="trigger"
            sx={[
              {
                width: '100%',
                minWidth: 0,
                height: '2rem',
                minHeight: '2rem',
                m: 0,
                p: 0,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: 0,
                borderRadius: '999px',
                backgroundColor: '#FFFFFF',
                color: '#111111',
                boxShadow: 'inset 0px 0.5px 1px 0px #D9D9D9',
                font: 'inherit',
                textAlign: 'left',
                cursor: disabled ? 'default' : 'pointer',
                outline: 0,
                '&:focus-visible .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'secondary.dark',
                },
                '&:disabled': {
                  color: '#8a8a8a',
                  cursor: 'default',
                },
                '.MuiOutlinedInput-notchedOutline': {
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  border: '1px solid #D6D6D6',
                  borderRadius: '999px',
                },
                '.MuiOutlinedInput-notchedOutline legend': {
                  maxWidth: 0,
                },
                '.MuiSelect-select': {
                  minHeight: '1.25rem',
                  minWidth: 0,
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  py: '0.1875rem',
                  pl: '1rem',
                  pr: '2.5rem',
                  backgroundColor: 'transparent',
                  fontSize: '0.6875rem',
                  fontWeight: 400,
                  lineHeight: 'normal',
                  letterSpacing: '0.04em',
                  color: '#111111',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                },
              },
              ...toComponentSxArray(selectSx),
            ]}
          >
            <SelectTriggerContent
              selectedContent={selectedContent}
              iconSx={iconSx}
              open={resolvedOpen}
            />
          </Box>
        )}
      </Box>
      {hasValidSelection && successIndicatorMode === 'outside' && (
        <CheckcircleCheckedFilled
          sx={{
            width: 12,
            height: 12,
            color: '#2C8E74',
            flexShrink: 0,
          }}
        />
      )}
    </Box>
  )
}

export default DropDownSelect
