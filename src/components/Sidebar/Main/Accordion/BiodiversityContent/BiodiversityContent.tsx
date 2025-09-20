import React from 'react'
import { Box, Typography, Link } from '@mui/material'

const InfoContainer = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      '& .MuiTypography-paragraph:first-of-type': {
        mt: 0,
      },
    }}
  >
    {children}
  </Box>
)

export const FiZonationContent = () => (
  <Box>
    <Typography component="p" gutterBottom>
      This layer comprises of the{' '}
      <Link
        href="http://metatieto.ymparisto.fi:8080/geoportal/catalog/search/resource/details.page?uuid=%7B8E4EA3B2-A542-4C39-890C-DD7DED33AAE1%7D"
        target="_blank"
        rel="noopener noreferrer"
      >
        Zonation 2018 data (forests of high biodiversity value)
      </Link>
      .
    </Typography>
    <Typography component="p">
      The data shown corresponds to 10% of the most important areas for
      biodiversity in Finland.
    </Typography>
  </Box>
)
