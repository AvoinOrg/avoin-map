'use client'

import React from 'react'

import type { ComponentFixture } from '#/common/component-fixtures/types'
import { Box } from '#/common/style/theme'
import { useUIStore } from '#/common/store'
import type { PopupProps } from '#/common/types/map'
import AreaModalAdmin from 'applets/luonnonmetsakartat/components/AreaModalAdmin'
import FolayerImportPictures from 'applets/luonnonmetsakartat/components/FolayerImportPictures'
import {
  FolayerConfState,
  type FolayerAreaConf,
  type FolayerFeature,
  type FolayerFeatureProperties,
} from 'applets/luonnonmetsakartat/common/types'
import { useAppletStore } from 'applets/luonnonmetsakartat/state/appletStore'

type AreaModalFeature =
  PopupProps<FolayerFeatureProperties>['features'][number]

const fixtureFolayerId = 'fixture-admin-forest-layer'

const desktopMapDims = { width: 960, height: 640, centerX: 480, centerY: 320 }
const mobileMapDims = { width: 360, height: 560, centerX: 180, centerY: 280 }

const getFixtureMapDims = () => {
  const isMobile =
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 599px)').matches

  return isMobile ? mobileMapDims : desktopMapDims
}

const fixturePictures = [
  '/files/img/green-drawings/forest.jpg',
  '/files/img/green-drawings/fallen-trees.jpg',
  '/files/img/green-drawings/tree.jpg',
]
const longAreaMunicipality = 'Pohjois-Karjalan Pitkanimen Kunta'
const longAreaName =
  'Vanhan Kuusikon Suojelumetsa Ja Lahopuuvaltainen Korpialue'
const defaultAreaDescription =
  'Fixture description exercises the editable admin area modal with wrapped text and gallery content without depending on live map data.'
const longAreaDescription = [
  'Pitka fixture description varmistaa, etta hallinnan muokkausmodaalin tekstikentat, rivittyva kuvaus ja alatunniste pysyvat kaytettavina myos kapeassa nakymassa.',
  'Kuvauksessa on useita lauseita, jotta tekstialueen korkeus ja sisainen vieritys nakyvat ilman live-dataa.',
].join(' ')

const createFeature = ({
  id,
  name,
  municipality,
  region = 'Uusimaa',
  description = defaultAreaDescription,
  pictures = [],
}: {
  id: string
  name: string
  municipality: string
  region?: string
  description?: string
  pictures?: string[]
}): FolayerFeature =>
  ({
    id,
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [24.9384, 60.1699],
    },
    properties: {
      id,
      name,
      created_ts: '2026-01-01T00:00:00.000Z',
      updated_ts: '2026-01-01T00:00:00.000Z',
      area_ha: 12.345,
      date: '2026-01-01',
      region,
      municipality,
      description,
      pictures: pictures as unknown as string,
    },
  }) as FolayerFeature

const fixtureFeatures = [
  createFeature({
    id: 'area-helsinki-keskusmetsa',
    municipality: 'Helsinki',
    name: 'Keskusmetsa',
    pictures: fixturePictures,
  }),
  createFeature({
    id: 'area-turku-rantametsa',
    municipality: 'Turku',
    name: 'Rantametsa',
  }),
  createFeature({
    id: 'area-tampere-lehtorinne',
    municipality: 'Tampere',
    name: 'Lehtorinne',
  }),
  createFeature({
    id: 'area-long-name',
    municipality: longAreaMunicipality,
    name: longAreaName,
    description: longAreaDescription,
  }),
]

const fixtureAreaConf: FolayerAreaConf = {
  id: fixtureFolayerId,
  state: FolayerConfState.Idle,
  data: {
    type: 'FeatureCollection',
    features: fixtureFeatures,
  },
}

const createFixtureFile = (relativePath: string, type = 'image/jpeg') =>
  ({
    name: relativePath.split('/').pop() ?? relativePath,
    type,
    webkitRelativePath: relativePath,
  }) as unknown as File

const matchedAndUnmatchedFiles = [
  createFixtureFile('fixture-pictures/Helsinki,Keskusmetsa/first.jpg'),
  createFixtureFile('fixture-pictures/Helsinki,Keskusmetsa/notes.txt', 'text/plain'),
  createFixtureFile(
    `fixture-pictures/${longAreaMunicipality},${longAreaName}/long-name.jpg`
  ),
  createFixtureFile('fixture-pictures/Missing,Unknown/third.jpg'),
]

const unmatchedOnlyFiles = [
  createFixtureFile('fixture-pictures/Missing,Unknown/third.jpg'),
  createFixtureFile('fixture-pictures/Missing,Unknown/fourth.png', 'image/png'),
]

const PictureFixturePanel = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      width: 640,
      maxWidth: 'calc(100% - 2rem)',
      m: 2,
      p: 3,
      backgroundColor: '#ffffff',
      border: '1px solid #cbd3c9',
      borderRadius: '0.3125rem',
    }}
  >
    {children}
  </Box>
)

const AdminFixtureWrapper = ({ children }: { children: React.ReactNode }) => {
  React.useEffect(() => {
    const previousFolayerAreaConfs = useAppletStore.getState().folayerAreaConfs
    const previousMapDims = useUIStore.getState().mapDims
    const previousPopupModalViewMode =
      useUIStore.getState().popupModalViewMode
    const mapDims = getFixtureMapDims()

    useAppletStore.setState({
      folayerAreaConfs: {
        ...previousFolayerAreaConfs,
        [fixtureFolayerId]: fixtureAreaConf,
      },
    })
    useUIStore.setState({
      mapDims: {
        visible: mapDims,
        min: mapDims,
      },
      popupModalViewMode:
        mapDims.width <= 600 ? 'fullscreen' : 'constrained',
    })

    return () => {
      useAppletStore.setState({
        folayerAreaConfs: previousFolayerAreaConfs,
      })
      useUIStore.setState({
        mapDims: previousMapDims,
        popupModalViewMode: previousPopupModalViewMode,
      })
    }
  }, [])

  return (
    <Box
      data-testid="luonnonmetsakartat-admin-pictures-area-modal-fixture"
      sx={{
        position: 'relative',
        width: { mobile: mobileMapDims.width, desktop: desktopMapDims.width },
        maxWidth: '100%',
        height: { mobile: 620, desktop: 700 },
        overflow: 'hidden',
        backgroundColor: '#e7ece5',
      }}
    >
      {children}
    </Box>
  )
}

const renderPictureFixture = (
  fixtureState?: React.ComponentProps<typeof FolayerImportPictures>['fixtureState']
) => (
  <PictureFixturePanel>
    <FolayerImportPictures
      folayerId={fixtureFolayerId}
      fixtureState={fixtureState}
    />
  </PictureFixturePanel>
)

const LightboxImageReadyMarker = ({ src }: { src: string }) => {
  const [isReady, setIsReady] = React.useState(false)

  React.useEffect(() => {
    const image = new Image()
    image.onload = () => setIsReady(true)
    image.onerror = () => setIsReady(true)
    image.src = src
  }, [src])

  if (!isReady) {
    return null
  }

  return (
    <Box
      data-testid="luonnonmetsakartat-admin-area-modal-lightbox-ready"
      sx={{
        position: 'absolute',
        width: 1,
        height: 1,
        opacity: 0,
        pointerEvents: 'none',
      }}
    />
  )
}

type AdminModalFixtureOptions = React.ComponentProps<
  typeof AreaModalAdmin
>['fixtureState'] & {
  featureId?: string
}

const renderAdminModalFixture = (options: AdminModalFixtureOptions = {}) => {
  const { featureId, ...fixtureState } = options
  const selectedFeature =
    fixtureFeatures.find((fixtureFeature) => fixtureFeature.id === featureId) ??
    fixtureFeatures[0]

  return (
    <>
      {fixtureState.lightboxIndex != null && fixtureState.lightboxIndex >= 0 && (
        <LightboxImageReadyMarker
          src={fixturePictures[fixtureState.lightboxIndex] ?? fixturePictures[0]}
        />
      )}
      <AreaModalAdmin
        folayerId={fixtureFolayerId}
        features={[selectedFeature as AreaModalFeature]}
        fixtureState={fixtureState}
        onClose={() => undefined}
      />
    </>
  )
}

const adminAreaModalWaitFor =
  '[data-testid="luonnonmetsakartat-admin-area-modal"]'
const pictureMappingListWaitFor =
  '[data-testid="folayer-import-pictures-mapping-list"]'
const adminAreaModalLightboxWaitFor =
  '[data-testid="luonnonmetsakartat-admin-area-modal-lightbox-ready"]'

export const luonnonmetsakartatAdminPicturesAreaModalFixture: ComponentFixture = {
  id: 'luonnonmetsakartat-admin-pictures-area-modal',
  label: 'Luonnonmetsakartat admin pictures and area modal',
  locale: 'fi',
  description:
    'Natural forest admin picture mapping and editable area modal states for F047.13.5 remigration coverage.',
  sourceGlobs: [
    'src/applets/luonnonmetsakartat/components/FolayerImportPictures.tsx',
    'src/applets/luonnonmetsakartat/components/AreaModalAdmin.tsx',
    'src/applets/luonnonmetsakartat/pages/admin/taso/folayer/kuvat/page.tsx',
    'src/common/component-fixtures/fixtures/LuonnonmetsakartatAdminPicturesAreaModalFixture.tsx',
  ],
  wrapper: AdminFixtureWrapper,
  canvasSx: {
    p: 0,
    border: 'none',
    backgroundColor: 'transparent',
  },
  states: [
    {
      id: 'pictures-empty',
      label: 'Pictures empty',
      description: 'Folder upload control before a directory has been selected.',
      waitFor:
        '[data-testid="luonnonmetsakartat-admin-pictures-area-modal-fixture"]',
      render: () => renderPictureFixture(),
    },
    {
      id: 'pictures-matched-unmatched',
      label: 'Pictures matched and unmatched',
      description:
        'Selected folder with image-only filtering, automatic matches, and unmatched summary.',
      waitFor: pictureMappingListWaitFor,
      render: () =>
        renderPictureFixture({
          files: matchedAndUnmatchedFiles,
          selectedFolderLabel: 'fixture-pictures',
        }),
    },
    {
      id: 'pictures-manual-mapping',
      label: 'Pictures manual mapping',
      description:
        'Previously unmatched folder manually mapped to a known natural forest area.',
      waitFor: pictureMappingListWaitFor,
      render: () =>
        renderPictureFixture({
          files: unmatchedOnlyFiles,
          selectedFolderLabel: 'fixture-pictures',
          manualMappings: {
            'Missing,Unknown': 'area-tampere-lehtorinne',
          },
        }),
    },
    {
      id: 'pictures-options-open',
      label: 'Pictures options open',
      description: 'Area combobox open with selectable area options.',
      waitFor: '[data-slot="area-select-popup"]',
      render: () =>
        renderPictureFixture({
          files: unmatchedOnlyFiles,
          selectedFolderLabel: 'fixture-pictures',
          openFolder: 'Missing,Unknown',
        }),
    },
    {
      id: 'pictures-no-options',
      label: 'Pictures no options',
      description: 'Area combobox open with no matching area options.',
      waitFor: '[data-slot="area-select-empty"]',
      render: () =>
        renderPictureFixture({
          files: unmatchedOnlyFiles,
          selectedFolderLabel: 'fixture-pictures',
          openFolder: 'Missing,Unknown',
          inputValueByFolder: {
            'Missing,Unknown': 'zzzzzz',
          },
        }),
    },
    {
      id: 'area-modal-editable',
      label: 'Area modal editable',
      description: 'Editable admin area modal with existing gallery pictures.',
      waitFor: adminAreaModalWaitFor,
      render: () => renderAdminModalFixture(),
    },
    {
      id: 'area-modal-unsynced',
      label: 'Area modal unsynced',
      description:
        'Admin area modal with unsynced save footer visible and long editable content.',
      waitFor: adminAreaModalWaitFor,
      render: () =>
        renderAdminModalFixture({
          featureId: 'area-long-name',
          unsyncedChanges: true,
        }),
    },
    {
      id: 'area-modal-loading',
      label: 'Area modal loading',
      description: 'Admin area modal with save loading overlay visible.',
      waitFor: adminAreaModalWaitFor,
      render: () =>
        renderAdminModalFixture({
          unsyncedChanges: true,
          isUpdating: true,
        }),
    },
    {
      id: 'area-modal-lightbox',
      label: 'Area modal lightbox',
      description: 'Admin area modal with gallery lightbox open.',
      waitFor: adminAreaModalLightboxWaitFor,
      render: () => renderAdminModalFixture({ lightboxIndex: 0 }),
    },
  ],
}
