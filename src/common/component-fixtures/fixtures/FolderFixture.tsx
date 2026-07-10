import React from 'react'

import { Box } from '#/common/style/theme'
import Folder from '#/components/common/Folder/Folder'
import type { ComponentFixture } from '#/common/component-fixtures/types'

const FolderFixtureWrapper = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <Box
    sx={{
      width: 360,
      maxWidth: '100%',
      display: 'flex',
      justifyContent: 'center',
      py: 3,
    }}
  >
    {children}
  </Box>
)

export const folderFixture: ComponentFixture = {
  id: 'folder',
  label: 'Folder',
  description:
    'Shared folder shape wrapper with content slot, themed fill/stroke, and padding split.',
  sourceGlobs: [
    'src/components/common/Folder/Folder.tsx',
    'src/components/common/Folder/SvgFolder.tsx',
    'src/common/component-fixtures/fixtures/FolderFixture.tsx',
  ],
  wrapper: FolderFixtureWrapper,
  states: [
    {
      id: 'default',
      label: 'Default',
      description: 'Default height and simple content layout.',
      render: () => (
        <Folder>
          <Box sx={{ p: 2 }}>
            <Box sx={{ fontSize: '0.75rem', fontWeight: 700 }}>Layer folder</Box>
            <Box sx={{ fontSize: '0.7rem', mt: 0.5 }}>Default folder content.</Box>
          </Box>
        </Folder>
      ),
    },
    {
      id: 'custom-sx',
      label: 'Custom styling',
      description:
        'Custom height, resolved colors, and padding routing for the folder content.',
      render: () => (
        <Folder
          height={124}
          sx={{
            backgroundColor: 'neutral.lighter',
            borderColor: 'neutral.dark',
            color: 'neutral.darker',
            p: 2,
            borderRadius: 1,
            width: '90%',
          }}
        >
          <Box sx={{ fontSize: '0.75rem', fontWeight: 700 }}>Custom folder</Box>
          <Box sx={{ fontSize: '0.7rem', mt: 1, opacity: 0.85 }}>
            Theme-resolved colors and routed padding should affect content container.
          </Box>
        </Folder>
      ),
    },
  ],
}
