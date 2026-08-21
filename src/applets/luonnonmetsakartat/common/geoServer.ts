import {
  appendPublicGeoServerPath,
  resolvePublicGeoServerWithWorkspace,
  type PublicGeoServerEnv,
  type PublicGeoServerProblemReporter,
} from '#/common/config/publicGeoServer'

import { isLuonnonmetsakartatMockScenariosEnabled } from './mockScenarios/config'

const MOCK_GEOSERVER_URL = '/api/luonnonmetsakartat/geoserver'
const MOCK_GEOSERVER_WORKSPACE = 'mock'

type FolayerGeoServerOptions = {
  env?: PublicGeoServerEnv
  mockScenariosEnabled?: boolean
  reportProblem?: PublicGeoServerProblemReporter
}

type FolayerGeoServerSource = {
  baseUrl: string
  workspace: string
  isMock: boolean
}

export const resolveFolayerGeoServerSource = ({
  env,
  mockScenariosEnabled = isLuonnonmetsakartatMockScenariosEnabled(),
  reportProblem,
}: FolayerGeoServerOptions = {}): FolayerGeoServerSource | undefined => {
  if (mockScenariosEnabled) {
    return {
      baseUrl: MOCK_GEOSERVER_URL,
      workspace: MOCK_GEOSERVER_WORKSPACE,
      isMock: true,
    }
  }

  const config = resolvePublicGeoServerWithWorkspace({ env, reportProblem })
  if (!config) {
    return undefined
  }

  return {
    ...config,
    isMock: false,
  }
}

const appendFolayerGeoServerPath = ({
  source,
  path,
  reportProblem,
}: {
  source: FolayerGeoServerSource
  path: string
  reportProblem?: PublicGeoServerProblemReporter
}) => {
  if (!source.isMock) {
    return appendPublicGeoServerPath({
      baseUrl: source.baseUrl,
      path,
      reportProblem,
    })
  }

  const pathWithoutLeadingSlash = path.replace(/^\/+/, '')
  const url = `${source.baseUrl}/${pathWithoutLeadingSlash}`
  const parsedUrl = new URL(url, 'https://mock-geoserver.local')
  if (
    parsedUrl.hostname.toLowerCase().includes('undefined') ||
    parsedUrl.pathname.toLowerCase().includes('undefined')
  ) {
    return undefined
  }

  return url
}

export const buildFolayerTileUrl = ({
  sourceLayer,
  ...options
}: FolayerGeoServerOptions & { sourceLayer: string }) => {
  const source = resolveFolayerGeoServerSource(options)
  if (!source) {
    return undefined
  }

  return appendFolayerGeoServerPath({
    source,
    path: `gwc/service/tms/1.0.0/${source.workspace}:${sourceLayer}@EPSG:900913@pbf/{z}/{x}/{y}.pbf`,
    reportProblem: options.reportProblem,
  })
}

export const buildFolayerWfsUrl = ({
  centroidSourceLayer,
  ...options
}: FolayerGeoServerOptions & { centroidSourceLayer: string }) => {
  const source = resolveFolayerGeoServerSource(options)
  if (!source) {
    return undefined
  }

  return appendFolayerGeoServerPath({
    source,
    path: `${source.workspace}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${source.workspace}:${centroidSourceLayer}&outputFormat=application/json&srsName=EPSG:4326`,
    reportProblem: options.reportProblem,
  })
}
