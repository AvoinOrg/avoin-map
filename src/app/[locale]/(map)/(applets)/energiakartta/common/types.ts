export type EnergymapSelectedBuildingProperties = Record<string, unknown>

export type EnergymapSelectedBuilding = {
  id: string
  buildingKey: string
  source: string
  sourceLayer: string
  layerId: string
  properties: EnergymapSelectedBuildingProperties
}
