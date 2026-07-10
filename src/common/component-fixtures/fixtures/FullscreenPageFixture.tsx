import React from 'react'

import { Box } from '#/common/style/theme'
import { SlotsProvider } from '#/components/context/slotsContext'
import { FullscreenPage, FullscreenPageSlot } from '#/components/common/FullscreenPage'
import type { ComponentFixture } from '#/common/component-fixtures/types'

const lines = Array.from({ length: 28 }, (_, index) => `Scrollable entry ${index + 1}`)

export const fullscreenPageFixture: ComponentFixture = {
  id: 'fullscreen-page',
  label: 'FullscreenPage',
  description:
    'Fullscreen slot/page layout with overlay-scroll container and pointer-event split behavior.',
  sourceGlobs: [
    'src/components/common/FullscreenPage.tsx',
    'src/common/component-fixtures/fixtures/FullscreenPageFixture.tsx',
  ],
  canvasSx: {
    p: 0,
    overflow: 'visible',
    minHeight: 640,
  },
  states: [
    {
      id: 'scrollable',
      label: 'Scrollable',
      description:
        'Scrollable content rendered through SlotsProvider with slot target and content.',
      render: () => (
        <SlotsProvider>
          <FullscreenPageSlot />
          <FullscreenPage
            sx={{
              backgroundColor: '#ffffff',
              color: '#0f172a',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                px: 3,
                py: 2,
                width: '100%',
                boxSizing: 'border-box',
                gap: 1,
                flex: 1,
              }}
            >
              <Box sx={{ fontSize: '1rem', fontWeight: 700 }}>Fullscreen fixture content</Box>
              {lines.map((line) => (
                <Box
                  key={line}
                  sx={{
                    py: 0.75,
                    borderBottom: '1px solid #dbe1d7',
                    fontSize: '0.8rem',
                  }}
                >
                  {line}
                </Box>
              ))}
            </Box>
          </FullscreenPage>
        </SlotsProvider>
      ),
    },
  ],
}
