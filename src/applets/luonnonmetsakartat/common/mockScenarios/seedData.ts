import type { FolayerImportPicturesFixtureState } from 'applets/luonnonmetsakartat/components/FolayerImportPictures'
import { createLuonnonmetsakartatMockSeedLayers } from '../mockDataSeed'
import {
  AdminFolayerConf,
  FolayerAreaConf,
  FolayerConf,
  FolayerConfState,
  FolayerFeature,
} from '../types'
import {
  MOCK_VISIBLE_AREA_WITHOUT_PICTURES_ID,
  MOCK_VISIBLE_AREA_WITH_PICTURES_ID,
} from './ids'

export const LUONNONMETSAKARTAT_MOCK_PICTURE_ROOT = 'mock-pictures'
export const LUONNONMETSAKARTAT_MOCK_MATCHED_PICTURE_FOLDER =
  'Espoo,Mock Ridge Forest'
export const LUONNONMETSAKARTAT_MOCK_UNMATCHED_PICTURE_FOLDER =
  'Helsinki,Unknown Mock Forest'

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const getSeedLayers = () => deepClone(createLuonnonmetsakartatMockSeedLayers())

const parsePictures = (pictures: unknown) => {
  if (Array.isArray(pictures)) {
    return pictures.filter((picture): picture is string =>
      typeof picture === 'string'
    )
  }

  if (typeof pictures !== 'string') {
    return undefined
  }

  try {
    const parsed: unknown = JSON.parse(pictures)

    return Array.isArray(parsed)
      ? parsed.filter((picture): picture is string =>
          typeof picture === 'string'
        )
      : undefined
  } catch {
    return undefined
  }
}

const createClientAreaFeature = (feature: FolayerFeature): FolayerFeature => {
  const properties = {
    ...feature.properties,
  } as unknown as Record<string, unknown>
  const pictures = parsePictures(properties.pictures)

  if (pictures) {
    properties.pictures = pictures
  }

  return {
    ...feature,
    id: feature.properties.id || feature.id,
    properties: properties as unknown as FolayerFeature['properties'],
  }
}

export const createLuonnonmetsakartatMockPublicFolayerConfs =
  (): FolayerConf[] =>
    getSeedLayers()
      .filter((layer) => !layer.is_hidden)
      .map((layer) => ({
        id: layer.id,
        name: layer.name,
        description: layer.description,
        createdTs: layer.created_ts * 1000,
        updatedTs: layer.updated_ts * 1000,
        colorCode: layer.color_code,
      }))

export const createLuonnonmetsakartatMockAdminFolayerConfs =
  (): AdminFolayerConf[] =>
    getSeedLayers().map((layer) => ({
      id: layer.id,
      name: layer.name,
      description: layer.description,
      colorCode: layer.color_code,
      isVisible: !layer.is_hidden,
      state: FolayerConfState.Idle,
      createdTs: layer.created_ts,
      updatedTs: layer.updated_ts,
      unsyncedChanges: false,
      colOptions: layer.col_options,
    }))

export const createLuonnonmetsakartatMockFolayerAreaConfs =
  (): FolayerAreaConf[] =>
    getSeedLayers().map((layer) => ({
      id: layer.id,
      state: FolayerConfState.Idle,
      data: {
        type: 'FeatureCollection',
        features: layer.areas.features.map(createClientAreaFeature),
      },
    }))

const createMockPictureFile = ({
  fileName,
  folderName,
}: {
  fileName: string
  folderName: string
}) => {
  const webkitRelativePath = `${LUONNONMETSAKARTAT_MOCK_PICTURE_ROOT}/${folderName}/${fileName}`
  const file =
    typeof File === 'function'
      ? new File(['mock image'], fileName, {
          lastModified: 1_735_776_000_000,
          type: 'image/jpeg',
        })
      : ({
          arrayBuffer: async () => new ArrayBuffer(0),
          lastModified: 1_735_776_000_000,
          name: fileName,
          size: 10,
          slice: () => new Blob(),
          stream: () => new ReadableStream(),
          text: async () => 'mock image',
          type: 'image/jpeg',
          webkitRelativePath,
        } as File & { webkitRelativePath: string })

  Object.defineProperty(file, 'webkitRelativePath', {
    configurable: true,
    value: webkitRelativePath,
  })

  return file
}

export const createLuonnonmetsakartatMockPicturesMappedFixtureState =
  (): FolayerImportPicturesFixtureState => ({
    files: [
      createMockPictureFile({
        fileName: 'ridge-1.jpg',
        folderName: LUONNONMETSAKARTAT_MOCK_MATCHED_PICTURE_FOLDER,
      }),
      createMockPictureFile({
        fileName: 'ridge-2.jpg',
        folderName: LUONNONMETSAKARTAT_MOCK_MATCHED_PICTURE_FOLDER,
      }),
      createMockPictureFile({
        fileName: 'grove-1.jpg',
        folderName: 'Lohja,Mock Lakeside Grove',
      }),
    ],
    selectedFolderLabel: LUONNONMETSAKARTAT_MOCK_PICTURE_ROOT,
    manualMappings: {},
  })

export const createLuonnonmetsakartatMockPicturesUnmatchedFixtureState =
  (): FolayerImportPicturesFixtureState => ({
    files: [
      createMockPictureFile({
        fileName: 'unknown-1.jpg',
        folderName: LUONNONMETSAKARTAT_MOCK_UNMATCHED_PICTURE_FOLDER,
      }),
      createMockPictureFile({
        fileName: 'ridge-1.jpg',
        folderName: LUONNONMETSAKARTAT_MOCK_MATCHED_PICTURE_FOLDER,
      }),
    ],
    selectedFolderLabel: LUONNONMETSAKARTAT_MOCK_PICTURE_ROOT,
    manualMappings: {
      [LUONNONMETSAKARTAT_MOCK_UNMATCHED_PICTURE_FOLDER]: null,
    },
    openFolder: LUONNONMETSAKARTAT_MOCK_UNMATCHED_PICTURE_FOLDER,
    inputValueByFolder: {
      [LUONNONMETSAKARTAT_MOCK_UNMATCHED_PICTURE_FOLDER]: 'Unknown',
    },
  })

export const LUONNONMETSAKARTAT_MOCK_AREA_IDS = [
  MOCK_VISIBLE_AREA_WITH_PICTURES_ID,
  MOCK_VISIBLE_AREA_WITHOUT_PICTURES_ID,
] as const
