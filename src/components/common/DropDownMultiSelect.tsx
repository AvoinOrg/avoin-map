import { Select as BaseSelect } from '@base-ui/react/select'
import React, { type ReactNode } from 'react'

import {
  Box,
  type AppSxProps,
  toSxArray,
} from '#/common/style/theme/system'
import { SHARED_CONTROL_INFINITE_BORDER_RADIUS } from '#/common/style/theme/constants'
import {
  DROP_DOWN_SELECT_ICON_SX,
  DROP_DOWN_SELECT_LIST_SX,
  DROP_DOWN_SELECT_POPUP_SX,
  DROP_DOWN_SELECT_POSITIONER_SX,
  DROP_DOWN_SELECT_TRIGGER_SX,
} from '#/components/common/DropDownSelect'
import ArrowDown from '#/components/icons/ArrowDown'
import Checkbox from '#/components/icons/Checkbox'
import CheckboxChecked from '#/components/icons/CheckboxChecked'

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
          borderRadius: SHARED_CONTROL_INFINITE_BORDER_RADIUS,
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
              className={[triggerProps.className, 'MuiOutlinedInput-root']
                .filter(Boolean)
                .join(' ')}
              data-slot="trigger"
              data-popup-open={triggerState.open ? '' : undefined}
              sx={[
                DROP_DOWN_SELECT_TRIGGER_SX,
                {
                  cursor: disabled ? 'default' : 'pointer',
                },
                ...toComponentSxArray(selectSx),
              ]}
            >
              <Box
                component="span"
                className="MuiSelect-select"
                data-slot="value"
              >
                {selectedContent}
              </Box>
              <BaseSelect.Icon
                render={(iconProps, iconState) => (
                  <Box
                    component="span"
                    {...iconProps}
                    className={[
                      iconProps.className,
                      'MuiSelect-icon',
                      iconState.open ? 'MuiSelect-iconOpen' : undefined,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    data-slot="icon"
                    sx={[
                      DROP_DOWN_SELECT_ICON_SX,
                      {
                        transform: iconState.open
                          ? 'translateY(-50%) rotate(180deg)'
                          : 'translateY(-50%)',
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
                component="span"
                className="MuiOutlinedInput-notchedOutline"
                aria-hidden="true"
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
              <Box {...positionerProps} sx={DROP_DOWN_SELECT_POSITIONER_SX} />
            )}
          >
            <BaseSelect.Popup
              render={(popupProps) => (
                <Box
                  {...popupProps}
                  data-slot="popup"
                  sx={[
                    DROP_DOWN_SELECT_POPUP_SX,
                    ...toComponentSxArray(menuPaperSx),
                  ]}
                />
              )}
            >
              <BaseSelect.List
                render={(listProps) => (
                  <Box
                    {...listProps}
                    data-slot="list"
                    sx={DROP_DOWN_SELECT_LIST_SX}
                  />
                )}
              >
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
                              '&[data-highlighted], &:hover, &:focus-visible':
                                {
                                  backgroundColor:
                                    'rgba(44, 142, 116, 0.08)',
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
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          borderRadius: '0.125rem',
                                          lineHeight: 0,
                                          overflow: 'hidden',
                                          color: '#A0A0A0',
                                          backgroundColor: '#FFFFFF',
                                          '&[data-selected]': {
                                            color: '#FFFFFF',
                                            backgroundColor: 'secondary.dark',
                                          },
                                        },
                                        ...toComponentSxArray(checkboxSx),
                                      ]}
                                    >
                                      {indicatorState.selected ? (
                                        <CheckboxChecked
                                          sx={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'block',
                                          }}
                                        />
                                      ) : (
                                        <Checkbox
                                          sx={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'block',
                                          }}
                                        />
                                      )}
                                    </Box>
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
        </BaseSelect.Portal>
      </BaseSelect.Root>
    </Box>
  )
}

export default DropDownMultiSelect
