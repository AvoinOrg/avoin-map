import React from 'react'

import { Box, type AppSxProps } from '#/common/style/theme'
import { AppLink, type AppLinkProps } from '#/common/navigation/navigation'

type LinkComponentProps = Omit<AppLinkProps, 'sx'> & {
  sx?: AppSxProps
}

type LinkProps = React.PropsWithChildren<
  Omit<AppLinkProps, 'sx'> & {
    sx?: AppSxProps
  }
>

const DEFAULT_LINK_SX = {
  display: 'inline-flex',
  color: 'inherit',
  textDecoration: 'none',
}

const AppLinkComponent = React.forwardRef<
  HTMLAnchorElement,
  LinkComponentProps
>((props, ref) => {
  return (
    <AppLink
      {...(props as React.ComponentProps<typeof AppLink>)}
      ref={ref}
    />
  )
})

AppLinkComponent.displayName = 'AppLinkComponent'

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
      component={AppLinkComponent as React.ElementType}
      sx={composedSx}
      prefetch={prefetch}
      {...props}
    >
      {children}
    </LinkBox>
  )
}

export default Link
