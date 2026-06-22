'use client'

import React, { useEffect } from 'react'
import { alpha } from '@mui/system'
import NextLink from 'next/link'

import { AppThemeProvider, Box } from '#/common/style/theme'
import { Button } from '#/components/common/Button'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

const monoFontFamily =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'

const Error = ({ error, reset }: Props) => {
  const isDev = process.env.NODE_ENV !== 'production'

  useEffect(() => {
    // Ensure the error shows in the console even if the boundary catches it
    console.error(error)
  }, [error])

  return (
    <AppThemeProvider>
      <Box
        component="main"
        sx={(theme) => ({
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          px: 3,
          py: 6,
          bgcolor: theme.palette.neutral.lighter,
          color: theme.palette.neutral.darker,
        })}
      >
        <Box
          sx={{
            height: '100%',
            minHeight: 0,
            width: '100%',
            maxWidth: isDev ? 900 : 600,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              flex: isDev ? '0 0 auto' : '1 1 auto',
              minHeight: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pb: isDev ? 3 : 0,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                textAlign: 'center',
                alignItems: 'center',
              }}
            >
              <Box component="h1" sx={{ m: 0, typography: 'h2' }}>
                Something went wrong
              </Box>
              <Box
                component="p"
                sx={{ m: 0, maxWidth: 520, typography: 'body2' }}
              >
                Please try again. If the problem persists, return to the home
                page.
              </Box>

              {!isDev && error.digest && (
                <Box
                  component="p"
                  sx={(theme) => ({
                    m: 0,
                    color: theme.palette.neutral.dark,
                    typography: 'body7',
                  })}
                >
                  Error ID: {error.digest}
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 1.5, pt: 1 }}>
                <Button type="button" variant="contained" onClick={() => reset()}>
                  Try again
                </Button>
                <Button component={NextLink} href="/" variant="outlined">
                  Go to home
                </Button>
              </Box>
            </Box>
          </Box>

          {isDev && (
            <Box
              sx={(theme) => ({
                flex: '1 1 auto',
                minHeight: 0,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: `1px solid ${theme.palette.neutral.main}`,
                bgcolor: theme.palette.neutral.light,
                boxShadow: '1px 1px 7px 0px #EEECEC',
              })}
            >
              <Box
                sx={(theme) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1.5,
                  borderBottom: `1px solid ${theme.palette.neutral.main}`,
                  borderLeft: `4px solid ${theme.palette.error.main}`,
                  bgcolor: alpha(theme.palette.error.main, 0.08),
                })}
              >
                <Box component="h2" sx={{ m: 0, typography: 'h7' }}>
                  Debug details
                </Box>
                {error.digest && (
                  <Box
                    sx={(theme) => ({
                      ml: 'auto',
                      color: theme.palette.neutral.dark,
                      typography: 'body7',
                      fontFamily: monoFontFamily,
                    })}
                  >
                    Error ID: {error.digest}
                  </Box>
                )}
              </Box>

              <Box
                sx={{
                  flex: '1 1 auto',
                  minHeight: 0,
                  overflow: 'auto',
                  p: 2,
                }}
              >
                <Box
                  sx={(theme) => ({
                    p: 1.5,
                    border: `1px solid ${alpha(theme.palette.error.main, 0.35)}`,
                    bgcolor: alpha(theme.palette.error.main, 0.06),
                  })}
                >
                  <Box
                    component="div"
                    sx={{
                      typography: 'body7',
                      fontFamily: monoFontFamily,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      color: 'inherit',
                    }}
                  >
                    {error.name}: {error.message}
                  </Box>
                </Box>

                {error.stack && (
                  <Box
                    component="pre"
                    sx={(theme) => ({
                      mt: 2,
                      mb: 0,
                      p: 1.5,
                      bgcolor: theme.palette.neutral.lighter,
                      border: `1px solid ${theme.palette.neutral.main}`,
                      typography: 'body7',
                      fontFamily: monoFontFamily,
                      whiteSpace: 'pre',
                      lineHeight: 1.6,
                    })}
                  >
                    {error.stack}
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </AppThemeProvider>
  )
}

export default Error
