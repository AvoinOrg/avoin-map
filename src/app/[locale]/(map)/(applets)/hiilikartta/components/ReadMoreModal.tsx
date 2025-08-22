import React from 'react'
import { Box, Typography } from '@mui/material'
import Link from '#/components/common/Link'
import TText from '#/components/common/TText'
import { ClickableModal } from '#/components/Modal'

// interface Props {
//   basePath: string
// }

const ReadMoreModal = () => {
  return (
    <ClickableModal
      modalBody={
        <Box>
          <Typography sx={{ typography: 'body1', mb: 2 }}>
            <TText
              ns="hiilikartta"
              keyName="report.general.read_more_about_calc.meta"
            ></TText>
            <Link
              href={'https://www.syke.fi/hankkeet/hiilikartta'}
              sx={{ typography: 'body2' }}
            >
              <u>https://syke.fi/hankkeet/hiilikartta</u>
            </Link>
          </Typography>
          <Typography typography="body2">
            <TText
              ns="hiilikartta"
              keyName={'report.general.read_more_about_calc.text'}
            ></TText>
          </Typography>
        </Box>
      }
    >
      <Typography sx={{ display: 'inline', typography: 'body2' }}>
        <u>
          <TText
            ns="hiilikartta"
            keyName="report.general.read_more_about_calc"
          ></TText>
        </u>
      </Typography>
    </ClickableModal>
  )
}

export default ReadMoreModal
