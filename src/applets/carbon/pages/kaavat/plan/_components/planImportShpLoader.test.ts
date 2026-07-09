import JSZip from 'jszip'

import { loadShapefileZip } from './planImportShpLoader'

const parseShp = jest.fn()
const parseDbf = jest.fn()
const combine = jest.fn()

jest.mock('shpjs', () => ({
  __esModule: true,
  default: {
    parseShp,
    parseDbf,
    combine,
  },
}))

describe('loadShapefileZip', () => {
  beforeEach(() => {
    parseShp.mockReset()
    parseDbf.mockReset()
    combine.mockReset()

    parseShp.mockReturnValue([
      {
        type: 'Point',
        coordinates: [24.94, 60.17],
      },
    ])
    parseDbf.mockReturnValue([
      {
        Subtype: 'AK',
        name: 'Central plan',
      },
    ])
    combine.mockImplementation(([geometries, properties]) => ({
      type: 'FeatureCollection',
      features: geometries.map((geometry, index) => ({
        type: 'Feature',
        geometry,
        properties: properties[index] ?? {},
      })),
    }))
  })

  it('loads browser-compatible Shapefile zip entries as ArrayBuffers', async () => {
    const zip = new JSZip()
    zip.file('nested/PLAN.SHP', new Uint8Array([1, 2, 3]))
    zip.file('nested/PLAN.DBF', new Uint8Array([4, 5, 6]))
    zip.file('nested/PLAN.PRJ', 'EPSG:4326')
    zip.file('nested/PLAN.CPG', 'UTF-8')

    const fileBuffer = await zip.generateAsync({ type: 'arraybuffer' })
    const geojson = await loadShapefileZip(fileBuffer)

    expect(parseShp).toHaveBeenCalledWith(
      expect.any(ArrayBuffer),
      'EPSG:4326'
    )
    expect(parseDbf).toHaveBeenCalledWith(
      expect.any(ArrayBuffer),
      'UTF-8'
    )
    expect(geojson.features).toEqual([
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [24.94, 60.17],
        },
        properties: {
          Subtype: 'AK',
          name: 'Central plan',
        },
      },
    ])
    expect('global' in globalThis).toBe(true)
  })

  it('reports zip files without a Shapefile entry', async () => {
    const zip = new JSZip()
    zip.file('plan.dbf', new Uint8Array([4, 5, 6]))

    const fileBuffer = await zip.generateAsync({ type: 'arraybuffer' })

    await expect(loadShapefileZip(fileBuffer)).rejects.toThrow(
      'No Shapefile .shp entry found in zip'
    )
  })
})
