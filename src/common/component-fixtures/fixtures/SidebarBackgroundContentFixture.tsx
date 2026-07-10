import React from 'react'

import { Box } from '#/common/style/theme'
import SidebarBackgroundContent from '#/components/common/SidebarBackgroundContent'
import type { ComponentFixture } from '#/common/component-fixtures/types'

const imageSrc = '/files/img/green-drawings/forest.jpg'

const SidebarBackgroundContentFixtureWrapper = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <Box
    sx={{
      width: 320,
      maxWidth: '100%',
      display: 'flex',
      justifyContent: 'center',
    }}
  >
    {children}
  </Box>
)

export const sidebarBackgroundContentFixture: ComponentFixture = {
  id: 'sidebar-background-content',
  label: 'Sidebar background content',
  description:
    'Shared SidebarBackgroundContent display wrapper with image, title, description, and actions.',
  sourceGlobs: [
    'src/components/common/SidebarBackgroundContent.tsx',
    'src/common/component-fixtures/fixtures/SidebarBackgroundContentFixture.tsx',
  ],
  wrapper: SidebarBackgroundContentFixtureWrapper,
  states: [
    {
      id: 'default',
      label: 'Default',
      description: 'Default card with image, title, and description.',
      render: () => (
        <SidebarBackgroundContent
          imageSrc={imageSrc}
          imageAlt="Forest preview"
          title="Natural forests"
          description="Use this layout for map plan summaries and grouped metadata cards."
        />
      ),
    },
    {
      id: 'with-actions',
      label: 'With actions',
      description:
        'Card with child content, actions, and override paths for content/header/description layers.',
      canvasSx: {
        minHeight: 340,
      },
      render: () => (
        <SidebarBackgroundContent
          imageSrc={imageSrc}
          imageAlt="Forest preview"
          title="Plan overview"
          description="Action rows and content are layered inside the card body."
          contentSx={{ py: 1.5 }}
          descriptionSx={{ color: '#2f855a' }}
          actionsSx={{ pt: 0.5 }}
          actions={
            <>
              <Box sx={{ backgroundColor: '#eef7ed', borderRadius: 1, px: 1, py: 0.75 }}>
                Primary action
              </Box>
              <Box sx={{ backgroundColor: '#e8f0ff', borderRadius: 1, px: 1, py: 0.75 }}>
                Secondary action
              </Box>
            </>
          }
        >
          <Box
            sx={{
              fontSize: '0.625rem',
              lineHeight: 1.35,
              color: '#2d4d37',
              letterSpacing: '0.08em',
            }}
          >
            Inner content block remains below header text.
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0.75,
              mt: 1,
              fontSize: '0.625rem',
              lineHeight: 1.35,
              letterSpacing: '0.08em',
            }}
          >
            <Box sx={{ fontWeight: 700 }}>Summary item A</Box>
            <Box>Summary item B</Box>
          </Box>
        </SidebarBackgroundContent>
      ),
    },
  ],
}
