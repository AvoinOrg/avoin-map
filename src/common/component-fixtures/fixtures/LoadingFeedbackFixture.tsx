import React from 'react'
import { Box } from '#/common/style/theme'
import LoadingHorizontal from '#/components/Loading/LoadingHorizontal'
import { LoadingModal, LoadingSpinner } from '#/components/Loading'
import { SidebarLoadingBlock } from '#/components/Sidebar'
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

const freezeSvgAnimations = (root: HTMLDivElement | null) => {
  root?.querySelectorAll('svg').forEach((svg) => {
    svg.setCurrentTime(0)
    svg.pauseAnimations()
  })
}

const FrozenSvgAnimations = ({ children }: { children: React.ReactNode }) => {
  const rootRef = React.useRef<HTMLDivElement | null>(null)

  React.useLayoutEffect(() => {
    freezeSvgAnimations(rootRef.current)
    const timeoutId = window.setTimeout(() => {
      freezeSvgAnimations(rootRef.current)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  return <Box ref={rootRef}>{children}</Box>
}

export const loadingFeedbackFixture: ComponentFixture = {
  id: 'loading-feedback',
  label: 'Loading feedback',
  description:
    'Shared loading components across spinner, horizontal dots, sidebar blocks, and overlay states.',
  sourceGlobs: [
    'src/components/Loading/LoadingHorizontal.tsx',
    'src/components/Loading/LoadingSpinner.tsx',
    'src/components/Loading/LoadingModal.tsx',
    'src/components/Sidebar/SidebarContentBox.tsx',
    'src/components/Sidebar/SidebarLoadingBlock.tsx',
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
      id: 'sidebar-loading-block',
      label: 'Sidebar loading block',
      description:
        'Constrained full-sidebar loading shell with a fixture-frozen centered progress indicator.',
      wrapper: FrozenSvgAnimations,
      canvasSx: {
        width: { mobile: '100%', desktop: 'fit-content' },
        minWidth: 0,
        alignItems: 'stretch',
      },
      render: () => (
        <Box
          sx={{
            display: 'flex',
            width: '22rem',
            maxWidth: '100%',
            height: '16rem',
            overflow: 'hidden',
            backgroundColor: '#f4f4f4',
          }}
        >
          <SidebarLoadingBlock />
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
  ],
}
