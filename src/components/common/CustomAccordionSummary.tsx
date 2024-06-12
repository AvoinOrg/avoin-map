import * as React from 'react'
import AccordionSummary, {
  AccordionSummaryProps,
} from '@mui/material/AccordionSummary'
import ArrowDown from '#/components/icons/ArrowDown'

const CustomAccordionSummary = ({
  expandIcon = <ArrowDown />,
  sx,
  children,
  ...accordionSummaryProps
}: AccordionSummaryProps & { children: React.ReactNode }) => {
  return (
    <AccordionSummary
      expandIcon={expandIcon}
      sx={[
        {
          '& .MuiAccordionSummary-content': {
            width: '100%',
            display: 'flex',
            flexGrow: 1,
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...accordionSummaryProps}
    >
      {children}
    </AccordionSummary>
  )
}

export default CustomAccordionSummary
