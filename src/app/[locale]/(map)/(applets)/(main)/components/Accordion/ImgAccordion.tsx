import React, { useState } from 'react'
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible'
import { css, cx } from 'styled-system/css'
import Image, { StaticImageData } from 'next/image'

interface Props {
  title: string
  img: string | StaticImageData
  children: React.ReactNode
}

const rootClass = css({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  flex: '1 1 0%',
  '&[data-expanded="true"]': {
    flex: '0 0 auto',
  },
})

const triggerClass = css({
  position: 'relative',
  overflow: 'hidden',
  flex: '1 1 auto',
  minHeight: '5rem',
  width: '100%',
  p: 0,
  m: 0,
  border: 0,
  background: 'transparent',
  color: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'stretch',
  '&:focus-visible': {
    outline: '2px solid #111111',
    outlineOffset: '-2px',
  },
  '[data-expanded="true"] &': {
    flex: '0 0 5rem',
  },
})

const triggerContentClass = css({
  position: 'relative',
  zIndex: 2,
  flexGrow: 1,
  m: 0,
  pl: 5,
  pr: 5,
  pt: 3,
  pb: 3,
  display: 'flex',
  alignItems: 'center',
})

const fadeClass = css({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  transition: 'opacity 0.3s ease-in-out',
  zIndex: 1,
})

const whiteFadeClass = css({
  backgroundImage: 'linear-gradient(to right, white 20%, transparent 80%)',
  opacity: 1,
  '[data-expanded="true"] &': {
    opacity: 0,
  },
})

const darkFadeClass = css({
  backgroundImage:
    'linear-gradient(to right, rgba(0,0,0,0.6) 30%, transparent 90%)',
  opacity: 0,
  '[data-expanded="true"] &': {
    opacity: 1,
  },
})

const titleClass = css({
  fontSize: '0.75rem',
  fontStyle: 'normal',
  fontWeight: 700,
  lineHeight: 'normal',
  letterSpacing: '0.075rem',
  textTransform: 'uppercase',
  flexGrow: 1,
  transition: 'color 0.3s ease-in-out',
  zIndex: 2,
  '[data-expanded="true"] &': {
    color: 'common.white',
  },
})

const panelClass = css({
  flex: '0 0 auto',
  overflow: 'hidden',
  height: 'var(--collapsible-panel-height)',
  opacity: 1,
  transition: 'height 200ms ease, opacity 200ms ease',
  '&[data-closed]': {
    height: 0,
    opacity: 0,
  },
})

const contentClass = css({
  width: '100%',
})

const ImgAccordion = ({ title, img, children }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <BaseCollapsible.Root
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className={rootClass}
      data-expanded={isExpanded ? 'true' : 'false'}
    >
      <BaseCollapsible.Trigger
        type="button"
        aria-label={`Toggle ${title}`}
        className={triggerClass}
      >
        <Image
          src={img}
          alt={title}
          fill
          style={{ objectFit: 'cover', zIndex: 0 }}
          sizes="(max-width: 400px) 100vw"
        />
        <span className={cx(fadeClass, whiteFadeClass)} />
        <span className={cx(fadeClass, darkFadeClass)} />
        <span className={triggerContentClass}>
          <span className={titleClass}>{title}</span>
        </span>
      </BaseCollapsible.Trigger>
      <BaseCollapsible.Panel className={panelClass} keepMounted={false}>
        <div className={contentClass}>{children}</div>
      </BaseCollapsible.Panel>
    </BaseCollapsible.Root>
  )
}

export default ImgAccordion
