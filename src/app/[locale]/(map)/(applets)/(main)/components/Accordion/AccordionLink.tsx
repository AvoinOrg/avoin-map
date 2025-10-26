import React from 'react'
import { Box, Typography } from '@mui/material'
import Link from '#/components/common/Link'
import { ArrowRight } from '#/components/icons'

interface AccordionLinkProps {
  href: string
  name: string
}

export const AccordionLink = ({ href, name }: AccordionLinkProps) => {
  return (
    <Link
      href={href}
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        height: '3.5rem',
        py: 1,
        pl: 5,
        pr: 5,
        textDecoration: 'none',
        color: 'inherit',
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      <Typography
        sx={{
          flexGrow: 1,
          typography: 'h9',
          fontSize: '0.825rem',
          fontStyle: 'normal',
          fontWeight: 700,
          lineHeight: 'normal',
          letterSpacing: '0.06875rem',
        }}
      >
        {name}
      </Typography>
      <ArrowRight sx={{ height: '17px' }} />
    </Link>
  )
}
