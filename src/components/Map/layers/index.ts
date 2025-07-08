// Exports the layer configurations to the Map component.

import buildingEnergyCertificates from './main/Buildings/BuildingEnergyCertificates'
// import finlandBuildings from './Buildings/finlandBuildings'
import hsySolarpotential from './main/Buildings/HsySolarPotential'
import helsinkiBuildings from './main/Buildings/HelsinkiBuildings'
import snowCoverLoss from './main/SnowCoverLoss'
import airQuality from './main/AirQuality'
import finlandBogs from './main/Wetlands/FinlandBogs'
import ciforPeatlands from './main/Wetlands/CiforPeatlands'
import ciforWetlands from './main/Wetlands/CiforWetlands'
import metsaanEteBasic from './main/Biodiversity/MetsaanEteBasic'
import metsaanEteImportant from './main/Biodiversity/MetsaanEteImportant'
import zonation from './main/Biodiversity/Zonation'
import natura2000 from './main/Biodiversity/Natura2000'
import hansen from './main/Forests/Hansen'
import finlandMatureForests from './main/Forests/FinlandMatureForests'
import mangroveForests from './main/Forests/MangroveForests'
import treePlantations from './main/Forests/TreePlantations'
import terramonitor from './extras/Terramonitor'

export const layerConfs = [
  buildingEnergyCertificates,
  snowCoverLoss,
  airQuality,
  hsySolarpotential,
  helsinkiBuildings,
  finlandBogs,
  ciforPeatlands,
  ciforWetlands,
  metsaanEteBasic,
  metsaanEteImportant,
  zonation,
  natura2000,
  hansen,
  finlandMatureForests,
  mangroveForests,
  treePlantations,
  terramonitor,
]
