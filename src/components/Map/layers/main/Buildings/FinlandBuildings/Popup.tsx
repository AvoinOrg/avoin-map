import React from 'react'

import { pp } from '#/common/utils/general'
import { PopupProps } from '#/common/types/map'
import {
  PopupTable,
  PopupTableBody,
  PopupTableCell,
  PopupTableRow,
} from '#/components/Map/layers/main/common/PopupTable'

interface IBuildingSchemaVRK {
  building_id: string
  region: string
  municipality: string
  street: string
  house_number: string
  postal_code: string
  building_use: number
}
interface IBuildingSchemaNLS {
  gid: number
  sijaintitarkkuus: number
  aineistolahde: number
  alkupvm: string
  kohderyhma: number
  kohdeluokka: number
  korkeustarkkuus: number
  kayttotarkoitus: number
  kerrosluku: number
  pohjankorkeus: number
  korkeusarvo: number

  st_area: number
}
interface IBuildingSchema {
  id: number
  building_id: string
  gid: number
  distance_poly?: number
  distance_centroid?: number
}

const Popup = ({ features }: PopupProps) => {
  let p = null

  let vrk = <></>
  let nls = <></>
  const props = features[0].properties as IBuildingSchema

  if (props.building_id) {
    p = props as unknown as IBuildingSchemaVRK

    vrk = (
      <>
        <PopupTableRow>
          <PopupTableCell>
            <address>
              {p.street} {p.house_number}, {p.postal_code}
            </address>
          </PopupTableCell>
        </PopupTableRow>
        <PopupTableRow>
          <PopupTableCell>Building ID</PopupTableCell>
          <PopupTableCell>{p.building_id}</PopupTableCell>
        </PopupTableRow>
      </>
    )
  }

  if (props.gid) {
    p = props as unknown as IBuildingSchemaNLS
    const approxArea = 0.888 * p.st_area
    const approxVolume = 3.5 * approxArea

    const floorCountCodes: Record<number, string> = {
      0: 'Unspecified',
      1: '1 or 2 floors',
      2: '3 or more floors',
    }
    const floorCount = floorCountCodes[p.kerrosluku] || 'Unknown'

    nls = (
      <>
        <PopupTableRow>
          <PopupTableCell>Floor count</PopupTableCell>
          <PopupTableCell>{floorCount}</PopupTableCell>
        </PopupTableRow>
        {approxArea > 1 && (
          <PopupTableRow>
            <PopupTableCell>Estimated floorage</PopupTableCell>
            <PopupTableCell>
              {pp(approxArea, 2)} m<sup>2</sup> per floor
            </PopupTableCell>
          </PopupTableRow>
        )}
        {approxArea > 1 && approxVolume && (
          <PopupTableRow>
            <PopupTableCell>Estimated volume</PopupTableCell>
            <PopupTableCell>
              {pp(approxVolume, 2)} m<sup>3</sup> per floor
            </PopupTableCell>
          </PopupTableRow>
        )}
      </>
    )
  }

  return (
    <PopupTable>
      <PopupTableBody>
        {vrk}
        {nls}
      </PopupTableBody>
    </PopupTable>
  )
}

export default Popup
