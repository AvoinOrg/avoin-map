import React from 'react'

import { Box, type AppSxProps, toSxArray } from '#/common/style/theme/system'
import DropDownSelect, {
  DROP_DOWN_SELECT_HEADER_LABEL_SX,
  DROP_DOWN_SELECT_HEADER_SX,
} from '#/components/common/DropDownSelect'

type DropDownSelectProps = React.ComponentProps<typeof DropDownSelect>
type DropDownSelectWithLabelProps = DropDownSelectProps & {
  dataSlot?: string
  labelAction?: React.ReactNode
  headerSx?: AppSxProps
}

const DropDownSelectWithLabel = ({
  ariaLabel,
  dataSlot,
  label,
  labelAction,
  headerSx,
  labelSx,
  sx,
  ...rest
}: DropDownSelectWithLabelProps) => {
  return (
    <Box
      data-slot={dataSlot}
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
            DROP_DOWN_SELECT_HEADER_SX,
            ...toSxArray(headerSx),
          ]}
        >
          <Box
            component="span"
            sx={[
              DROP_DOWN_SELECT_HEADER_LABEL_SX,
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

export default DropDownSelectWithLabel
