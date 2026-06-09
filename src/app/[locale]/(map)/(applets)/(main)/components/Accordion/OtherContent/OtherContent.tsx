import React from 'react'
import { css } from 'styled-system/css'

const contentRootClass = css({
  '& p:first-of-type': {
    marginTop: 0,
  },
})

const paragraphClass = css({
  margin: 0,
  marginBottom: '0.35em',
})

export const AirQualityContent = () => (
  <div className={contentRootClass}>
    <p className={paragraphClass}>
      Burning of fossil fuel creates air pollutants such as NO₂ and small
      particles.
    </p>
    <p className={paragraphClass}>
      The satellite NO₂ data is based on Sentinel 5P measurements and is updated
      approximately once per 24 hours for any given location. A healthy
      threshold of NO₂ is around 50 umol/m<sup>2</sup>.
    </p>
  </div>
)

export const SnowCoverLossContent = () => (
  <div className={contentRootClass}>
    <p className={paragraphClass}>
      This layer shows the global decrease in the amount of snow over time. Each
      area shown corresponds to an area that between 1980 and 1990 had at least
      10 days of snow on average. This average is contrasted with the average
      snowfall between 1996 and 2016.
    </p>
    <p className={paragraphClass}>
      The data comes from FT-ESDR or{' '}
      <a
        href="http://www.ntsg.umt.edu/freeze-thaw/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Freeze/Thaw Earth System Data Record
      </a>
      .
    </p>
  </div>
)
