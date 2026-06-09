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

export const FiZonationContent = () => (
  <div className={contentRootClass}>
    <p className={paragraphClass}>
      This layer comprises of the{' '}
      <a
        href="http://metatieto.ymparisto.fi:8080/geoportal/catalog/search/resource/details.page?uuid=%7B8E4EA3B2-A542-4C39-890C-DD7DED33AAE1%7D"
        target="_blank"
        rel="noopener noreferrer"
      >
        Zonation 2018 data (forests of high biodiversity value)
      </a>
      .
    </p>
    <p className={paragraphClass}>
      The data shown corresponds to 10% of the most important areas for
      biodiversity in Finland.
    </p>
  </div>
)
