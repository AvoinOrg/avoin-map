'use client'

import React from 'react'
import { Box, Button, Container, Stack, Typography } from '@mui/material'
import NextLink from 'next/link'

import { AppThemeProvider } from '#/common/style/theme'

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
        <Container maxWidth="sm">
          <Stack spacing={2} sx={{ textAlign: 'center', alignItems: 'center' }}>
            <Typography
              variant="h1"
              sx={(theme) => ({
                fontSize: { xs: '3rem', sm: '4rem' },
                letterSpacing: '0.2rem',
                color: theme.palette.neutral.dark,
              })}
            >
              404
            </Typography>
            <Typography variant="h2">Page not found</Typography>
            <Typography variant="body2" sx={{ maxWidth: 520 }}>
              The page you are looking for does not exist or has been moved.
            </Typography>

            <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
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
            </Stack>
          </Stack>
        </Container>
      </Box>
    </AppThemeProvider>
  )
}

export default NotFound
