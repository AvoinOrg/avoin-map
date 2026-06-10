'use client'

import React from 'react'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'

type SidebarBackgroundContentProps = {
  imageSrc: string
  imageAlt: string
  title?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  actions?: React.ReactNode
  styleProps?: PandaStyleProp
  imageSx?: PandaStyleProp
  contentSx?: PandaStyleProp
  headerSx?: PandaStyleProp
  descriptionSx?: PandaStyleProp
  actionsSx?: PandaStyleProp
}

const SidebarBackgroundContent = ({
  imageSrc,
  imageAlt,
  title,
  description,
  children,
  actions,
  styleProps,
  imageSx,
  contentSx,
  headerSx,
  descriptionSx,
  actionsSx,
}: SidebarBackgroundContentProps) => {
  return (
    <div
      className={cx(
        css({
          width: '100%',
          overflow: 'hidden',
          borderRadius: '1.25rem',
          backgroundColor: '#e4f6d5',
          color: '#111111',
          boxShadow: 'none',
        }),
        css(...pandaStylePropsToArray(styleProps))
      )}
      style={mergePandaStyleProps({ styleProps })}
    >
      <img
        src={imageSrc}
        alt={imageAlt}
        className={cx(
          css({
            display: 'block',
            width: '100%',
            height: '4.375rem',
            objectFit: 'cover',
            objectPosition: 'center',
          }),
          css(...pandaStylePropsToArray(imageSx))
        )}
        style={mergePandaStyleProps({ styleProps: imageSx })}
      />
      <div
        className={cx(
          css({
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            px: '1.25rem',
            pt: '1.125rem',
            pb: '1.25rem',
          }),
          css(...pandaStylePropsToArray(contentSx))
        )}
        style={mergePandaStyleProps({ styleProps: contentSx })}
      >
        {(title || description) && (
          <div
            className={cx(
              css({
                display: 'flex',
                flexDirection: 'column',
                gap: 0.8,
              }),
              css(...pandaStylePropsToArray(headerSx))
            )}
            style={mergePandaStyleProps({ styleProps: headerSx })}
          >
            {title && (
              <span
                className={css({
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  lineHeight: '1.125rem',
                  letterSpacing: '0.1em',
                  color: 'inherit',
                  textTransform: 'uppercase',
                })}
              >
                {title}
              </span>
            )}
            {description && (
              <span
                className={cx(
                  css({
                    fontSize: '0.625rem',
                    fontWeight: 400,
                    lineHeight: '1.125rem',
                    letterSpacing: '0.1em',
                    color: 'inherit',
                    maxWidth: '24ch',
                  }),
                  css(...pandaStylePropsToArray(descriptionSx))
                )}
                style={mergePandaStyleProps({ styleProps: descriptionSx })}
              >
                {description}
              </span>
            )}
          </div>
        )}
        {children}
        {actions && (
          <div
            className={cx(
              css({
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }),
              css(...pandaStylePropsToArray(actionsSx))
            )}
            style={mergePandaStyleProps({ styleProps: actionsSx })}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

export default SidebarBackgroundContent
