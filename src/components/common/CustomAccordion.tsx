import * as React from 'react'
import Accordion, { AccordionProps } from '@mui/material/Accordion'

const CustomAccordion = ({
  children,
  sx,
  ...accordionProps
}: AccordionProps & { children: React.ReactNode }) => {
  return (
    <Accordion
      sx={[
        {
          width: '100%',
          backgroundColor: 'background.paper',
          ':before': {
            opacity: 0,
          },
          '&.Mui-expanded': {
            margin: 'auto',
            backgroundColor: 'primary.lighter',
          },
          '&:before': {
            display: 'none',
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      slotProps={{ transition: { unmountOnExit: true } }}
      {...accordionProps}
    >
      {children}
    </Accordion>
  )
}

export default CustomAccordion
