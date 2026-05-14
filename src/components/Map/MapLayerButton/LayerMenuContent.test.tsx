import React from 'react'
import '@testing-library/jest-dom'
import { ThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'

import theme from '#/common/style/theme/theme'
import { LayerOrderLevel, ListedLayerMenuItem } from '#/common/types/map'
import LayerMenuContent from './LayerMenuContent'

jest.mock('@tolgee/react', () => ({
  useTranslate: (ns?: string) => ({
    t: (key: string) => `${ns ?? 'default'}:${key}`,
  }),
}))

jest.mock('#/components/common/TText', () => {
  const react = require('react')

  return {
    __esModule: true,
    default: ({ keyName, ns }: { keyName: string; ns?: string }) =>
      react.createElement(
        'span',
        {
          'data-testid': 'tolgee-target',
          'data-key-name': keyName,
          'data-ns': ns,
        },
        `${ns}:${keyName}`
      ),
  }
})

jest.mock('#/common/hooks/map/useLayerGroupOpacity', () => ({
  useLayerGroupOpacity: () => undefined,
}))

jest.mock('#/common/utils/map', () => ({
  clampOpacity: (opacity: number) => opacity,
}))

jest.mock('overlayscrollbars-react', () => {
  const react = require('react')

  return {
    OverlayScrollbarsComponent: ({
      children,
    }: {
      children: React.ReactNode
    }) => react.createElement('div', null, children),
  }
})

jest.mock('next/image', () => {
  const react = require('react')

  return {
    __esModule: true,
    default: ({ alt, ...props }: any) =>
      react.createElement('img', { alt, ...props }),
  }
})

const normalLayer: ListedLayerMenuItem = {
  id: 'normal-layer',
  addOptions: {
    layerOrderOptions: {
      layerOrderLevel: LayerOrderLevel.BACKGROUND,
    },
  },
  translationNs: 'test-ns',
  nameTranslationKey: 'layers.normal',
  name: 'Fallback layer title',
  thumbnail: '/thumbnail.png',
}

const accordionLayer: ListedLayerMenuItem = {
  id: 'accordion-layer',
  type: 'accordion',
  menuOrderLevel: LayerOrderLevel.BACKGROUND,
  translationNs: 'test-ns',
  titleTranslationKey: 'layers.accordion',
  title: 'Fallback accordion title',
  ariaLabelTranslationKey: 'layers.accordion.aria',
  defaultExpanded: true,
  content: <div>Accordion body</div>,
}

const renderWithTheme = (items: ListedLayerMenuItem[]) => {
  return render(
    <ThemeProvider theme={theme}>
      <LayerMenuContent
        headerLabel="Layers"
        items={items}
        visibleLayerGroupIds={[]}
        opacityLabel="Opacity"
        onToggleLayer={() => {}}
        onClose={() => {}}
      />
    </ThemeProvider>
  )
}

describe('LayerMenuContent', () => {
  it('renders standalone and accordion titles through Tolgee JSX targets', () => {
    renderWithTheme([normalLayer, accordionLayer])

    expect(screen.getByText('test-ns:layers.normal')).toHaveAttribute(
      'data-key-name',
      'layers.normal'
    )
    expect(screen.getByText('test-ns:layers.accordion')).toHaveAttribute(
      'data-key-name',
      'layers.accordion'
    )
    expect(screen.queryByText('Fallback layer title')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Fallback accordion title')
    ).not.toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'Toggle layer test-ns:layers.normal',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'test-ns:layers.accordion.aria',
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: 'test-ns:layers.normal' })
    ).toBeInTheDocument()
  })

  it('hides the bottom separator when the final menu item is an accordion', () => {
    renderWithTheme([normalLayer, accordionLayer])

    expect(screen.getByRole('region')).not.toHaveStyle({
      borderBottom: '1px solid #D6D6D6',
    })
  })
})
