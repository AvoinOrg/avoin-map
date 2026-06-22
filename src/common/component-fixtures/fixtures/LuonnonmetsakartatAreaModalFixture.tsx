'use client'

import React from 'react'

import type { ComponentFixture } from '#/common/component-fixtures/types'
import { Box } from '#/common/style/theme'
import { useUIStore } from '#/common/store'
import type { PopupProps } from '#/common/types/map'
import AreaModal from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/components/AreaModal'
import type { FolayerFeatureProperties } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/types'

type AreaModalFeature =
  PopupProps<FolayerFeatureProperties>['features'][number]

const desktopMapDims = { width: 960, height: 640, centerX: 480, centerY: 320 }
const mobileMapDims = { width: 360, height: 560, centerX: 180, centerY: 280 }

const getFixtureMapDims = () => {
  const isMobile =
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 599px)').matches

  return isMobile ? mobileMapDims : desktopMapDims
}

const createFeature = (
  properties: FolayerFeatureProperties
): AreaModalFeature =>
  ({
    id: properties.id,
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [24.9384, 60.1699],
    },
    properties,
  }) as AreaModalFeature

const fixturePictures = [
  '/files/img/green-drawings/forest.jpg',
  '/files/img/green-drawings/fallen-trees.jpg',
  '/files/img/green-drawings/tree.jpg',
]

const baseProperties = {
  id: 'luonnonmetsakartat-fixture-area',
  name: 'Testimetsa Pitka Luonnonmetsakohde',
  created_ts: '2026-01-01T00:00:00.000Z',
  updated_ts: '2026-01-01T00:00:00.000Z',
  area_ha: 12.345,
  date: '2026-01-01',
  region: 'Uusimaa',
  municipality: 'Helsinki',
  description:
    'Fixture description covers the public modal body copy with enough length to exercise wrapping, row height, and the dark modal text hierarchy without depending on live map data.',
}

const featureWithPictures = createFeature({
  ...baseProperties,
  pictures: JSON.stringify(fixturePictures),
} as FolayerFeatureProperties)

const featureWithoutPictures = createFeature({
  ...baseProperties,
  id: 'luonnonmetsakartat-fixture-area-without-pictures',
  name: 'Kuvaton Luonnonmetsakohde',
  pictures: JSON.stringify([]),
} as FolayerFeatureProperties)

const AreaModalFixtureShell = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [mapDims, setMapDims] = React.useState(desktopMapDims)
  const [hasResolvedViewport, setHasResolvedViewport] = React.useState(false)
  const seededMapDims = useUIStore((state) => state.mapDims.min)
  const isReady =
    hasResolvedViewport &&
    seededMapDims?.width === mapDims.width &&
    seededMapDims.height === mapDims.height &&
    seededMapDims.centerX === mapDims.centerX &&
    seededMapDims.centerY === mapDims.centerY

  React.useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setMapDims(getFixtureMapDims())
      setHasResolvedViewport(true)
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [])

  React.useEffect(() => {
    if (!hasResolvedViewport) {
      return
    }

    const previousMapDims = useUIStore.getState().mapDims
    const previousPopupModalViewMode =
      useUIStore.getState().popupModalViewMode

    useUIStore.setState({
      mapDims: {
        visible: mapDims,
        min: mapDims,
      },
      popupModalViewMode:
        mapDims.width <= 800 ? 'fullscreen' : 'constrained',
    })

    return () => {
      useUIStore.setState({
        mapDims: previousMapDims,
        popupModalViewMode: previousPopupModalViewMode,
      })
    }
  }, [hasResolvedViewport, mapDims])

  return (
    <Box
      data-testid={
        isReady
          ? 'luonnonmetsakartat-area-modal-fixture'
          : 'luonnonmetsakartat-area-modal-fixture-loading'
      }
      sx={{
        position: 'relative',
        width: mapDims.width,
        maxWidth: '100%',
        height: mapDims.height,
        overflow: 'hidden',
        backgroundColor: '#e7ece5',
      }}
    >
      {isReady ? children : null}
    </Box>
  )
}

const CloseableAreaModal = ({
  features,
}: Pick<PopupProps<FolayerFeatureProperties>, 'features'>) => {
  const [isOpen, setIsOpen] = React.useState(true)

  if (!isOpen) {
    return (
      <Box
        data-testid="luonnonmetsakartat-area-modal-closed"
        sx={{
          p: 2,
          color: '#111111',
          backgroundColor: '#ffffff',
        }}
      >
        Closed
      </Box>
    )
  }

  return <AreaModal features={features} onClose={() => setIsOpen(false)} />
}

export const luonnonmetsakartatAreaModalFixture: ComponentFixture = {
  id: 'luonnonmetsakartat-area-modal',
  label: 'Luonnonmetsakartat area modal',
  locale: 'fi',
  description:
    'Public Luonnonmetsakartat map modal states for F047 remigration coverage.',
  sourceGlobs: [
    'src/app/[locale]/(map)/(applets)/luonnonmetsakartat/components/AreaModal.tsx',
    'src/common/component-fixtures/fixtures/LuonnonmetsakartatAreaModalFixture.tsx',
  ],
  wrapper: AreaModalFixtureShell,
  canvasSx: {
    p: 0,
    border: 'none',
    backgroundColor: 'transparent',
  },
  states: [
    {
      id: 'with-pictures',
      label: 'With pictures',
      description:
        'Public area modal with description text, carousel arrows, and dots.',
      waitFor: '[data-testid="luonnonmetsakartat-area-modal-fixture"]',
      render: () => (
        <CloseableAreaModal features={[featureWithPictures]} />
      ),
    },
    {
      id: 'without-pictures',
      label: 'Without pictures',
      description:
        'Public area modal using the narrower no-picture width threshold.',
      waitFor: '[data-testid="luonnonmetsakartat-area-modal-fixture"]',
      render: () => (
        <CloseableAreaModal features={[featureWithoutPictures]} />
      ),
    },
    {
      id: 'no-feature',
      label: 'No feature',
      description:
        'Fallback content when the public modal receives no selected feature.',
      waitFor: '[data-testid="luonnonmetsakartat-area-modal-fixture"]',
      render: () => <CloseableAreaModal features={[]} />,
    },
  ],
}
