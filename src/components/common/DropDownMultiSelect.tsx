'use client'

import { Select as BaseSelect } from '@base-ui/react/select'
import React, { type ReactNode } from 'react'

import {
  Box,
  type AppSxProps,
  toSxArray,
} from '#/common/style/theme/system'
import ArrowDown from '#/components/icons/ArrowDown'

export type DropDownMultiSelectOption = {
  value: string
  label: ReactNode
  ariaLabel?: string
  leading?: ReactNode
  trailing?: ReactNode
}

export type DropDownMultiSelectChangeEvent = {
  target: {
    value: string[]
  }
  nativeEvent?: Event
}

export type DropDownMultiValueChangeEvent = DropDownMultiSelectChangeEvent

type ComponentSxArrayItem = Exclude<NonNullable<AppSxProps>, readonly unknown[]>

type Props = {
  value: string[]
  options: DropDownMultiSelectOption[]
  onChange: (event: DropDownMultiSelectChangeEvent) => void
  ariaLabel?: string
  placeholder?: ReactNode
  renderValue?: (
    selected: string[],
    selectedOptions: DropDownMultiSelectOption[]
  ) => ReactNode
  renderOptionContent?: (
    option: DropDownMultiSelectOption,
    selected: boolean
  ) => ReactNode
  sx?: AppSxProps
  selectSx?: AppSxProps
  menuPaperSx?: AppSxProps
  menuItemSx?: AppSxProps
  checkboxSx?: AppSxProps
  iconSx?: AppSxProps
  disabled?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

const toComponentSxArray = (sx?: AppSxProps) =>
  toSxArray(sx) as ComponentSxArrayItem[]

const getOptionLabel = (option: DropDownMultiSelectOption) =>
  typeof option.label === 'string' ? option.label : option.value

const getSelectedContent = ({
  value,
  selectedOptions,
  placeholder,
  renderValue,
}: {
  value: string[]
  selectedOptions: DropDownMultiSelectOption[]
  placeholder?: ReactNode
  renderValue?: Props['renderValue']
}) => {
  if (renderValue) {
    return renderValue(value, selectedOptions)
  }

  if (selectedOptions.length === 0) {
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

  return (
    <Box
      component="span"
      sx={{
        display: 'block',
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontSize: '0.6875rem',
        fontWeight: 400,
        lineHeight: 'normal',
        letterSpacing: '0.04em',
        color: '#111111',
      }}
    >
      {selectedOptions.map(getOptionLabel).join(', ')}
    </Box>
  )
}

const DropDownMultiSelect = ({
  value,
  options,
  onChange,
  ariaLabel,
  placeholder,
  renderValue,
  renderOptionContent,
  sx,
  selectSx,
  menuPaperSx,
  menuItemSx,
  checkboxSx,
  iconSx,
  disabled,
  open,
  defaultOpen,
  onOpenChange,
}: Props) => {
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

      onOpenChange?.(nextOpen)
    },
    [openIsControlled, onOpenChange]
  )

  const selectedOptions = options.filter((option) =>
    value.includes(option.value)
  )

  const selectedContent = getSelectedContent({
    value,
    selectedOptions,
    placeholder,
    renderValue,
  })

  return (
    <Box
      sx={[
        {
          width: '100%',
          minWidth: 0,
          position: 'relative',
          borderRadius: '999px',
        },
        ...toComponentSxArray(sx),
      ]}
    >
      <BaseSelect.Root<string, true>
        multiple
        modal={false}
        value={value}
        disabled={disabled}
        open={resolvedOpen}
        onOpenChange={(nextOpen) => {
          setResolvedOpen(nextOpen)
        }}
        onValueChange={(nextValue, eventDetails) => {
          onChange({
            target: { value: Array.isArray(nextValue) ? nextValue : [] },
            nativeEvent: eventDetails.event,
          })
        }}
      >
        <BaseSelect.Trigger
          aria-label={ariaLabel}
          render={(triggerProps, triggerState) => (
            <Box
              component="button"
              {...triggerProps}
              onMouseDown={(event: React.MouseEvent<HTMLElement>) => {
                ;(
                  triggerProps.onMouseDown as
                    | React.MouseEventHandler<HTMLElement>
                    | undefined
                )?.(event)

                if (!disabled && !resolvedOpen) {
                  setResolvedOpen(true)
                }
              }}
              onClick={(event: React.MouseEvent<HTMLElement>) => {
                ;(
                  triggerProps.onClick as
                    | React.MouseEventHandler<HTMLElement>
                    | undefined
                )?.(event)

                if (!disabled && !resolvedOpen) {
                  setResolvedOpen(true)
                }
              }}
              data-slot="trigger"
              data-popup-open={triggerState.open ? '' : undefined}
              sx={[
                {
                  width: '100%',
                  minWidth: 0,
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
                  '&:focus-visible .AvoinMultiSelect-outline, &[data-popup-open] .AvoinMultiSelect-outline':
                    {
                      borderColor: 'secondary.dark',
                    },
                  '&:disabled': {
                    color: '#8a8a8a',
                    cursor: 'default',
                  },
                  '.AvoinMultiSelect-outline': {
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    border: '1px solid #D6D6D6',
                    borderRadius: '999px',
                  },
                  '.AvoinMultiSelect-outline legend': {
                    maxWidth: 0,
                  },
                  '[data-slot="value"]': {
                    minWidth: 0,
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    py: '0.375rem',
                    pl: '1rem',
                    pr: '2.5rem',
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
              <Box component="span" data-slot="value">
                {selectedContent}
              </Box>
              <BaseSelect.Icon
                render={(iconProps, iconState) => (
                  <Box
                    component="span"
                    {...iconProps}
                    data-slot="icon"
                    sx={[
                      {
                        position: 'absolute',
                        right: '0.4rem',
                        top: '50%',
                        transform: iconState.open
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
                )}
              />
              <Box
                component="fieldset"
                className="AvoinMultiSelect-outline"
                aria-hidden="true"
              >
                <Box component="legend">
                  <Box component="span" />
                </Box>
              </Box>
            </Box>
          )}
        />

        <BaseSelect.Positioner
          align="start"
          sideOffset={4}
          alignItemWithTrigger={false}
          render={(positionerProps) => {
            const { style, ...restPositionerProps } = positionerProps

            return (
              <Box
                {...restPositionerProps}
                style={{
                  ...style,
                  position: 'absolute',
                  left: 0,
                  top: 'calc(100% + 0.25rem)',
                }}
                sx={{
                  zIndex: (theme) => theme.zIndex.modal + 1,
                  width: 'var(--anchor-width)',
                  maxWidth: 'min(24rem, calc(100vw - 2rem))',
                }}
              />
            )}
          }
        >
          <BaseSelect.Popup
            render={(popupProps) => (
              <Box
                {...popupProps}
                data-slot="popup"
                sx={[
                  {
                    maxHeight: 'min(18rem, calc(100vh - 2rem))',
                    overflowY: 'auto',
                    borderRadius: '0.625rem',
                    border: '0.5px solid #D6D6D6',
                    backgroundColor: 'common.white',
                    boxShadow: '0px 8px 24px rgba(17, 17, 17, 0.12)',
                  },
                  ...toComponentSxArray(menuPaperSx),
                ]}
              />
            )}
          >
            <BaseSelect.List>
              {options.map((option) => {
                const fallbackLabel = getOptionLabel(option)
                const ariaOptionLabel = option.ariaLabel ?? fallbackLabel

                return (
                  <BaseSelect.Item
                    key={option.value}
                    value={option.value}
                    label={fallbackLabel}
                    aria-label={ariaOptionLabel}
                    render={(itemProps, itemState) => (
                      <Box
                        {...itemProps}
                        data-slot="option"
                        data-selected={itemState.selected ? '' : undefined}
                        sx={[
                          {
                            m: 0,
                            px: 1.5,
                            py: 1,
                            minHeight: '2rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            cursor: 'default',
                            userSelect: 'none',
                            outline: 0,
                            '&[data-highlighted], &:hover, &:focus-visible': {
                              backgroundColor: 'rgba(44, 142, 116, 0.08)',
                            },
                          },
                          ...toComponentSxArray(menuItemSx),
                        ]}
                      >
                        {renderOptionContent ? (
                          renderOptionContent(option, itemState.selected)
                        ) : (
                          <>
                            <BaseSelect.ItemIndicator
                              keepMounted
                              render={(indicatorProps, indicatorState) => {
                                const indicatorRootProps = {
                                  ...indicatorProps,
                                  children: undefined,
                                }

                                return (
                                  <Box
                                    component="span"
                                    {...indicatorRootProps}
                                    aria-hidden="true"
                                    data-selected={
                                      indicatorState.selected ? '' : undefined
                                    }
                                    sx={[
                                      {
                                        width: '1rem',
                                        height: '1rem',
                                        mr: '0.25rem',
                                        flex: '0 0 auto',
                                        position: 'relative',
                                        border: '1px solid #A0A0A0',
                                        borderRadius: '0.125rem',
                                        backgroundColor: '#FFFFFF',
                                        '&[data-selected]': {
                                          borderColor: 'secondary.dark',
                                          backgroundColor: 'secondary.dark',
                                        },
                                        '&[data-selected]::after': {
                                          content: '""',
                                          position: 'absolute',
                                          left: '0.29rem',
                                          top: '0.12rem',
                                          width: '0.3rem',
                                          height: '0.55rem',
                                          border: 'solid #FFFFFF',
                                          borderWidth:
                                            '0 0.125rem 0.125rem 0',
                                          transform: 'rotate(45deg)',
                                        },
                                      },
                                      ...toComponentSxArray(checkboxSx),
                                    ]}
                                  />
                                )
                              }}
                            />

                            {option.leading}

                            <Box
                              component="span"
                              sx={{
                                flex: 1,
                                minWidth: 0,
                                fontSize: '0.6875rem',
                                lineHeight: '1rem',
                                letterSpacing: '0.04em',
                                color: '#111111',
                              }}
                            >
                              {option.label}
                            </Box>

                            {option.trailing}
                          </>
                        )}
                      </Box>
                    )}
                  />
                )
              })}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Root>
    </Box>
  )
}

export default DropDownMultiSelect
