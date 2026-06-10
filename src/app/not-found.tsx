'use client'

import React from 'react'
import NextLink from 'next/link'
import { css } from 'styled-system/css'

const pageClass = css({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  px: 3,
  py: 6,
  backgroundColor: 'neutral.lighter',
  color: 'neutral.darker',
})

const contentClass = css({
  width: '100%',
  maxWidth: '37.5rem',
  mx: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  textAlign: 'center',
  alignItems: 'center',
})

const codeClass = css({
  m: 0,
  color: 'neutral.dark',
  fontSize: { mobile: '3rem', desktop: '4rem' },
  fontWeight: 700,
  lineHeight: 'normal',
  letterSpacing: '0.2rem',
})

const titleClass = css({
  m: 0,
  textStyle: 'h2',
})

const bodyClass = css({
  m: 0,
  maxWidth: '32.5rem',
  textStyle: 'body2',
})

const actionsClass = css({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: 1.5,
  pt: 1,
})

const buttonClass = css({
  m: 0,
  px: 2,
  py: 1,
  minHeight: '2.25rem',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid var(--colors-neutral-main)',
  borderRadius: '4px',
  backgroundColor: 'neutral.light',
  color: 'neutral.darker',
  boxShadow: 'button',
  textDecoration: 'none',
  textStyle: 'body2',
  cursor: 'pointer',
  appearance: 'none',
  '&:hover': {
    backgroundColor: 'neutral.lighter',
  },
  '&:focus-visible': {
    outline: '2px solid var(--colors-secondary-main)',
    outlineOffset: '2px',
  },
})

const NotFound = () => {
  return (
    <main className={pageClass}>
      <section className={contentClass}>
        <p className={codeClass}>404</p>
        <h1 className={titleClass}>Page not found</h1>
        <p className={bodyClass}>
          The page you are looking for does not exist or has been moved.
        </p>

        <div className={actionsClass}>
          <NextLink href="/" className={buttonClass}>
            Go to home
          </NextLink>
          <button
            type="button"
            className={buttonClass}
            onClick={() => window.history.back()}
          >
            Go back
          </button>
        </div>
      </section>
    </main>
  )
}

export default NotFound
