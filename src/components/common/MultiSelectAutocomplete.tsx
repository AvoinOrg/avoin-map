'use client'

import { Combobox as BaseCombobox } from '@base-ui/react/combobox'
import * as React from 'react'
import { useTranslate } from '@tolgee/react'

import {
  Box,
  type AppSxProps,
  toSxArray,
} from '#/common/style/theme/system'
import { SelectOption } from '#/common/types/general'
import { Cross } from '#/components/icons'

type MultiSelectAutocompleteChangeEvent =
  React.SyntheticEvent<Element, Event>

type ComponentSxArrayItem = Exclude<NonNullable<AppSxProps>, readonly unknown[]>

const toComponentSxArray = (sx?: AppSxProps) =>
  toSxArray(sx) as ComponentSxArrayItem[]

const autoHighlightOnOpen = 'always' as unknown as boolean

interface Props {
  value: SelectOption[]
  options: SelectOption[]
  onChange: (
    event: MultiSelectAutocompleteChangeEvent,
    newValue: SelectOption[]
  ) => void
  placeholder?: string
  ariaLabel?: string
  sx?: AppSxProps
  textFieldSx?: AppSxProps
  optionSx?: AppSxProps
  chipSx?: AppSxProps
  disabled?: boolean
  open?: boolean
  defaultOpen?: boolean
  defaultInputValue?: string
}

const isOptionEqual = (option: SelectOption, selected: SelectOption) =>
  option.value === selected.value

const filterOption = (
  option: SelectOption,
  query: string,
  itemToString?: (option: SelectOption) => string
) => {
  const label = itemToString?.(option) ?? option.label

  return label.toLocaleLowerCase().includes(query.toLocaleLowerCase().trim())
}

const getNextToggledValue = (
  currentValue: SelectOption[],
  option: SelectOption
) => {
  const selected = currentValue.some((selectedOption) =>
    isOptionEqual(option, selectedOption)
  )

  if (selected) {
    return currentValue.filter(
      (selectedOption) => !isOptionEqual(option, selectedOption)
    )
  }

  return [...currentValue, option]
}

const MultiSelectAutocomplete = ({
  value,
  options,
  onChange,
  placeholder,
  ariaLabel,
  sx,
  textFieldSx,
  optionSx,
  chipSx,
  disabled,
  open,
  defaultOpen,
  defaultInputValue,
}: Props) => {
  const { t } = useTranslate('avoin-map')
  const rootRef = React.useRef<HTMLElement | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const highlightedOptionRef = React.useRef<SelectOption | undefined>(undefined)
  const lastValueChangeEventRef = React.useRef<Event | undefined>(undefined)
  const [inputValue, setInputValue] = React.useState(defaultInputValue ?? '')
  const openIsControlled = open !== undefined
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    defaultOpen ?? false
  )
  const resolvedOpen = openIsControlled ? open : uncontrolledOpen

  const setResolvedOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (!openIsControlled) {
        setUncontrolledOpen(nextOpen)
      }
    },
    [openIsControlled]
  )

  return (
    <Box
      ref={rootRef}
      sx={[
        {
          width: '100%',
          minWidth: 0,
          position: 'relative',
          border: 'none',
        },
        ...toComponentSxArray(sx),
      ]}
    >
      <BaseCombobox.Root<SelectOption, true>
        multiple
        modal={false}
        items={options}
        value={value}
        disabled={disabled}
        open={resolvedOpen}
        autoHighlight={autoHighlightOnOpen}
        inputValue={inputValue}
        itemToStringLabel={(option) => option.label}
        itemToStringValue={(option) => option.value}
        isItemEqualToValue={isOptionEqual}
        filter={filterOption}
        onOpenChange={setResolvedOpen}
        onInputValueChange={(nextInputValue) => {
          setInputValue(nextInputValue)

          if (!disabled) {
            setResolvedOpen(true)
          }
        }}
        onItemHighlighted={(highlightedOption) => {
          highlightedOptionRef.current = highlightedOption
        }}
        onValueChange={(nextValue, eventDetails) => {
          lastValueChangeEventRef.current = eventDetails.event

          onChange(
            eventDetails.event as unknown as MultiSelectAutocompleteChangeEvent,
            Array.isArray(nextValue) ? nextValue : []
          )
        }}
      >
        <Box
          data-slot="field"
          onMouseDown={() => {
            if (!disabled) {
              setResolvedOpen(true)
            }

            inputRef.current?.focus()
          }}
          onClick={() => {
            if (!disabled) {
              setResolvedOpen(true)
            }
          }}
          sx={[
            {
              width: '100%',
              minWidth: 0,
              minHeight: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.25rem',
              px: '0.5rem',
              py: '0.375rem',
              border: '1px solid',
              borderColor: 'neutral.main',
              borderRadius: '2px',
              backgroundColor: 'neutral.lighter',
              cursor: disabled ? 'default' : 'text',
              '&:focus-within, &:has([data-popup-open])': {
                borderColor: 'secondary.dark',
              },
            },
            ...toComponentSxArray(textFieldSx),
          ]}
        >
          <BaseCombobox.Chips
            render={(chipsProps) => (
              <Box
                {...chipsProps}
                data-slot="chips"
                sx={{
                  minWidth: 0,
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.25rem',
                }}
              />
            )}
          >
            {value.map((option) => (
              <BaseCombobox.Chip
                key={option.value}
                render={(chipProps) => (
                  <Box
                    {...chipProps}
                    data-slot="chip"
                    sx={[
                      {
                        minWidth: 0,
                        maxWidth: '100%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        px: '0.5rem',
                        py: '0.25rem',
                        borderRadius: 0,
                        typography: 'h5',
                        backgroundColor: 'primary.light',
                        color: '#111111',
                      },
                      ...toComponentSxArray(chipSx),
                    ]}
                  >
                    <Box
                      component="span"
                      sx={{
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {option.label}
                    </Box>
                    <BaseCombobox.ChipRemove
                      aria-label={`Remove ${option.label}`}
                      render={(removeProps) => (
                        <Box
                          component="button"
                          {...removeProps}
                          data-slot="chip-remove"
                          sx={{
                            width: '1.25rem',
                            height: '1.25rem',
                            minWidth: '1.25rem',
                            minHeight: '1.25rem',
                            m: 0,
                            p: 0,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 0,
                            backgroundColor: 'transparent',
                            color: 'inherit',
                            cursor: disabled ? 'default' : 'pointer',
                          }}
                        >
                          <Cross
                            sx={{
                              width: '0.75rem',
                              height: '0.75rem',
                              display: 'block',
                            }}
                          />
                        </Box>
                      )}
                    />
                  </Box>
                )}
              />
            ))}

            <BaseCombobox.Input
              ref={inputRef}
              aria-label={ariaLabel ?? placeholder ?? 'Multi-select input'}
              placeholder={value.length === 0 ? placeholder : undefined}
              render={(inputProps) => (
                <Box
                  component="input"
                  {...inputProps}
                  role={inputProps.role ?? 'combobox'}
                  aria-expanded={
                    inputProps['aria-expanded'] ??
                    (resolvedOpen ? 'true' : 'false')
                  }
                  aria-haspopup={inputProps['aria-haspopup'] ?? 'listbox'}
                  onFocus={(event: React.FocusEvent<HTMLInputElement>) => {
                    ;(
                      inputProps.onFocus as
                        | React.FocusEventHandler<HTMLInputElement>
                        | undefined
                    )?.(event)

                    if (!disabled) {
                      setResolvedOpen(true)
                    }
                  }}
                  onMouseDown={(
                    event: React.MouseEvent<HTMLInputElement>
                  ) => {
                    ;(
                      inputProps.onMouseDown as
                        | React.MouseEventHandler<HTMLInputElement>
                        | undefined
                    )?.(event)

                    if (!disabled) {
                      setResolvedOpen(true)
                    }
                  }}
                  onClick={(event: React.MouseEvent<HTMLInputElement>) => {
                    ;(
                      inputProps.onClick as
                        | React.MouseEventHandler<HTMLInputElement>
                        | undefined
                    )?.(event)

                    if (!disabled) {
                      setResolvedOpen(true)
                    }
                  }}
                  onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                    const nativeEvent = event.nativeEvent

                    ;(
                      inputProps.onKeyDown as
                        | React.KeyboardEventHandler<HTMLInputElement>
                        | undefined
                    )?.(event)

                    const highlightedOption = highlightedOptionRef.current

                    if (
                      disabled ||
                      event.key !== 'Enter' ||
                      !resolvedOpen ||
                      !highlightedOption ||
                      lastValueChangeEventRef.current === nativeEvent
                    ) {
                      return
                    }

                    event.preventDefault()
                    onChange(
                      event as unknown as MultiSelectAutocompleteChangeEvent,
                      getNextToggledValue(value, highlightedOption)
                    )
                  }}
                  data-slot="input"
                  sx={{
                    minWidth: '7rem',
                    flex: 1,
                    border: 0,
                    outline: 0,
                    backgroundColor: 'transparent',
                    typography: 'h8',
                    color: '#111111',
                    font: 'inherit',
                    '&::placeholder': {
                      typography: 'h8',
                      color: 'neutral.darker',
                      opacity: 1,
                    },
                    '&:disabled': {
                      color: '#8a8a8a',
                    },
                  }}
                />
              )}
            />
          </BaseCombobox.Chips>
        </Box>

        <BaseCombobox.Portal keepMounted>
          <BaseCombobox.Positioner
            anchor={rootRef}
            align="start"
            sideOffset={4}
            render={(positionerProps) => (
              <Box
                {...positionerProps}
                data-slot="positioner"
                sx={{
                  zIndex: (theme) => theme.zIndex.modal + 1,
                  width: 'var(--anchor-width)',
                  maxWidth: 'min(28rem, calc(100vw - 2rem))',
                }}
              />
            )}
          >
            <BaseCombobox.Popup
              render={(popupProps) => (
                <Box
                  {...popupProps}
                  data-slot="popup"
                  sx={{
                    maxHeight: 'min(18rem, calc(100vh - 2rem))',
                    overflowY: 'auto',
                    border: '1px solid #D6D6D6',
                    borderRadius: '0.25rem',
                    backgroundColor: 'common.white',
                    boxShadow: '0px 8px 24px rgba(17, 17, 17, 0.12)',
                  }}
                />
              )}
            >
              <BaseCombobox.List>
                {(option: SelectOption, index: number) => (
                  <BaseCombobox.Item
                    key={option.value}
                    value={option}
                    index={index}
                    render={(itemProps, itemState) => (
                      <Box
                        {...itemProps}
                        data-slot="option"
                        data-selected={itemState.selected ? '' : undefined}
                        sx={[
                          {
                            px: 1.5,
                            py: 1,
                            typography: 'h8',
                            overflowWrap: 'anywhere',
                            maxWidth: '100%',
                            cursor: disabled ? 'default' : 'pointer',
                            outline: 0,
                            '&[data-highlighted], &:hover, &:focus-visible': {
                              backgroundColor: 'primary.light',
                            },
                            '&[data-selected]': {
                              fontWeight: 700,
                            },
                          },
                          ...toComponentSxArray(optionSx),
                        ]}
                      >
                        {option.label}
                      </Box>
                    )}
                  />
                )}
              </BaseCombobox.List>

              <BaseCombobox.Empty
                render={(emptyProps) => (
                  <Box
                    {...emptyProps}
                    data-slot="empty"
                    sx={{
                      px: 1.5,
                      py: 1,
                      typography: 'h7',
                      color: '#111111',
                    }}
                  />
                )}
              >
                {t('components.autocomplete.no_results')}
              </BaseCombobox.Empty>
            </BaseCombobox.Popup>
          </BaseCombobox.Positioner>
        </BaseCombobox.Portal>
      </BaseCombobox.Root>
    </Box>
  )
}

export default MultiSelectAutocomplete
