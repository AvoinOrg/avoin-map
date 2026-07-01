import { QueryClient } from '@tanstack/react-query'

import { MOCK_AUTH_USER_ID } from '#/common/auth/mock'
import { useAppletStore } from 'applets/luonnonmetsakartat/state/appletStore'

import {
  AdminVerificationStatus,
  FolayerConfState,
} from '../types'
import {
  MOCK_EMPTY_LAYER_ID,
  MOCK_HIDDEN_AREA_ID,
  MOCK_HIDDEN_LAYER_ID,
  MOCK_VISIBLE_AREA_WITHOUT_PICTURES_ID,
  MOCK_VISIBLE_AREA_WITH_PICTURES_ID,
  MOCK_VISIBLE_LAYER_ID,
} from './ids'
import {
  LUONNONMETSAKARTAT_MOCK_MATCHED_PICTURE_FOLDER,
  LUONNONMETSAKARTAT_MOCK_UNMATCHED_PICTURE_FOLDER,
} from './seedData'
import {
  SCENARIO_STATES,
  applyLuonnonmetsakartatMockScenarioState,
  buildLuonnonmetsakartatMockScenarioState,
  normalizeLuonnonmetsakartatMockScenarioState,
} from './scenarios'

const resetAppletStoreForTests = () => {
  useAppletStore.setState({
    folayerConfs: {},
    adminFolayerConfs: {},
    folayerAreaConfs: {},
    adminVerificationStatus: AdminVerificationStatus.NoUser,
  })
}

describe('Luonnonmetsakartat mock scenarios', () => {
  beforeEach(() => {
    resetAppletStoreForTests()
  })

  afterEach(() => {
    resetAppletStoreForTests()
  })

  it('normalizes scenario state names and aliases', () => {
    expect(normalizeLuonnonmetsakartatMockScenarioState(' Public_Layers ')).toBe(
      'public-layers'
    )
    expect(normalizeLuonnonmetsakartatMockScenarioState('admin')).toBe(
      'admin-layers'
    )
    expect(normalizeLuonnonmetsakartatMockScenarioState('layer')).toBe(
      'layer-detail'
    )
    expect(normalizeLuonnonmetsakartatMockScenarioState('settings')).toBe(
      'settings-clean'
    )
    expect(normalizeLuonnonmetsakartatMockScenarioState('pictures')).toBe(
      'pictures-mapped'
    )
    expect(normalizeLuonnonmetsakartatMockScenarioState('empty')).toBeNull()
    expect(
      normalizeLuonnonmetsakartatMockScenarioState('unknown-state')
    ).toBeNull()
  })

  it.each(SCENARIO_STATES)('builds a full store and query patch for %s', (state) => {
    const builtState = buildLuonnonmetsakartatMockScenarioState(state)

    expect(builtState?.state).toBe(state)
    expect(builtState?.storeState).toEqual(
      expect.objectContaining({
        folayerConfs: expect.any(Object),
        adminFolayerConfs: expect.any(Object),
        folayerAreaConfs: expect.any(Object),
        adminVerificationStatus: expect.any(String),
      })
    )
    expect(builtState?.queryData.length).toBeGreaterThan(0)
  })

  it('builds public layer state with only visible server-compatible layers', () => {
    const builtState = buildLuonnonmetsakartatMockScenarioState('public-layers')
    const folayerConfs = builtState?.storeState.folayerConfs ?? {}

    expect(Object.keys(folayerConfs).sort()).toEqual(
      [MOCK_EMPTY_LAYER_ID, MOCK_VISIBLE_LAYER_ID].sort()
    )
    expect(folayerConfs[MOCK_VISIBLE_LAYER_ID]).toEqual(
      expect.objectContaining({
        id: MOCK_VISIBLE_LAYER_ID,
        name: 'Mock visible forest layer',
        colorCode: '#2f855a',
        createdTs: 1_735_689_600_000,
        updatedTs: 1_735_776_000_000,
      })
    )
    expect(folayerConfs[MOCK_HIDDEN_LAYER_ID]).toBeUndefined()
  })

  it('builds admin layer state with visible, hidden, and empty layer records', () => {
    const builtState = buildLuonnonmetsakartatMockScenarioState('admin-layers')
    const adminFolayerConfs = builtState?.storeState.adminFolayerConfs ?? {}
    const folayerAreaConfs = builtState?.storeState.folayerAreaConfs ?? {}
    const seededAreaQueryKeys = builtState?.queryData
      .filter(
        (entry) =>
          entry.queryKey[0] === 'adminFolayerAreas' ||
          entry.queryKey[0] === 'folayerAreas'
      )
      .map((entry) => entry.queryKey)

    expect(Object.keys(adminFolayerConfs).sort()).toEqual(
      [MOCK_EMPTY_LAYER_ID, MOCK_HIDDEN_LAYER_ID, MOCK_VISIBLE_LAYER_ID].sort()
    )
    expect(Object.keys(folayerAreaConfs).sort()).toEqual(
      [MOCK_EMPTY_LAYER_ID, MOCK_HIDDEN_LAYER_ID, MOCK_VISIBLE_LAYER_ID].sort()
    )
    expect(adminFolayerConfs[MOCK_VISIBLE_LAYER_ID]).toEqual(
      expect.objectContaining({
        id: MOCK_VISIBLE_LAYER_ID,
        name: 'Mock visible forest layer',
        colorCode: '#2f855a',
        createdTs: 1_735_689_600,
        updatedTs: 1_735_776_000,
        isVisible: true,
        state: FolayerConfState.Idle,
        unsyncedChanges: false,
      })
    )
    expect(adminFolayerConfs[MOCK_HIDDEN_LAYER_ID].isVisible).toBe(false)
    expect(adminFolayerConfs[MOCK_HIDDEN_LAYER_ID].colOptions).toEqual(
      expect.objectContaining({
        indexingStrategy: 'id',
      })
    )
    expect(
      folayerAreaConfs[MOCK_VISIBLE_LAYER_ID].data.features.map(
        (feature) => feature.id
      )
    ).toEqual([
      MOCK_VISIBLE_AREA_WITH_PICTURES_ID,
      MOCK_VISIBLE_AREA_WITHOUT_PICTURES_ID,
    ])
    expect(
      folayerAreaConfs[MOCK_HIDDEN_LAYER_ID].data.features.map(
        (feature) => feature.id
      )
    ).toEqual([MOCK_HIDDEN_AREA_ID])
    expect(folayerAreaConfs[MOCK_EMPTY_LAYER_ID].data.features).toEqual([])
    expect(seededAreaQueryKeys).toEqual(
      expect.arrayContaining([
        ['adminFolayerAreas', MOCK_VISIBLE_LAYER_ID],
        ['adminFolayerAreas', MOCK_HIDDEN_LAYER_ID],
        ['adminFolayerAreas', MOCK_EMPTY_LAYER_ID],
        ['folayerAreas', MOCK_VISIBLE_LAYER_ID],
        ['folayerAreas', MOCK_HIDDEN_LAYER_ID],
        ['folayerAreas', MOCK_EMPTY_LAYER_ID],
      ])
    )
    expect(builtState?.storeState.adminVerificationStatus).toBe(
      AdminVerificationStatus.Verified
    )
  })

  it('builds area collections with exact seeded area ids and parsed pictures', () => {
    const builtState = buildLuonnonmetsakartatMockScenarioState('public-layers')
    const areaConfs = builtState?.storeState.folayerAreaConfs ?? {}
    const visibleFeatures = areaConfs[MOCK_VISIBLE_LAYER_ID].data.features

    expect(visibleFeatures.map((feature) => feature.id)).toEqual([
      MOCK_VISIBLE_AREA_WITH_PICTURES_ID,
      MOCK_VISIBLE_AREA_WITHOUT_PICTURES_ID,
    ])
    expect(visibleFeatures[0].properties.pictures).toEqual([
      'https://example.org/mock/forest-ridge-1.jpg',
      'https://example.org/mock/forest-ridge-2.jpg',
    ])

    const adminState = buildLuonnonmetsakartatMockScenarioState('layer-detail')
    const queryAreaIds = adminState?.queryData
      .filter((entry) => entry.queryKey[0] === 'adminFolayerAreas')
      .flatMap((entry) => (entry.data as any).data.features.map((feature: any) => feature.id))

    expect(queryAreaIds).toEqual([
      MOCK_VISIBLE_AREA_WITH_PICTURES_ID,
      MOCK_VISIBLE_AREA_WITHOUT_PICTURES_ID,
    ])
    expect(MOCK_HIDDEN_AREA_ID).toBe('mock-hidden-area')
  })

  it.each([
    ['admin-unauthenticated', AdminVerificationStatus.NoUser, false],
    ['admin-rejected', AdminVerificationStatus.Rejected, false],
    ['admin-errored', AdminVerificationStatus.Errored, null],
    ['admin-loading', AdminVerificationStatus.Pending, null],
  ] as const)(
    'builds %s with deterministic admin verification status',
    (state, status, queryValue) => {
      const builtState = buildLuonnonmetsakartatMockScenarioState(state)

      expect(builtState?.storeState.adminVerificationStatus).toBe(status)
      expect(
        builtState?.queryData.find(
          (entry) =>
            entry.queryKey[0] === 'adminVerificationQuery' &&
            entry.queryKey[1] === MOCK_AUTH_USER_ID
        )?.data
      ).toBe(queryValue)
    }
  )

  it('builds settings variants with clean, unsynced, and saving states', () => {
    const clean = buildLuonnonmetsakartatMockScenarioState('settings-clean')
    const unsynced = buildLuonnonmetsakartatMockScenarioState(
      'settings-unsynced'
    )
    const saving = buildLuonnonmetsakartatMockScenarioState('settings-saving')

    expect(
      clean?.storeState.adminFolayerConfs[MOCK_VISIBLE_LAYER_ID]
        .unsyncedChanges
    ).toBe(false)
    expect(
      unsynced?.storeState.adminFolayerConfs[MOCK_VISIBLE_LAYER_ID]
    ).toEqual(
      expect.objectContaining({
        name: 'Mock visible forest layer edited',
        colorCode: '#1f9d55',
        unsyncedChanges: true,
      })
    )
    expect(saving?.storeState.adminFolayerConfs[MOCK_VISIBLE_LAYER_ID]).toEqual(
      expect.objectContaining({
        state: FolayerConfState.Saving,
        unsyncedChanges: true,
      })
    )
  })

  it('builds picture fixture states for mapped and unmatched route coverage', () => {
    const mapped = buildLuonnonmetsakartatMockScenarioState('pictures-mapped')
    const unmatched = buildLuonnonmetsakartatMockScenarioState(
      'pictures-unmatched'
    )

    expect(
      mapped?.pictureFixtureState?.files?.map(
        (file) => (file as File & { webkitRelativePath: string }).webkitRelativePath
      )
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining(LUONNONMETSAKARTAT_MOCK_MATCHED_PICTURE_FOLDER),
      ])
    )
    expect(unmatched?.pictureFixtureState?.manualMappings).toEqual(
      expect.objectContaining({
        [LUONNONMETSAKARTAT_MOCK_UNMATCHED_PICTURE_FOLDER]: null,
      })
    )
    expect(unmatched?.pictureFixtureState?.openFolder).toBe(
      LUONNONMETSAKARTAT_MOCK_UNMATCHED_PICTURE_FOLDER
    )
  })

  it('applies scenario store and query data to each provided query client', () => {
    const client = new QueryClient()
    const duplicateClient = client

    const builtState = applyLuonnonmetsakartatMockScenarioState({
      queryClients: [client, duplicateClient],
      state: 'layer-detail',
    })

    expect(builtState?.state).toBe('layer-detail')
    expect(useAppletStore.getState().adminVerificationStatus).toBe(
      AdminVerificationStatus.Verified
    )
    expect(
      useAppletStore.getState().adminFolayerConfs[MOCK_VISIBLE_LAYER_ID]
    ).toEqual(
      expect.objectContaining({
        id: MOCK_VISIBLE_LAYER_ID,
      })
    )
    expect(client.getQueryData(['adminFolayer', MOCK_VISIBLE_LAYER_ID])).toEqual(
      expect.objectContaining({
        id: MOCK_VISIBLE_LAYER_ID,
      })
    )
    expect(
      client.getQueryData(['adminFolayerAreas', MOCK_VISIBLE_LAYER_ID])
    ).toEqual(
      expect.objectContaining({
        id: MOCK_VISIBLE_LAYER_ID,
      })
    )
  })

  it('keeps unsupported states as no-op builds and applies', () => {
    const client = new QueryClient()

    expect(buildLuonnonmetsakartatMockScenarioState('future-state')).toBeNull()
    expect(
      applyLuonnonmetsakartatMockScenarioState({
        queryClients: client,
        state: 'future-state',
      })
    ).toBeNull()
    expect(useAppletStore.getState().adminFolayerConfs).toEqual({})
    expect(client.getQueryCache().findAll()).toHaveLength(0)
  })
})
