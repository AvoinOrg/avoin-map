import React from 'react'
import { type LinkProps as NextLinkProps } from 'next/link'

import { Box, type AppSxProps } from '#/common/style/theme'
import { NextIntlLink } from '#/common/navigation/navigation'

type LinkComponentProps = Omit<React.ComponentProps<typeof NextIntlLink>, 'sx'> & {
  sx?: AppSxProps
}

type LinkProps = React.PropsWithChildren<
  Omit<NextLinkProps, 'href'> & React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: NextLinkProps['href']
    sx?: AppSxProps
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

const LinkBox = Box as React.ElementType

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
  ].filter(Boolean) as AppSxProps

  return (
    <LinkBox
      component={NextIntlLinkComponent as React.ElementType}
      sx={composedSx}
      prefetch={prefetch}
      {...props}
    >
      {children}
    </LinkBox>
  )
}

export default Link
