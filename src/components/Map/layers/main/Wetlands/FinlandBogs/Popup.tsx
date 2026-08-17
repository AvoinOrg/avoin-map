import React from 'react'
import { Box } from '#/common/style/theme/system'

import { gtkTurveVaratLuonnontilaisuusluokka } from './constants'
import { PopupProps } from '#/common/types/map'
import {
  PopupTable,
  PopupTableBody,
  PopupTableCell,
  PopupTableRow,
} from '#/components/Map/layers/main/common/PopupTable'

const ImageBox = Box as React.ElementType
type BogPhoto = {
  kuva_id: string | number
  kuvausaika: string
  kuvaaja: string
}

const Popup = ({ features }: PopupProps) => {
  const p = features[0].properties

  return (
    <>
      <PopupTable>
        <PopupTableBody>
          <PopupTableRow>
            <PopupTableCell>Name</PopupTableCell>
            <PopupTableCell>{p.suon_nimi}</PopupTableCell>
          </PopupTableRow>
          <PopupTableRow>
            <PopupTableCell>Surveyed</PopupTableCell>
            <PopupTableCell>{p.tutkimusvuosi}</PopupTableCell>
          </PopupTableRow>
          <PopupTableRow>
            <PopupTableCell>Area</PopupTableCell>
            <PopupTableCell>{p.suon_pinta_ala_ha}</PopupTableCell>
          </PopupTableRow>
          <PopupTableRow>
            <PopupTableCell>Peat volume</PopupTableCell>
            <PopupTableCell>{p.suon_turvemaara_mm3}</PopupTableCell>
          </PopupTableRow>
          <PopupTableRow>
            <PopupTableCell>Average peat depth</PopupTableCell>
            <PopupTableCell>{p.turvekerroksen_keskisyvyys_m}</PopupTableCell>
          </PopupTableRow>
          <PopupTableRow>
            <PopupTableCell>
              Evaluation of how close the bog is to its natural state (class{' '}
              {p.luonnontilaisuusluokka === -1 ? '?' : p.luonnontilaisuusluokka}{' '}
              out of 5)
            </PopupTableCell>
            <PopupTableCell>
              {gtkTurveVaratLuonnontilaisuusluokka[p.luonnontilaisuusluokka]}
            </PopupTableCell>
          </PopupTableRow>
        </PopupTableBody>
      </PopupTable>
      {p.photos_json && <PhotoContainer photoJson={p.photos_json} />}
    </>
  )
}

const PhotoContainer = ({ photoJson }: { photoJson: string }) => {
  const photos = JSON.parse(photoJson) as BogPhoto[]

  return (
    <Box sx={{ overflow: 'scroll', maxHeight: '500px' }}>
      {photos.map((photo) => {
        const { kuva_id, kuvausaika, kuvaaja } = photo
        const imageURL = `https://gtkdata.gtk.fi/Turvevarojen_tilinpito/Turve_valokuvat/${kuva_id}.jpg`

        return (
          <p key={imageURL}>
            <a target="_blank" rel="noopener noreferrer" href={imageURL}>
              <ImageBox
                component="img"
                src={imageURL}
                sx={{ maxWidth: '400px', maxHeight: '300px' }}
              />
            </a>
            <br />
            Date:{' '}
            {kuvausaika.toLowerCase() === 'tuntematon' ? 'Unknown' : kuvausaika}
            <br />
            Photographer: {kuvaaja}
          </p>
        )
      })}
    </Box>
  )
}

export default Popup
