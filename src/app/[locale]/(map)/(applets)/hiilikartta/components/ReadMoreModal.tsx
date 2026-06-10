import React from 'react'
import { Box } from '#/components/common/PandaBox'
import Link from '#/components/common/Link'
import TText from '#/components/common/TText'
import { ClickableModal } from '#/components/Modal'

// interface Props {
//   basePath: string
// }

const ReadMoreModal = () => {
  return (
    <ClickableModal
      triggerAriaLabel="Open calculation method details"
      modalBody={
        <Box>
          <Box component="p" sx={{ m: 0, typography: 'body1', mb: 2 }}>
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
          </Box>
          <Box component="p" sx={{ m: 0, typography: 'body2' }}>
            <TText
              ns="hiilikartta"
              keyName={'report.general.read_more_about_calc.text'}
            ></TText>
          </Box>
        </Box>
      }
    >
      <Box component="span" sx={{ display: 'inline', typography: 'body2' }}>
        <u>
          <TText
            ns="hiilikartta"
            keyName="report.general.read_more_about_calc"
          ></TText>
        </u>
      </Box>
    </ClickableModal>
  )
}

export default ReadMoreModal
