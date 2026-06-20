import React from 'react'

import { Box, type AppSxProps, toSxArray } from '#/common/style/theme/system'
import DropDownSelect from '#/components/common/DropDownSelect'

type DropDownSelectProps = React.ComponentProps<typeof DropDownSelect>
type DropDownSelectWithHeaderProps = DropDownSelectProps & {
  labelAction?: React.ReactNode
  headerSx?: AppSxProps
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
          width: '100%',
        },
        ...toSxArray(sx),
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
              minHeight: '1.5rem',
              mb: '0.2rem',
            },
            ...toSxArray(headerSx),
          ]}
        >
          <Box
            component="span"
            sx={[
              {
                minWidth: 0,
                fontSize: '0.625rem',
                fontWeight: 400,
                lineHeight: '0.8125rem',
                letterSpacing: '0.11em',
                color: '#111111',
              },
              ...toSxArray(labelSx),
            ]}
          >
            {label}
          </Box>
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
        ariaLabel={ariaLabel ?? (typeof label === 'string' ? label : undefined)}
        label={undefined}
      />
    </Box>
  )
}

export default DropDownSelectWithHeader
