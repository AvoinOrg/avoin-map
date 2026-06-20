import React from 'react'
import { Box } from '#/common/style/theme/system'

const Paragraph = ({
  children,
  gutterBottom = false,
}: {
  children: React.ReactNode
  gutterBottom?: boolean
}) => (
  <Box component="p" sx={{ m: 0, mb: gutterBottom ? '0.35em' : 0 }}>
    {children}
  </Box>
)

export const FiZonationContent = () => (
  <Box>
    <Paragraph gutterBottom>
      This layer comprises of the{' '}
      <a
        href="http://metatieto.ymparisto.fi:8080/geoportal/catalog/search/resource/details.page?uuid=%7B8E4EA3B2-A542-4C39-890C-DD7DED33AAE1%7D"
        target="_blank"
        rel="noopener noreferrer"
      >
        Zonation 2018 data (forests of high biodiversity value)
      </a>
      .
    </Paragraph>
    <Paragraph>
      The data shown corresponds to 10% of the most important areas for
      biodiversity in Finland.
    </Paragraph>
  </Box>
)
