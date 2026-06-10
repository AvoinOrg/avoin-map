import React from 'react'
import { Select as BaseSelect } from '@base-ui/react/select'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import { SelectOption } from '#/common/types/general'
import ArrowDown from '#/components/icons/ArrowDown'
import {
  createSelectionEvent,
  type FormSelectionEvent,
} from './formControlEvents'
import {
  sharedFloatingPositionerClass,
  sharedSelectArrowIconStyle,
  sharedSelectIconClass,
  sharedSelectItemClass,
  sharedSelectPopupStyle,
  sharedSelectTriggerFocusStyle,
} from './formControlStyles'

interface Props {
  value: string | null | undefined
  options: SelectOption[]
  onChange: (event: FormSelectionEvent<string>) => void
  ariaLabel?: string
  name?: string
  styleProps?: PandaStyleProp
  optionSx?: PandaStyleProp
  iconSx?: PandaStyleProp
  isIconOnTheRight?: boolean
}

const triggerClass = css({
  m: 0,
  p: 0,
  border: 0,
  backgroundColor: 'transparent',
  color: '#111111',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  minWidth: 0,
  cursor: 'pointer',
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.6875rem',
  fontWeight: 400,
  lineHeight: 'normal',
  letterSpacing: '0.04em',
  borderRadius: '0.125rem',
  ...sharedSelectTriggerFocusStyle,
})

const valueClass = css({
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

const popupClass = css(sharedSelectPopupStyle, {
  mt: 0.5,
})

const DropDownSelectMinimal = ({
  value,
  options,
  onChange,
  ariaLabel,
  name,
  styleProps,
  optionSx,
  iconSx,
  isIconOnTheRight = true,
}: Props) => {
  const currentValue = value == null ? '' : String(value)
  const hasEmpty = value == null

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
    <BaseSelect.Root
      value={currentValue}
      name={name}
      onValueChange={handleValueChange}
    >
      <BaseSelect.Trigger
        aria-label={ariaLabel}
        className={cx(triggerClass, css(...pandaStylePropsToArray(styleProps)))}
        style={{
          flexDirection: isIconOnTheRight ? undefined : 'row-reverse',
          ...mergePandaStyleProps({ styleProps }),
        }}
      >
        <BaseSelect.Value className={valueClass}>
          {(selectedValue) => {
            const selectedOption = options.find(
              (option) => option.value === selectedValue
            )
            return selectedOption?.label ?? selectedValue
          }}
        </BaseSelect.Value>
        <BaseSelect.Icon
          className={cx(
            sharedSelectIconClass,
            css(...pandaStylePropsToArray(iconSx))
          )}
          style={mergePandaStyleProps({ styleProps: iconSx })}
          aria-hidden="true"
        >
          <ArrowDown style={sharedSelectArrowIconStyle} />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner
          sideOffset={4}
          align="start"
          alignItemWithTrigger={false}
          className={sharedFloatingPositionerClass}
          data-dropdown-select-popup=""
        >
          <BaseSelect.Popup className={popupClass} data-dropdown-select-popup="">
            <BaseSelect.List>
              {hasEmpty && (
                <BaseSelect.Item
                  key=""
                  value=""
                  aria-label="Empty selection"
                  className={sharedSelectItemClass}
                />
              )}
              {options.map((option) => (
                <BaseSelect.Item
                  key={option.value}
                  value={option.value}
                  aria-label={
                    typeof option.label === 'string'
                      ? option.label
                      : String(option.value)
                  }
                  className={cx(
                    sharedSelectItemClass,
                    css(...pandaStylePropsToArray(optionSx))
                  )}
                  style={mergePandaStyleProps({ styleProps: optionSx })}
                >
                  {option.label}
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  )
}

export default DropDownSelectMinimal
