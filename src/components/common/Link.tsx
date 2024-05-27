import React from 'react'
import { LinkProps as MuiLinkProps, Link as MuiLink } from '@mui/material'
import { LinkProps as NextLinkProps } from 'next/link'
import { NextIntlLink } from '#/components/Navigation'

type LinkProps = MuiLinkProps & NextLinkProps

/**
 * A basic link. Do not use with applets that have their own domain,
 * use MutableLink instead.
 */
const Link = ({ sx, children, ...props }: LinkProps) => {
  return (
    <MuiLink
      component={NextIntlLink}
      sx={{
        display: 'inline-flex',
        color: 'inherit',
        textDecoration: 'none',
        ...sx,
      }}
      prefetch={true}
      {...props}
    >
      {children}
    </MuiLink>
  )
}

export default Link
