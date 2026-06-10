import React, { type ReactNode } from 'react'
import { Select as BaseSelect } from '@base-ui/react/select'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import ArrowDown from '#/components/icons/ArrowDown'
import CheckboxIcon from '#/components/icons/Checkbox'
import CheckboxCheckedIcon from '#/components/icons/CheckboxChecked'
import {
  createSelectionEvent,
  type FormSelectionEvent,
} from './formControlEvents'
import {
  sharedFloatingPositionerClass,
  sharedSelectItemClass,
  sharedSelectPopupStyle,
  sharedSelectTriggerFocusStyle,
} from './formControlStyles'

export type DropDownMultiSelectOption = {
  value: string
  label: ReactNode
  ariaLabel?: string
  leading?: ReactNode
  trailing?: ReactNode
}

type Props = {
  value: string[]
  options: DropDownMultiSelectOption[]
  onChange: (event: FormSelectionEvent<string[]>) => void
  ariaLabel?: string
  name?: string
  placeholder?: ReactNode
  renderValue?: (
    selected: string[],
    selectedOptions: DropDownMultiSelectOption[]
  ) => ReactNode
  renderOptionContent?: (
    option: DropDownMultiSelectOption,
    selected: boolean
  ) => ReactNode
  styleProps?: PandaStyleProp
  selectSx?: PandaStyleProp
  menuPaperSx?: PandaStyleProp
  menuItemSx?: PandaStyleProp
  checkboxSx?: PandaStyleProp
  iconSx?: PandaStyleProp
  disabled?: boolean
}

const wrapperClass = css({
  width: '100%',
  minWidth: 0,
  borderRadius: '999px',
})

const triggerClass = css({
  boxSizing: 'border-box',
  width: '100%',
  minWidth: 0,
  minHeight: '2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.5rem',
  borderRadius: '999px',
  border: '0.5px solid #D6D6D6',
  backgroundColor: '#FFFFFF',
  boxShadow: 'inset 0px 0.5px 1px 0px #D9D9D9',
  color: '#111111',
  py: '0.375rem',
  pl: '1rem',
  pr: '0.875rem',
  cursor: 'pointer',
  ...sharedSelectTriggerFocusStyle,
  '&[data-disabled]': {
    cursor: 'not-allowed',
    color: 'text.disabled',
    opacity: 0.7,
  },
})

const valueClass = css({
  display: 'block',
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.6875rem',
  fontWeight: 400,
  lineHeight: 'normal',
  letterSpacing: '0.04em',
  color: '#111111',
})

const placeholderClass = css({
  display: 'block',
  color: '#A0A0A0',
})

const iconClass = css({
  width: '0.75rem',
  height: '0.375rem',
  flexShrink: 0,
  color: 'currentColor',
  transition: 'transform 150ms ease',
  '[data-open] &': {
    transform: 'rotate(180deg)',
  },
})

const popupClass = css(sharedSelectPopupStyle, {
  mt: 0.5,
})

const itemContentClass = css({
  display: 'flex',
  alignItems: 'center',
  gap: '0.375rem',
  width: '100%',
  minWidth: 0,
})

const defaultLabelClass = css({
  flex: 1,
  minWidth: 0,
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.6875rem',
  lineHeight: '1rem',
  letterSpacing: '0.04em',
  color: '#111111',
})

const DropDownMultiSelect = ({
  value,
  options,
  onChange,
  ariaLabel,
  name,
  placeholder,
  renderValue,
  renderOptionContent,
  styleProps,
  selectSx,
  menuPaperSx,
  menuItemSx,
  checkboxSx,
  iconSx,
  disabled,
}: Props) => {
  const selectedOptions = options.filter((option) => value.includes(option.value))

  const handleValueChange = React.useCallback(
    (nextValue: string[] | null, eventDetails: { event?: Event }) => {
      onChange(
        createSelectionEvent({
          value: nextValue ?? [],
          name,
          eventDetails,
        })
      )
    },
    [name, onChange]
  )

  const renderSelectedSummary = () => {
    if (renderValue) {
      return renderValue(value, selectedOptions)
    }

    if (selectedOptions.length === 0) {
      return <span className={placeholderClass}>{placeholder}</span>
    }

    return selectedOptions
      .map((option) =>
        typeof option.label === 'string' ? option.label : option.value
      )
      .join(', ')
  }

  return (
    <div
      className={cx(wrapperClass, css(...pandaStylePropsToArray(styleProps)))}
      style={mergePandaStyleProps({ styleProps })}
    >
      <BaseSelect.Root
        multiple
        value={value}
        name={name}
        disabled={disabled}
        onValueChange={handleValueChange}
      >
        <BaseSelect.Trigger
          aria-label={ariaLabel}
          className={cx(triggerClass, css(...pandaStylePropsToArray(selectSx)))}
          style={mergePandaStyleProps({ styleProps: selectSx })}
        >
          <span className={valueClass}>{renderSelectedSummary()}</span>
          <BaseSelect.Icon
            className={cx(iconClass, css(...pandaStylePropsToArray(iconSx)))}
            style={mergePandaStyleProps({ styleProps: iconSx })}
            aria-hidden="true"
          >
            <ArrowDown />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
        <BaseSelect.Portal>
          <BaseSelect.Positioner
            sideOffset={4}
            align="start"
            alignItemWithTrigger={false}
            className={sharedFloatingPositionerClass}
          >
            <BaseSelect.Popup
              className={cx(
                popupClass,
                css(...pandaStylePropsToArray(menuPaperSx))
              )}
              style={mergePandaStyleProps({ styleProps: menuPaperSx })}
            >
              <BaseSelect.List>
                {options.map((option) => {
                  const isSelected = value.includes(option.value)

                  return (
                    <BaseSelect.Item
                      key={option.value}
                      value={option.value}
                      aria-label={
                        option.ariaLabel ??
                        (typeof option.label === 'string'
                          ? option.label
                          : String(option.value))
                      }
                      className={cx(
                        sharedSelectItemClass,
                        css(...pandaStylePropsToArray(menuItemSx))
                      )}
                      style={mergePandaStyleProps({ styleProps: menuItemSx })}
                    >
                      {renderOptionContent ? (
                        renderOptionContent(option, isSelected)
                      ) : (
                        <span className={itemContentClass}>
                          <span
                            className={css(...pandaStylePropsToArray(checkboxSx))}
                            style={mergePandaStyleProps({ styleProps: checkboxSx })}
                            aria-hidden="true"
                          >
                            {isSelected ? (
                              <CheckboxCheckedIcon
                                styleProps={{ width: '1rem', height: '1rem' }}
                              />
                            ) : (
                              <CheckboxIcon styleProps={{ width: '1rem', height: '1rem' }} />
                            )}
                          </span>
                          {option.leading}
                          <span className={defaultLabelClass}>
                            {option.label}
                          </span>
                          {option.trailing}
                        </span>
                      )}
                    </BaseSelect.Item>
                  )
                })}
              </BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
    </div>
  )
}

export default DropDownMultiSelect
