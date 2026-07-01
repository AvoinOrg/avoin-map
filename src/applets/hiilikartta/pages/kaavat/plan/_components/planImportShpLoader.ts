import {
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
} from 'geojson'

type ZipFileEntry = {
  name: string
  dir: boolean
  async: {
    (type: 'arraybuffer'): Promise<ArrayBuffer>
    (type: 'text'): Promise<string>
  }
}

type BrowserShpParser = {
  parseShp: (shp: ArrayBuffer, prj?: string) => Geometry[]
  parseDbf: (
    dbf: ArrayBuffer,
    cpg?: string
  ) => GeoJsonProperties[]
  combine: (
    arr: [ReadonlyArray<Geometry>, ReadonlyArray<GeoJsonProperties>]
  ) => FeatureCollection
}

const ensureBrowserGlobalAlias = () => {
  if (typeof globalThis === 'undefined' || 'global' in globalThis) {
    return
  }

  // shpjs still reads Node-style globals in the Vite browser bundle.
  Object.defineProperty(globalThis, 'global', {
    value: globalThis,
    configurable: true,
    writable: true,
  })
}

const getZipEntryExtension = (fileName: string) =>
  fileName.split('.').pop()?.toLowerCase()

const getZipEntryBaseName = (fileName: string) =>
  fileName.replace(/\.[^/.]+$/, '')

const findZipEntry = ({
  files,
  baseName,
  extension,
}: {
  files: ZipFileEntry[]
  baseName: string
  extension: string
}) => {
  const normalizedName = `${baseName}.${extension}`.toLowerCase()
  return files.find((file) => file.name.toLowerCase() === normalizedName)
}

export const loadShapefileZip = async (
  fileBuffer: ArrayBuffer
): Promise<FeatureCollection> => {
  ensureBrowserGlobalAlias()

  const [{ default: shp }, { default: JSZip }] = await Promise.all([
    import('shpjs'),
    import('jszip'),
  ])
  const zip = await JSZip.loadAsync(fileBuffer)
  const files = Object.values(zip.files).filter(
    (file) => !file.dir
  ) as ZipFileEntry[]
  const shapeFiles = files.filter(
    (file) => getZipEntryExtension(file.name) === 'shp'
  )

  if (shapeFiles.length === 0) {
    throw new Error('No Shapefile .shp entry found in zip')
  }

  const shpParser = shp as unknown as BrowserShpParser
  const featureCollections: FeatureCollection[] = await Promise.all(
    shapeFiles.map(async (shapeFile) => {
      const baseName = getZipEntryBaseName(shapeFile.name)
      const dbfFile = findZipEntry({
        files,
        baseName,
        extension: 'dbf',
      })
      const prjFile = findZipEntry({
        files,
        baseName,
        extension: 'prj',
      })
      const cpgFile = findZipEntry({
        files,
        baseName,
        extension: 'cpg',
      })
      const [shapeBuffer, dbfBuffer, prjText, cpgText] = await Promise.all([
        shapeFile.async('arraybuffer'),
        dbfFile?.async('arraybuffer'),
        prjFile?.async('text'),
        cpgFile?.async('text'),
      ])
      const geometries = shpParser.parseShp(
        shapeBuffer as ArrayBuffer,
        typeof prjText === 'string' ? prjText : undefined
      )
      const properties =
        dbfBuffer == null
          ? []
          : shpParser.parseDbf(
              dbfBuffer as ArrayBuffer,
              typeof cpgText === 'string' ? cpgText : undefined
            )

      return shpParser.combine([geometries, properties])
    })
  )

  return {
    type: 'FeatureCollection',
    features: featureCollections.flatMap(
      (collection) => collection.features
    ),
  }
}
