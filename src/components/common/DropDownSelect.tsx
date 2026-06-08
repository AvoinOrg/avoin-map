import React from 'react'
import { Select as BaseSelect } from '@base-ui/react/select'
import { useTranslate } from '@tolgee/react'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import { SelectOption } from '#/common/types/general'
import ArrowDown from '#/components/icons/ArrowDown'
import CheckcircleCheckedFilled from '#/components/icons/CheckcircleCheckedFilled'
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

interface Props {
  value: string | null | undefined
  options: SelectOption[]
  onChange: (event: FormSelectionEvent<string>) => void
  label?: string
  ariaLabel?: string
  name?: string
  allowEmpty?: boolean
  placeholder?: React.ReactNode
  renderOption?: (option: SelectOption) => React.ReactNode
  renderSelectedValue?: (
    selectedOption: SelectOption | undefined,
    selectedValue: string
  ) => React.ReactNode
  sx?: PandaStyleProp
  selectSx?: PandaStyleProp
  labelSx?: PandaStyleProp
  iconSx?: PandaStyleProp
  typographySx?: PandaStyleProp
  disabled?: boolean
  successIndicatorMode?: 'outside' | 'hidden'
}

const wrapperClass = css({
  position: 'relative',
  maxWidth: '100%',
  borderRadius: '999px',
})

const formControlClass = css({
  width: '100%',
  minWidth: 0,
  borderRadius: '999px',
})

const floatingLabelClass = css({
  position: 'absolute',
  left: '0.875rem',
  top: '-0.45rem',
  zIndex: 1,
  backgroundColor: 'background.main',
  px: 0.5,
  color: '#111111',
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.65625rem',
  fontWeight: 400,
  lineHeight: '0.8125rem',
  letterSpacing: '0.0875rem',
  '[data-focused] &': {
    color: 'secondary.dark',
  },
})

const triggerClass = css({
  boxSizing: 'border-box',
  width: '100%',
  minWidth: 0,
  height: '2rem',
  minHeight: '2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '0.5rem',
  borderRadius: '999px',
  border: '0.5px solid #D6D6D6',
  backgroundColor: 'transparent',
  boxShadow: 'inset 0px 0.5px 1px 0px #D9D9D9',
  color: '#111111',
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.6875rem',
  fontWeight: 400,
  lineHeight: 'normal',
  letterSpacing: '0.04em',
  py: '0.1875rem',
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
})

const placeholderClass = css({
  display: 'block',
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: '#a0a0a0',
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
  border: '0.1px solid #A0A0A0',
  boxShadow: '0 1px 3px 0 rgba(214, 214, 214, 0.50) inset',
})

const itemTextClass = css({
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

const DropDownSelect = ({
  value,
  options,
  onChange,
  label,
  ariaLabel,
  name,
  allowEmpty,
  placeholder,
  renderOption,
  renderSelectedValue,
  sx,
  selectSx,
  labelSx,
  iconSx,
  typographySx,
  disabled,
  successIndicatorMode = 'hidden',
}: Props) => {
  const { t } = useTranslate('avoin-map')
  const generatedId = React.useId()
  const labelId = label ? `${generatedId}-label` : undefined
  const selectId = `${generatedId}-select`
  const currentValue = value == null ? '' : String(value)
  const hasInvalidValue =
    value != null &&
    value !== '' &&
    !options.some((option) => option.value === value)
  const useEmpty = allowEmpty || value == null || value === ''
  const hasValidSelection =
    !disabled &&
    currentValue !== '' &&
    options.some((option) => option.value === currentValue)

  const renderSelectedContent = (selectedValue: string | null) => {
    const resolvedValue = selectedValue == null ? '' : String(selectedValue)

    if ((resolvedValue === '' || selectedValue == null) && placeholder != null) {
      return <span className={placeholderClass}>{placeholder}</span>
    }

    const option = options.find((item) => item.value === resolvedValue)

    if (renderSelectedValue) {
      return renderSelectedValue(option, resolvedValue)
    }

    return option?.label ?? resolvedValue
  }

  const handleValueChange = React.useCallback(
    (nextValue: string | null, eventDetails: { event?: Event }) => {
      onChange(
        createSelectionEvent({
          value: nextValue == null ? '' : String(nextValue),
          name,
          eventDetails,
        })
      )
    },
    [name, onChange]
  )

  return (
    <div
      className={cx(wrapperClass, css(...pandaStylePropsToArray(sx)))}
      style={{
        display: successIndicatorMode === 'outside' ? 'flex' : undefined,
        alignItems: successIndicatorMode === 'outside' ? 'center' : undefined,
        gap: successIndicatorMode === 'outside' ? '0.5rem' : undefined,
        ...mergePandaStyleProps({ sx }),
      }}
    >
      <div className={formControlClass}>
        {label && (
          <label
            id={labelId}
            htmlFor={selectId}
            className={cx(
              floatingLabelClass,
              css(...pandaStylePropsToArray(labelSx))
            )}
            style={mergePandaStyleProps({ sx: labelSx })}
          >
            {label}
          </label>
        )}
        <BaseSelect.Root
          value={currentValue}
          name={name}
          disabled={disabled}
          onValueChange={handleValueChange}
        >
          <BaseSelect.Trigger
            id={selectId}
            aria-label={ariaLabel ?? label}
            aria-labelledby={ariaLabel == null && label ? labelId : undefined}
            className={cx(
              triggerClass,
              css(...pandaStylePropsToArray(selectSx))
            )}
            style={mergePandaStyleProps({ sx: selectSx })}
          >
            <BaseSelect.Value className={valueClass}>
              {(selectedValue) => renderSelectedContent(selectedValue)}
            </BaseSelect.Value>
            <BaseSelect.Icon
              className={cx(iconClass, css(...pandaStylePropsToArray(iconSx)))}
              style={mergePandaStyleProps({ sx: iconSx })}
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
              <BaseSelect.Popup className={popupClass}>
                <BaseSelect.List>
                  {hasInvalidValue && (
                    <BaseSelect.Item
                      key={`invalid-${currentValue}`}
                      value={currentValue}
                      aria-label={`Invalid value ${currentValue}`}
                      className={cx(
                        sharedSelectItemClass,
                        css(...pandaStylePropsToArray(typographySx))
                      )}
                      style={mergePandaStyleProps({ sx: typographySx })}
                    >
                      <span className={itemTextClass}>
                        <i>
                          {t('components.drop_down_select.invalid_value')}
                          {` (${currentValue})`}
                        </i>
                      </span>
                    </BaseSelect.Item>
                  )}
                  {useEmpty && (
                    <BaseSelect.Item
                      key="empty-selection"
                      value=""
                      aria-label="Empty selection"
                      className={cx(
                        sharedSelectItemClass,
                        css(...pandaStylePropsToArray(typographySx))
                      )}
                      style={mergePandaStyleProps({ sx: typographySx })}
                    >
                      <span className={itemTextClass}>
                        <i>
                          {t('components.drop_down_select.empty_selection')}
                        </i>
                      </span>
                    </BaseSelect.Item>
                  )}
                  {options.map((option) => (
                    <BaseSelect.Item
                      key={`option-${option.value}`}
                      value={option.value}
                      aria-label={
                        typeof option.label === 'string'
                          ? option.label
                          : String(option.value)
                      }
                      className={cx(
                        sharedSelectItemClass,
                        css(...pandaStylePropsToArray(typographySx))
                      )}
                      style={mergePandaStyleProps({ sx: typographySx })}
                    >
                      <span className={itemTextClass}>
                        {renderOption ? renderOption(option) : option.label}
                      </span>
                    </BaseSelect.Item>
                  ))}
                </BaseSelect.List>
              </BaseSelect.Popup>
            </BaseSelect.Positioner>
          </BaseSelect.Portal>
        </BaseSelect.Root>
      </div>
      {hasValidSelection && successIndicatorMode === 'outside' && (
        <CheckcircleCheckedFilled
          sx={{
            width: 12,
            height: 12,
            color: '#2C8E74',
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

export default DropDownSelect
