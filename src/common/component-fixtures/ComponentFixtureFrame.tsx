import React from 'react'

import { Box } from '#/common/style/theme'
import { getComponentFixtureState } from './registry'

type Props = {
  fixtureId: string
  stateId: string
}

export const ComponentFixtureFrame = ({ fixtureId, stateId }: Props) => {
  const [isHydrated, setIsHydrated] = React.useState(false)
  const resolved = getComponentFixtureState({ fixtureId, stateId })

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsHydrated(true), 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  if (!resolved) {
    return null
  }

  const { fixture, state } = resolved
  const Wrapper = state.wrapper || fixture.wrapper || React.Fragment

  return (
    <Box
      component="main"
      data-testid={
        isHydrated ? 'component-fixture-ready' : 'component-fixture-loading'
      }
      data-component-fixture-id={fixture.id}
      data-component-fixture-state={state.id}
      sx={{
        height: '100vh',
        minHeight: '100vh',
        overflow: 'auto',
        px: { mobile: 2, desktop: 4 },
        py: { mobile: 3, desktop: 5 },
        backgroundColor: '#f4f6f3',
        color: '#111111',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 960,
          mx: 'auto',
        }}
      >
        <Box
          sx={{
            mb: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          <Box
            component="h1"
            sx={{
              m: 0,
              fontSize: '0.875rem',
              fontWeight: 700,
              lineHeight: 1.3,
            }}
          >
            {fixture.label}: {state.label}
          </Box>
          {state.description && (
            <Box
              component="p"
              sx={{
                m: 0,
                maxWidth: 560,
                fontSize: '0.75rem',
                lineHeight: 1.45,
                color: '#4e5a4d',
              }}
            >
              {state.description}
            </Box>
          )}
        </Box>

        <Box
          data-testid="component-fixture-canvas"
          sx={[
            {
              width: 'fit-content',
              maxWidth: '100%',
              minWidth: 320,
              minHeight: 120,
              p: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd3c9',
              borderRadius: 1,
              overflow: 'hidden',
            },
            ...(Array.isArray(fixture.canvasSx)
              ? fixture.canvasSx
              : [fixture.canvasSx]),
            ...(Array.isArray(state.canvasSx)
              ? state.canvasSx
              : [state.canvasSx]),
          ]}
        >
          <Wrapper>{state.render()}</Wrapper>
        </Box>
      </Box>
    </Box>
  )
}
