import React from 'react'
import { Box, Typography } from '@mui/material'

import DropDownSelect from '#/components/common/DropDownSelect'

type DropDownSelectProps = React.ComponentProps<typeof DropDownSelect>

const DropDownSelectWithHeader = ({
  label,
  labelSx,
  sx,
  ...rest
}: DropDownSelectProps) => {
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
        <Typography
          sx={[
            {
              typography: 'h7',
              mb: 1,
            },
            ...(Array.isArray(labelSx) ? labelSx : [labelSx]),
          ]}
        >
          {label}
        </Typography>
      )}
      <DropDownSelect
        sx={{ width: '100%' }}
        {...rest}
        ariaLabel={label}
        label={undefined}
      />
    </Box>
  )
}

export default DropDownSelectWithHeader
