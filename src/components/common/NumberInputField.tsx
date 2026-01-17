import React from 'react'
import { NumberField as BaseNumberField } from '@base-ui/react/number-field'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import {
  Box,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import { useTranslate } from '@tolgee/react'

type BaseNumberFieldRootProps = React.ComponentPropsWithoutRef<
  typeof BaseNumberField.Root
>

type SSRInitialFilledComponent = ((props: BaseNumberFieldRootProps) => null) & {
  muiName?: string
}

// Ensures the InputLabel shrinks correctly during SSR.
const SSRInitialFilled: SSRInitialFilledComponent = () => null
SSRInitialFilled.muiName = 'Input'

type NumberInputFieldProps = Omit<
  BaseNumberFieldRootProps,
  'children' | 'render'
> & {
  label?: React.ReactNode
  helperText?: React.ReactNode
  size?: 'small' | 'medium'
  error?: boolean
  containerSx?: SxProps<Theme>
  formControlSx?: SxProps<Theme>
  inputRowSx?: SxProps<Theme>
  inputSx?: SxProps<Theme>
  adornmentSx?: SxProps<Theme>
  helperTextSx?: SxProps<Theme>
  inputSlotProps?: React.ComponentPropsWithoutRef<'input'>
}

export const NumberInputField = ({
  label,
  helperText,
  size = 'medium',
  error = false,
  containerSx,
  formControlSx,
  inputRowSx,
  inputSx,
  adornmentSx,
  helperTextSx,
  inputSlotProps,
  id: idProp,
  ...rootProps
}: NumberInputFieldProps) => {
  const hasLabel = Boolean(label)
  const generatedId = React.useId()
  const id = idProp ?? generatedId
  const { t } = useTranslate('avoin-map')

  return (
    <Box
      sx={[
        {
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        },
        ...(Array.isArray(containerSx) ? containerSx : [containerSx]),
      ]}
    >
      <Box
        sx={[
          {
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          },
          ...(Array.isArray(inputRowSx) ? inputRowSx : [inputRowSx]),
        ]}
      >
        <BaseNumberField.Root
          {...rootProps}
          id={id}
          render={(props, state) => (
            <FormControl
              size={size}
              ref={props.ref}
              disabled={state.disabled}
              required={state.required}
              error={error}
              variant="outlined"
              sx={[
                {
                  minWidth: 0,
                },
                ...(Array.isArray(formControlSx)
                  ? formControlSx
                  : [formControlSx]),
              ]}
            >
              {props.children}
            </FormControl>
          )}
        >
          <SSRInitialFilled {...rootProps} id={id} />
          {hasLabel && <InputLabel htmlFor={id}>{label}</InputLabel>}
          <BaseNumberField.Input
            id={id}
            render={(props, state) => (
              <OutlinedInput
                label={label}
                size={size}
                inputRef={props.ref}
                value={state.inputValue}
                onBlur={props.onBlur}
                onChange={props.onChange}
                onKeyUp={props.onKeyUp}
                onKeyDown={props.onKeyDown}
                onFocus={props.onFocus}
                slotProps={{
                  input: {
                    ...props,
                    ...inputSlotProps,
                  },
                }}
                endAdornment={
                  <InputAdornment
                    position="end"
                    sx={[
                      {
                        display: 'flex',
                        alignSelf: 'stretch',
                        maxHeight: 'unset',
                        borderLeft: '1px solid',
                        borderColor: 'divider',
                        ml: 0,
                        px: 0,
                        alignItems: 'stretch',
                        '& button': {
                          py: 0,
                          flex: 1,
                          borderRadius: 0.5,
                        },
                      },
                      ...(Array.isArray(adornmentSx)
                        ? adornmentSx
                        : [adornmentSx]),
                    ]}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignSelf: 'stretch',
                      }}
                    >
                      <BaseNumberField.Increment
                        render={
                          <IconButton
                            size={size}
                            aria-label={t('components.number_input.increase')}
                          />
                        }
                      >
                        <KeyboardArrowUpIcon
                          fontSize={size}
                          sx={{ transform: 'translateY(2px)' }}
                        />
                      </BaseNumberField.Increment>
                      <BaseNumberField.Decrement
                        render={
                          <IconButton
                            size={size}
                            aria-label={t('components.number_input.decrease')}
                          />
                        }
                      >
                        <KeyboardArrowDownIcon
                          fontSize={size}
                          sx={{ transform: 'translateY(-2px)' }}
                        />
                      </BaseNumberField.Decrement>
                    </Box>
                  </InputAdornment>
                }
                sx={[
                  {
                    pr: 0,
                  },
                  ...(Array.isArray(inputSx) ? inputSx : [inputSx]),
                ]}
              />
            )}
          />
          {helperText !== undefined && (
            <FormHelperText
              sx={[
                {
                  ml: 0,
                  '&:empty': { mt: 0 },
                },
                ...(Array.isArray(helperTextSx)
                  ? helperTextSx
                  : [helperTextSx]),
              ]}
            >
              {helperText}
            </FormHelperText>
          )}
        </BaseNumberField.Root>
      </Box>
    </Box>
  )
}
