import React from 'react'
import { Box, SxProps, Theme, Typography } from '@mui/material'

import DropDownSelect from '#/components/common/DropDownSelect'

type DropDownSelectProps = React.ComponentProps<typeof DropDownSelect>
type DropDownSelectWithHeaderProps = DropDownSelectProps & {
  labelAction?: React.ReactNode
  headerSx?: SxProps<Theme>
}

const DropDownSelectWithHeader = ({
  ariaLabel,
  label,
  labelAction,
  headerSx,
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
          sx={[
            {
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              maxWidth: '100%',
              px: '1rem',
              mb: 1,
            },
            ...(Array.isArray(headerSx) ? headerSx : [headerSx]),
          ]}
        >
          <Typography
            sx={[
              {
                typography: 'h7',
                minWidth: 0,
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
                lineHeight: 0,
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
