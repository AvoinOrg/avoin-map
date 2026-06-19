'use client'

import React from 'react'
import { Box } from '#/common/style/theme'
import LoadingHorizontal from '#/components/Loading/LoadingHorizontal'
import { LoadingModal, LoadingSpinner } from '#/components/Loading'
import { LoadingSpinner as LegacyLoadingSpinner } from '#/components/Loading/LoadingSpinnerOld'
import type { ComponentFixture } from '#/common/component-fixtures/types'

const SpinnerCell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    sx={{
      p: 1,
      backgroundColor: '#ffffff',
      border: '1px solid #d7ddd6',
      borderRadius: 1,
      width: 180,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#0f172a',
    }}
  >
    {children}
  </Box>
)

export const loadingFeedbackFixture: ComponentFixture = {
  id: 'loading-feedback',
  label: 'Loading feedback',
  description:
    'Shared loading components across spinner, horizontal dots, and overlay states.',
  sourceGlobs: [
    'src/components/Loading/LoadingHorizontal.tsx',
    'src/components/Loading/LoadingSpinner.tsx',
    'src/components/Loading/LoadingModal.tsx',
    'src/components/Loading/LoadingSpinnerOld.tsx',
    'src/common/component-fixtures/fixtures/LoadingFeedbackFixture.tsx',
  ],
  states: [
    {
      id: 'horizontal-default',
      label: 'Horizontal default',
      description: 'Default three-dot horizontal loading animation at compact defaults.',
      render: () => (
        <Box sx={{ p: 2, display: 'inline-flex', alignItems: 'center' }}>
          <LoadingHorizontal />
        </Box>
      ),
    },
    {
      id: 'horizontal-sized-color',
      label: 'Horizontal size and color',
      description: 'Size and currentColor overrides for compact icon-slot usage.',
      render: () => (
        <Box
          sx={{
            p: 2,
            display: 'grid',
            gap: 1.5,
            alignItems: 'center',
            gridTemplateColumns: 'repeat(2, auto)',
          }}
        >
          <LoadingHorizontal sx={{ width: 24, height: 24, color: '#2563eb' }} />
          <LoadingHorizontal sx={{ width: 40, height: 40, color: '#059669' }} />
        </Box>
      ),
    },
    {
      id: 'spinner-size-color-variants',
      label: 'Spinner size and color variants',
      description:
        'Primary, secondary, warning, and inherited spinner variants with size overrides.',
      render: () => (
        <Box
          sx={{
            p: 2,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <SpinnerCell>
            <LoadingSpinner size="3rem" color="primary" />
          </SpinnerCell>
          <SpinnerCell>
            <LoadingSpinner size="4rem" color="secondary" />
          </SpinnerCell>
          <SpinnerCell>
            <LoadingSpinner size="5rem" color="warning" />
          </SpinnerCell>
          <SpinnerCell>
            <LoadingSpinner
              size="3rem"
              color="inherit"
              sx={{ color: '#dc2626' }}
            />
          </SpinnerCell>
        </Box>
      ),
    },
    {
      id: 'spinner-determinate',
      label: 'Spinner determinate',
      description: 'Determinate spinner visual state with partial progress.',
      render: () => (
        <Box sx={{ p: 2 }}>
          <LoadingSpinner
            variant="determinate"
            value={37}
            size="4rem"
            thickness={5}
            color="info"
            aria-label="Determinate spinner"
          />
          <Box sx={{ mt: 1, color: '#334155', fontSize: '0.8rem' }}>37 %</Box>
        </Box>
      ),
    },
    {
      id: 'modal-overlay',
      label: 'Loading modal overlay',
      description:
        'Full-viewport loading modal overlay with centered secondary spinner.',
      render: () => <LoadingModal />,
    },
    {
      id: 'legacy-ellipsis',
      label: 'Legacy ellipsis spinner',
      description: 'Compatibility ellipsis implementation for `LoadingSpinnerOld`.',
      render: () => (
        <Box sx={{ p: 2 }}>
          <LegacyLoadingSpinner />
        </Box>
      ),
    },
  ],
}
