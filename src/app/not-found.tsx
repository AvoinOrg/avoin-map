'use client'

import React from 'react'
import NextLink from 'next/link'

import { AppThemeProvider, Box } from '#/common/style/theme'
import { Button } from '#/components/common/Button'

const NotFound = () => {
  return (
    <AppThemeProvider>
      <Box
        component="main"
        sx={(theme) => ({
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          py: 6,
          bgcolor: theme.palette.neutral.lighter,
          color: theme.palette.neutral.darker,
        })}
      >
        <Box sx={{ width: '100%', maxWidth: 600 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              textAlign: 'center',
              alignItems: 'center',
            }}
          >
            <Box
              component="p"
              sx={(theme) => ({
                m: 0,
                typography: 'h1',
                fontSize: { mobile: '3rem', desktop: '4rem' },
                letterSpacing: '0.2rem',
                color: theme.palette.neutral.dark,
              })}
            >
              404
            </Box>
            <Box component="h1" sx={{ m: 0, typography: 'h2' }}>
              Page not found
            </Box>
            <Box
              component="p"
              sx={{ m: 0, maxWidth: 520, typography: 'body2' }}
            >
              The page you are looking for does not exist or has been moved.
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, pt: 1 }}>
              <Button component={NextLink} href="/" variant="contained">
                Go to home
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={() => window.history.back()}
              >
                Go back
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </AppThemeProvider>
  )
}

export default NotFound
