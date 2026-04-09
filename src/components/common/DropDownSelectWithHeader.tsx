import React from 'react'
import { Box, Typography } from '@mui/material'

import DropDownSelect from '#/components/common/DropDownSelect'

type DropDownSelectProps = React.ComponentProps<typeof DropDownSelect>
type DropDownSelectWithHeaderProps = DropDownSelectProps & {
  labelAction?: React.ReactNode
}

const DropDownSelectWithHeader = ({
  ariaLabel,
  label,
  labelAction,
  labelSx,
  sx,
  ...rest
}: DropDownSelectWithHeaderProps) => {
  return (
    <Box
      sx={[
        {
          typography: 'h7',
          mb: 1,
          borderRadius: '999px',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {label && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <Typography
            sx={[
              {
                typography: 'h7',
                mb: 1,
                flex: 1,
              },
              ...(Array.isArray(labelSx) ? labelSx : [labelSx]),
            ]}
          >
            {label}
          </Typography>
          {labelAction && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              {labelAction}
            </Box>
          )}
        </Box>
      )}
      <DropDownSelect
        sx={{ width: '100%' }}
        {...rest}
        ariaLabel={
          ariaLabel ?? (typeof label === 'string' ? label : undefined)
        }
        label={undefined}
      />
    </Box>
  )
}

export default DropDownSelectWithHeader
