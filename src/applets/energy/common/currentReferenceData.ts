export const CURRENT_REFERENCE_BUILDING_CLASSES = [
  'apartmentBuilding',
  'detachedHouse',
] as const

export type CurrentReferenceBuildingClass =
  (typeof CURRENT_REFERENCE_BUILDING_CLASSES)[number]

export const CURRENT_REFERENCE_ENERGY_CARRIERS = [
  'electricity',
  'districtHeat',
  'lightFuelOil',
  'pellet',
] as const

export type CurrentReferenceEnergyCarrier =
  (typeof CURRENT_REFERENCE_ENERGY_CARRIERS)[number]

export type CurrentReferenceSupportedValue = Readonly<{
  status: 'supported'
  value: number
}>

export type CurrentReferenceUnsupportedValue = Readonly<{
  status: 'unsupported'
  reason: 'not-supplied'
}>

export type CurrentReferenceValue =
  | CurrentReferenceSupportedValue
  | CurrentReferenceUnsupportedValue

type CurrentReferenceFactorsByCarrier = Readonly<
  Record<CurrentReferenceEnergyCarrier, CurrentReferenceValue>
>

type CurrentReferencePricesByBuildingClass = Readonly<
  Record<
    CurrentReferenceBuildingClass,
    CurrentReferenceFactorsByCarrier
  >
>

export type CurrentReferenceData = Readonly<{
  provenance: string
  version: string
  lastReviewed: string
  annualEnergyCostPrices: Readonly<{
    unit: 'EUR/MWh'
    byBuildingClass: CurrentReferencePricesByBuildingClass
  }>
  emissionFactors: Readonly<{
    unit: 'kg CO2/MWh'
    accountingBoundary: string
    byCarrier: CurrentReferenceFactorsByCarrier
  }>
  water: Readonly<{
    occupancy: Readonly<{
      squareMetresPerResident: number
      minimumResidents: number
      maximumResidents: number
      rounding: 'half-up'
      approvedAt: string
      sourceUrl: string
      floorAreaCaveat: string
    }>
    litersPerResidentPerDay: Readonly<{
      value: number
      unit: 'L/resident/day'
    }>
    cubicMetersPerResidentPerYear: Readonly<{
      value: number
      unit: 'm³/resident/year'
    }>
  }>
}>

const supported = (value: number): CurrentReferenceSupportedValue => ({
  status: 'supported',
  value,
})

const notSupplied: CurrentReferenceUnsupportedValue = {
  status: 'unsupported',
  reason: 'not-supplied',
}

export const CURRENT_REFERENCE_DATA = {
  provenance:
    'Product-supplied factor set from approved F075 feature intake; resident occupancy heuristic approved by the product owner on 2026-08-02.',
  version: 'F075-resident-water-2026-08-02',
  lastReviewed: '2026-08-02',
  annualEnergyCostPrices: {
    unit: 'EUR/MWh',
    byBuildingClass: {
      apartmentBuilding: {
        electricity: supported(263.27),
        districtHeat: supported(103.03),
        lightFuelOil: supported(131.01),
        pellet: notSupplied,
      },
      detachedHouse: {
        electricity: supported(161.23),
        districtHeat: supported(114.39),
        lightFuelOil: supported(131.01),
        pellet: supported(89.56),
      },
    },
  },
  emissionFactors: {
    unit: 'kg CO2/MWh',
    accountingBoundary:
      'Fossil-accounting boundary only; the pellet factor is not a lifecycle or biogenic-emissions claim.',
    byCarrier: {
      electricity: supported(45),
      districtHeat: supported(115),
      lightFuelOil: supported(242.3),
      pellet: supported(0),
    },
  },
  water: {
    occupancy: {
      squareMetresPerResident: 41.6,
      minimumResidents: 1,
      maximumResidents: 10000,
      rounding: 'half-up',
      approvedAt: '2026-08-02',
      sourceUrl:
        'https://otos.stat.fi/server/api/core/bitstreams/f3e835da-b220-4251-8079-7b7309d1d2a4/content',
      floorAreaCaveat:
        'Building floor_area is only a proxy for occupied dwelling area and must not be presented as resident data.',
    },
    litersPerResidentPerDay: {
      value: 120,
      unit: 'L/resident/day',
    },
    cubicMetersPerResidentPerYear: {
      value: 43.8,
      unit: 'm³/resident/year',
    },
  },
} as const satisfies CurrentReferenceData
