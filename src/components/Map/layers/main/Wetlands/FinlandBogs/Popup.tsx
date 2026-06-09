'use client'

import React from 'react'
import { css } from 'styled-system/css'

import { gtkTurveVaratLuonnontilaisuusluokka } from './constants'
import { PopupProps } from '#/common/types/map'
import { PopupTable } from '#/components/Map/layers/main/PopupTable'

const photoContainerClass = css({
  overflow: 'scroll',
  maxHeight: '500px',
})

const photoClass = css({
  maxWidth: '400px',
  maxHeight: '300px',
})

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
        <tr>
          <td>Name</td>
          <td>{p.suon_nimi}</td>
        </tr>
        <tr>
          <td>Surveyed</td>
          <td>{p.tutkimusvuosi}</td>
        </tr>
        <tr>
          <td>Area</td>
          <td>{p.suon_pinta_ala_ha}</td>
        </tr>
        <tr>
          <td>Peat volume</td>
          <td>{p.suon_turvemaara_mm3}</td>
        </tr>
        <tr>
          <td>Average peat depth</td>
          <td>{p.turvekerroksen_keskisyvyys_m}</td>
        </tr>
        <tr>
          <td>
            Evaluation of how close the bog is to its natural state (class{' '}
            {p.luonnontilaisuusluokka === -1 ? '?' : p.luonnontilaisuusluokka}{' '}
            out of 5)
          </td>
          <td>
            {gtkTurveVaratLuonnontilaisuusluokka[p.luonnontilaisuusluokka]}
          </td>
        </tr>
      </PopupTable>
      {p.photos_json && <PhotoContainer photoJson={p.photos_json} />}
    </>
  )
}

const PhotoContainer = ({ photoJson }: { photoJson: string }) => {
  const photos = JSON.parse(photoJson) as BogPhoto[]

  return (
    <div className={photoContainerClass}>
      {photos.map((photo) => {
        const { kuva_id, kuvausaika, kuvaaja } = photo
        const imageURL = `https://gtkdata.gtk.fi/Turvevarojen_tilinpito/Turve_valokuvat/${kuva_id}.jpg`

        return (
          <p key={kuva_id}>
            <a target="_blank" rel="noopener noreferrer" href={imageURL}>
              <Photo src={imageURL} alt="" />
            </a>
            <br />
            Date:{' '}
            {kuvausaika.toLowerCase() === 'tuntematon' ? 'Unknown' : kuvausaika}
            <br />
            Photographer: {kuvaaja}
          </p>
        )
      })}
    </div>
  )
}

const Photo = (props: React.ImgHTMLAttributes<HTMLImageElement>) =>
  React.createElement('img', {
    className: photoClass,
    ...props,
  })

export default Popup
