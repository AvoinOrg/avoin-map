import { Box } from '#/common/style/theme'
import SidebarBackgroundContent from '#/components/common/SidebarBackgroundContent'
import TText from '#/components/common/TText'

import CarbonPlanActionRows from '../CarbonPlanActionRows'
import { BaselineExample, BaselineSection } from '../BaselineContent'
import { UI_BASELINE_NAMESPACE } from '../../common/categories'

const ContentContent = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
    <BaselineSection title="SidebarBackgroundContent">
      <BaselineExample title="Carbon plans content container">
        <SidebarBackgroundContent
          imageSrc="/files/img/hiilikartta/sidebar/kaavat-hero.png"
          imageAlt="Hiilikartta kaavat"
          title={
            <TText
              ns={UI_BASELINE_NAMESPACE}
              keyName="content.carbon_plans.title"
            />
          }
          description={
            <TText
              ns={UI_BASELINE_NAMESPACE}
              keyName="content.carbon_plans.description"
            />
          }
          imageSx={{
            height: '5.625rem',
            objectPosition: 'center 35%',
          }}
          contentSx={{
            px: '2.4375rem',
            pt: '4.375rem',
            pb: '4.6875rem',
            gap: '3.75rem',
          }}
          headerSx={{
            gap: '2.1875rem',
          }}
          descriptionSx={{
            width: '100%',
            maxWidth: 'none',
          }}
          actionsSx={{
            gap: '1.75rem',
          }}
          actions={<CarbonPlanActionRows />}
        />
      </BaselineExample>
    </BaselineSection>
  </Box>
)

export default ContentContent
