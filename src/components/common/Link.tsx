import React from 'react'
import { Box, type BoxProps, type SxProps, type Theme } from '@mui/material'
import { type LinkProps as NextLinkProps } from 'next/link'

import { NextIntlLink } from '#/common/navigation/navigation'

type LinkComponentProps = Omit<React.ComponentProps<typeof NextIntlLink>, 'sx'> & {
  sx?: SxProps<Theme>
}

type LinkProps = React.PropsWithChildren<
  Omit<NextLinkProps, 'href'> & React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: NextLinkProps['href']
    sx?: SxProps<Theme>
  }
>

const DEFAULT_LINK_SX = {
  display: 'inline-flex',
  color: 'inherit',
  textDecoration: 'none',
}

const NextIntlLinkComponent = React.forwardRef<
  HTMLAnchorElement,
  LinkComponentProps
>((props, ref) => {
  return <NextIntlLink {...props} ref={ref} />
})

NextIntlLinkComponent.displayName = 'NextIntlLinkComponent'

/**
 * A basic link. Do not use with applets that have their own domain,
 * use MutableLink instead.
 */
const Link = ({
  sx,
  children,
  prefetch = true,
  ...props
}: LinkProps) => {
  const composedSx = [
    DEFAULT_LINK_SX,
    ...(Array.isArray(sx) ? sx : [sx]),
  ].filter(Boolean) as unknown as SxProps<Theme>

  return (
    <Box
      component={NextIntlLinkComponent as React.ElementType}
      sx={composedSx as BoxProps['sx']}
      prefetch={prefetch}
      {...props}
    >
      {children}
    </Box>
  )
}

export default Link
