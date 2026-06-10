'use client'

import React, { useEffect } from 'react'
import NextLink from 'next/link'
import { css } from 'styled-system/css'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

const monoFontFamily =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'

const pageClass = css({
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  px: 3,
  py: 6,
  backgroundColor: 'neutral.lighter',
  color: 'neutral.darker',
})

const containerClass = css({
  height: '100%',
  minHeight: 0,
  width: '100%',
  mx: 'auto',
  display: 'flex',
  flexDirection: 'column',
})

const summaryClass = css({
  minHeight: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

const summaryStackClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  textAlign: 'center',
  alignItems: 'center',
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

const digestClass = css({
  m: 0,
  color: 'neutral.dark',
  textStyle: 'body7',
})

const actionsClass = css({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: 1.5,
  pt: 1,
})

const buttonBaseClass = css({
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

const debugPanelClass = css({
  flex: '1 1 auto',
  minHeight: 0,
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  border: '1px solid var(--colors-neutral-main)',
  backgroundColor: 'neutral.light',
  boxShadow: 'button',
})

const debugHeaderClass = css({
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  px: 2,
  py: 1.5,
  borderBottom: '1px solid var(--colors-neutral-main)',
  borderLeft: '4px solid var(--colors-error-main)',
  backgroundColor: 'rgba(211, 47, 47, 0.08)',
})

const debugTitleClass = css({
  m: 0,
  textStyle: 'h7',
})

const debugDigestClass = css({
  m: 0,
  ml: 'auto',
  color: 'neutral.dark',
  textStyle: 'body7',
  fontFamily: monoFontFamily,
})

const debugBodyClass = css({
  flex: '1 1 auto',
  minHeight: 0,
  overflow: 'auto',
  p: 2,
})

const errorMessageClass = css({
  p: 1.5,
  border: '1px solid rgba(211, 47, 47, 0.35)',
  backgroundColor: 'rgba(211, 47, 47, 0.06)',
})

const errorMessageTextClass = css({
  m: 0,
  color: 'inherit',
  fontFamily: monoFontFamily,
  textStyle: 'body7',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
})

const stackClass = css({
  mt: 2,
  mb: 0,
  p: 1.5,
  overflow: 'auto',
  backgroundColor: 'neutral.lighter',
  border: '1px solid var(--colors-neutral-main)',
  fontFamily: monoFontFamily,
  textStyle: 'body7',
  whiteSpace: 'pre',
  lineHeight: 1.6,
})

const Error = ({ error, reset }: Props) => {
  const isDev = process.env.NODE_ENV !== 'production'

  useEffect(() => {
    // Ensure the error shows in the console even if the boundary catches it.
    console.error(error)
  }, [error])

  return (
    <main className={pageClass}>
      <section
        className={containerClass}
        style={{ maxWidth: isDev ? '56rem' : '37.5rem' }}
      >
        <div
          className={summaryClass}
          style={{
            flex: isDev ? '0 0 auto' : '1 1 auto',
            paddingBottom: isDev ? '1.5rem' : 0,
          }}
        >
          <div className={summaryStackClass}>
            <h1 className={titleClass}>Something went wrong</h1>
            <p className={bodyClass}>
              Please try again. If the problem persists, return to the home
              page.
            </p>

            {!isDev && error.digest && (
              <p className={digestClass}>Error ID: {error.digest}</p>
            )}

            <div className={actionsClass}>
              <button
                type="button"
                className={buttonBaseClass}
                onClick={() => reset()}
              >
                Try again
              </button>
              <NextLink href="/" className={buttonBaseClass}>
                Go to home
              </NextLink>
            </div>
          </div>
        </div>

        {isDev && (
          <section className={debugPanelClass} aria-label="Debug details">
            <div className={debugHeaderClass}>
              <h2 className={debugTitleClass}>Debug details</h2>
              {error.digest && (
                <p className={debugDigestClass}>Error ID: {error.digest}</p>
              )}
            </div>

            <div className={debugBodyClass}>
              <div className={errorMessageClass}>
                <p className={errorMessageTextClass}>
                  {error.name}: {error.message}
                </p>
              </div>

              {error.stack && <pre className={stackClass}>{error.stack}</pre>}
            </div>
          </section>
        )}
      </section>
    </main>
  )
}

export default Error
