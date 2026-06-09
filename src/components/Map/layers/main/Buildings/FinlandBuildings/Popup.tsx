import React from 'react'

import { pp } from '#/common/utils/general'
import { PopupProps } from '#/common/types/map'
import { PopupTable } from '#/components/Map/layers/main/PopupTable'

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
        <tr>
          <td>
            <address>
              {p.street} {p.house_number}, {p.postal_code}
            </address>
          </td>
        </tr>
        <tr>
          <td>Building ID</td>
          <td>{p.building_id}</td>
        </tr>
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
        <tr>
          <td>Floor count</td>
          <td>{floorCount}</td>
        </tr>
        {approxArea > 1 && (
          <tr>
            <td>Estimated floorage</td>
            <td>
              {pp(approxArea, 2)} m<sup>2</sup> per floor
            </td>
          </tr>
        )}
        {approxArea > 1 && approxVolume && (
          <tr>
            <td>Estimated volume</td>
            <td>
              {pp(approxVolume, 2)} m<sup>3</sup> per floor
            </td>
          </tr>
        )}
      </>
    )
  }

  return <PopupTable>{vrk}{nls}</PopupTable>
}

export default Popup
