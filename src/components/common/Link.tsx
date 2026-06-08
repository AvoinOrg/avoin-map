import React from 'react'
import type { UrlObject } from 'url'
import { css, cx } from 'styled-system/css'

import { NextIntlLink } from '#/common/navigation/navigation'
import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'

type NextIntlLinkProps = React.ComponentProps<typeof NextIntlLink>

type LinkProps = Omit<NextIntlLinkProps, 'href' | 'className' | 'style'> & {
  href: string | UrlObject
  sx?: PandaStyleProp
  className?: string
  style?: React.CSSProperties
  underline?: 'none' | 'hover' | 'always'
  color?: React.CSSProperties['color']
}

/**
 * A basic link. Do not use with applets that have their own domain,
 * use MutableLink instead.
 */
const Link = ({
  href,
  sx,
  children,
  className,
  style,
  underline = 'none',
  color = 'inherit',
  ...props
}: LinkProps) => {
  return (
    <NextIntlLink
      className={cx(
        css({
          display: 'inline-flex',
          color,
          textDecoration: underline === 'always' ? 'underline' : 'none',
          '&:hover':
            underline === 'hover'
              ? {
                  textDecoration: 'underline',
                }
              : undefined,
        }),
        css(...pandaStylePropsToArray(sx)),
        className
      )}
      style={mergePandaStyleProps({ sx, style })}
      prefetch={true}
      {...props}
      href={href as NextIntlLinkProps['href']}
    >
      {children}
    </NextIntlLink>
  )
}

export default Link
