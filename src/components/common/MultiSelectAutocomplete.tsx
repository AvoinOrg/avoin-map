import * as React from 'react'
import { Combobox as BaseCombobox } from '@base-ui/react/combobox'
import { useTranslate } from '@tolgee/react'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import { SelectOption } from '#/common/types/general'
import { Cross } from '#/components/icons'
import {
  sharedFloatingPositionerClass,
  sharedSelectItemClass,
  sharedSelectPopupStyle,
} from './formControlStyles'

interface Props {
  value: SelectOption[]
  options: SelectOption[]
  onChange: (
    event: React.SyntheticEvent<Element, Event>,
    newValue: SelectOption[]
  ) => void
  placeholder?: string
  ariaLabel?: string
  styleProps?: PandaStyleProp
  textFieldSx?: PandaStyleProp
  optionSx?: PandaStyleProp
  chipSx?: PandaStyleProp
  disabled?: boolean
}

const rootClass = css({
  width: '100%',
  minWidth: 0,
})

const inputShellClass = css({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '0.25rem',
  minHeight: '2.5rem',
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid',
  borderColor: 'neutral.main',
  borderRadius: '2px',
  backgroundColor: 'neutral.lighter',
  px: '0.5rem',
  py: '0.25rem',
  cursor: 'text',
  '&:focus-within': {
    borderColor: 'secondary.dark',
  },
})

const chipsClass = css({
  display: 'contents',
})

const chipClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  minWidth: 0,
  borderRadius: 0,
  backgroundColor: 'primary.light',
  color: '#111111',
  fontFamily: 'var(--font-arimo)',
  fontSize: '1rem',
  fontWeight: 400,
  lineHeight: 'normal',
  letterSpacing: '0.1rem',
  px: '0.5rem',
  py: '0.25rem',
})

const chipTextClass = css({
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

const chipRemoveClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.25rem',
  height: '1.25rem',
  p: 0,
  border: 0,
  backgroundColor: 'transparent',
  color: 'inherit',
  cursor: 'pointer',
  lineHeight: 0,
  '&[data-disabled]': {
    cursor: 'not-allowed',
    opacity: 0.5,
  },
})

const inputClass = css({
  flex: '1 1 8rem',
  minWidth: '6rem',
  border: 0,
  outline: 'none',
  backgroundColor: 'transparent',
  color: 'neutral.darker',
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.875rem',
  fontWeight: 400,
  lineHeight: 'normal',
  letterSpacing: '0.0875rem',
  p: '0.25rem',
  '&::placeholder': {
    color: '#8E8E8E',
    opacity: 1,
  },
  '&:disabled': {
    cursor: 'not-allowed',
  },
})

const popupClass = css(sharedSelectPopupStyle, {
  zIndex: 'modal',
})

const emptyClass = css({
  px: '0.75rem',
  py: '0.5rem',
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.875rem',
  fontWeight: 700,
  lineHeight: '1.625rem',
  letterSpacing: '0.0875rem',
  color: '#111111',
})

const MultiSelectAutocomplete = ({
  value,
  options,
  onChange,
  placeholder,
  ariaLabel,
  styleProps,
  textFieldSx,
  optionSx,
  chipSx,
  disabled,
}: Props) => {
  const { t } = useTranslate('avoin-map')

  const handleValueChange = React.useCallback(
    (newValue: SelectOption[], eventDetails: { event?: Event }) => {
      const event =
        eventDetails.event ?? new Event('change', { bubbles: true })
      onChange(event as unknown as React.SyntheticEvent<Element, Event>, newValue)
    },
    [onChange]
  )

  return (
    <div
      className={cx(rootClass, css(...pandaStylePropsToArray(styleProps)))}
      style={mergePandaStyleProps({ styleProps })}
    >
      <BaseCombobox.Root
        multiple
        items={options}
        value={value}
        disabled={disabled}
        itemToStringLabel={(option) => option.label}
        itemToStringValue={(option) => option.value}
        isItemEqualToValue={(option, selectedValue) =>
          option.value === selectedValue.value
        }
        onValueChange={handleValueChange}
      >
        <div
          className={cx(
            inputShellClass,
            css(...pandaStylePropsToArray(textFieldSx))
          )}
          style={mergePandaStyleProps({ styleProps: textFieldSx })}
        >
          <BaseCombobox.Chips className={chipsClass}>
            {value.map((option) => (
              <BaseCombobox.Chip
                key={option.value}
                className={cx(
                  chipClass,
                  css(...pandaStylePropsToArray(chipSx))
                )}
                style={mergePandaStyleProps({ styleProps: chipSx })}
              >
                <span className={chipTextClass}>{option.label}</span>
                <BaseCombobox.ChipRemove
                  aria-label={`Remove ${option.label}`}
                  className={chipRemoveClass}
                >
                  <Cross
                    styleProps={{ height: '20px', minHeight: '20px', minWidth: '20px' }}
                    aria-hidden="true"
                  />
                </BaseCombobox.ChipRemove>
              </BaseCombobox.Chip>
            ))}
          </BaseCombobox.Chips>
          <BaseCombobox.Input
            aria-label={ariaLabel ?? placeholder ?? 'Multi-select input'}
            placeholder={placeholder}
            className={inputClass}
          />
        </div>
        <BaseCombobox.Portal>
          <BaseCombobox.Positioner
            sideOffset={4}
            align="start"
            className={sharedFloatingPositionerClass}
          >
            <BaseCombobox.Popup className={popupClass}>
              <BaseCombobox.List>
                {(option: SelectOption, index: number) => (
                  <BaseCombobox.Item
                    key={option.value}
                    value={option}
                    index={index}
                    className={cx(
                      sharedSelectItemClass,
                      css(...pandaStylePropsToArray(optionSx))
                    )}
                    style={mergePandaStyleProps({ styleProps: optionSx })}
                  >
                    {option.label}
                  </BaseCombobox.Item>
                )}
              </BaseCombobox.List>
              <BaseCombobox.Empty className={emptyClass}>
                {t('components.autocomplete.no_results')}
              </BaseCombobox.Empty>
            </BaseCombobox.Popup>
          </BaseCombobox.Positioner>
        </BaseCombobox.Portal>
      </BaseCombobox.Root>
    </div>
  )
}

export default MultiSelectAutocomplete
