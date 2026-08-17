import { Box, type AppBoxProps, toSxArray } from '#/common/style/theme'

import { getContrastColor } from '#/common/utils/styling'

type Props = {
  code: string
  color?: string
  dark?: boolean
  sx?: AppBoxProps['sx']
  uppercase?: boolean
}

const ZoneClassChip = ({
  code,
  color,
  dark = false,
  sx,
  uppercase = true,
}: Props) => {
  const backgroundColor = dark ? '#111111' : (color ?? '#D9D9D9')
  const textColor = getContrastColor(backgroundColor)

  return (
    <Box
      component="span"
      data-slot="zone-class-chip"
      sx={[
        {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '2.25rem',
          height: '1.25rem',
          px: '0.625rem',
          pt: '0.1rem',
          borderRadius: '999px',
          backgroundColor,
          color: textColor,
          fontSize: '0.625rem',
          fontWeight: dark ? 700 : 400,
          lineHeight: '1.25rem',
          letterSpacing: uppercase ? '0.1em' : '0.04em',
          textTransform: uppercase ? 'uppercase' : 'none',
          whiteSpace: 'nowrap',
        },
        ...toSxArray(sx),
      ]}
    >
      {code}
    </Box>
  )
}

export default ZoneClassChip
