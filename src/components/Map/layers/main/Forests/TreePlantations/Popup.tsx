import React from 'react'
import { css } from 'styled-system/css'

import { pp } from '#/common/utils/general'
import { PopupProps } from '#/common/types/map'
import { PopupTable } from '#/components/Map/layers/main/PopupTable'

const rootClass = css({
  lineHeight: 1,
})

const compactCellClass = css({
  lineHeight: 0.5,
})

const Popup = ({ features }: PopupProps) => {
  const p = features[0].properties || features[0]
  const { image, spec_simp, type_text, area_ha, peat_ratio, avg_peatdepth } = p
  const isPeat = peat_ratio >= 0.4

  const imageObjs = []
  const images: string[] = image
    .replace(/\.(tif|img|_)/g, '')
    .toUpperCase()
    .split(/[,; ]+/)

  for (const x of images) {
    if (!/LGN\d/.test(x)) {
      continue
    }
    const base = x.replace(/LGN.*/, 'LGN0')
    // Most of the source images seem to fall in these categories.

    // Candidate URLs:
    for (const z of [0, 1, 2]) {
      imageObjs.push({ url: `https://earthexplorer.usgs.gov/metadata/12864/${base + z}/`, title: base + z })
    }
  }

  return (
    <div className={rootClass}>
      <p>
        <b>Tree plantation (Global Forest Watch)</b>
      </p>
      <p>{spec_simp}</p>
      <p>{type_text}</p>
      {isPeat && <p>Tropical peatland</p>}

      <PopupTable>
        {isPeat && (
          <tr>
            <td>Average peat depth</td>
            <td>{avg_peatdepth.toFixed(1)} metres</td>
          </tr>
        )}
        <tr>
          <td>Area</td>
          <td>{pp(area_ha, 3)}</td>
        </tr>
        {isPeat && (
          <tr>
            <td>
              Emission reduction potential when ground water level is raised by
              40 cm
            </td>
            <td>{pp(19.4 * area_ha)} tons CO2e/year</td>
          </tr>
        )}
        <tr>
          <td>Landsat source ID</td>
          <td>
            <code>{image}</code>
          </td>
        </tr>
        {imageObjs.length > 0 && (
          <tr>
            <td>Potential Landsat source images</td>
            <td className={compactCellClass}>
              {imageObjs.map((imageObj) => (
                <p key={imageObj.url}>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={imageObj.url}
                  >
                    {imageObj.title}
                  </a>
                </p>
              ))}
            </td>
          </tr>
        )}
      </PopupTable>
    </div>
  )
}

export default Popup
