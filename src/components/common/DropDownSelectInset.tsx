import React from 'react'

import {
  SHARED_CONTROL_INFINITE_BORDER_RADIUS,
  SHARED_PILL_HORIZONTAL_CONTENT_INSET_REM,
} from '#/common/style/theme/constants'
import { Box, type AppSxProps, toSxArray } from '#/common/style/theme/system'
import DropDownSelect from '#/components/common/DropDownSelect'

type DropDownSelectProps = React.ComponentProps<typeof DropDownSelect>

const INSET_TRIGGER_PADDING_LEFT_REM = 0.5
const INSET_SELECTED_BADGE_PADDING_X_REM = 0.625
const INSET_SELECTED_TEXT_LEFT_INSET_REM =
  INSET_TRIGGER_PADDING_LEFT_REM + INSET_SELECTED_BADGE_PADDING_X_REM

const INSET_NEGATIVE_MARGIN_ADJUSTMENT_SX = {
  ml: `-${INSET_SELECTED_TEXT_LEFT_INSET_REM}rem`,
  width: `calc(100% + ${
    INSET_SELECTED_TEXT_LEFT_INSET_REM +
    SHARED_PILL_HORIZONTAL_CONTENT_INSET_REM
  }rem)`,
} as const

type DropDownSelectInsetProps = Omit<
  DropDownSelectProps,
  'label' | 'labelSx' | 'selectSx' | 'sx'
> & {
  label: React.ReactNode
  /** Styles the complete inset row. */
  sx?: AppSxProps
  /** Styles only the side label. */
  labelSx?: AppSxProps
  /** Styles the nested select control wrapper. */
  selectWrapperSx?: AppSxProps
  /** Styles the select trigger/pill. */
  selectSx?: AppSxProps
}

const DropDownSelectInset = ({
  label,
  ariaLabel,
  sx,
  labelSx,
  selectSx,
  selectWrapperSx,
  renderSelectedValue,
  applyNegativeMargins,
  ...rest
}: DropDownSelectInsetProps) => {
  return (
    <Box
      data-slot="inset-select-root"
      sx={[
        {
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          minWidth: 0,
          gap: '0.875rem',
        },
        ...toSxArray(sx),
      ]}
    >
      <DropDownSelect
        {...rest}
        applyNegativeMargins={applyNegativeMargins}
        ariaLabel={ariaLabel ?? (typeof label === 'string' ? label : undefined)}
        label={undefined}
        sx={[
          {
            width: '9.25rem',
            flexShrink: 0,
          },
          ...toSxArray(selectWrapperSx),
        ]}
        selectSx={[
          {
            height: '1.375rem',
            borderRadius: SHARED_CONTROL_INFINITE_BORDER_RADIUS,
            backgroundColor: 'common.white',
            boxShadow: 'none',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#D6D6D6',
              borderRadius: SHARED_CONTROL_INFINITE_BORDER_RADIUS,
            },
            '.MuiSelect-select': {
              minHeight: '1.125rem',
              py: '0 !important',
              pl: `${INSET_TRIGGER_PADDING_LEFT_REM}rem !important`,
              pr: '1.75rem !important',
              display: 'flex',
              alignItems: 'center',
            },
          },
          ...(applyNegativeMargins
            ? [INSET_NEGATIVE_MARGIN_ADJUSTMENT_SX]
            : []),
          ...toSxArray(selectSx),
        ]}
        renderSelectedValue={
          renderSelectedValue ??
          ((selectedOption, selectedValue) => (
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                maxWidth: '100%',
                minWidth: 0,
                px: `${INSET_SELECTED_BADGE_PADDING_X_REM}rem`,
                py: '0.125rem',
                borderRadius: SHARED_CONTROL_INFINITE_BORDER_RADIUS,
                backgroundColor: 'secondary.dark',
                color: 'neutral.light',
                fontSize: '0.625rem',
                fontWeight: 700,
                lineHeight: '0.875rem',
                letterSpacing: '0.1em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {selectedOption?.label ?? selectedValue}
            </Box>
          ))
        }
      />
      <Box
        component="span"
        data-slot="inset-select-label"
        sx={[
          {
            flex: 1,
            minWidth: 0,
            color: '#111111',
            fontSize: '0.625rem',
            fontWeight: 700,
            lineHeight: '1.125rem',
            letterSpacing: '0.1em',
            whiteSpace: 'normal',
            overflowWrap: 'anywhere',
          },
          ...toSxArray(labelSx),
        ]}
      >
        {label}
      </Box>
    </Box>
  )
}

export default DropDownSelectInset
