import { Box } from '#/common/style/theme'
import SidebarBackgroundContent from '#/components/common/SidebarBackgroundContent'

import { BaselineExample, BaselineSection } from '../BaselineContent'

const ContentContent = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
    <BaselineSection title="SidebarBackgroundContent">
      <BaselineExample title="Default SidebarBackgroundContent">
        <SidebarBackgroundContent
          imageSrc="/files/img/green-drawings/forest.jpg"
          imageAlt="Illustrated green forest"
          title="Lorem ipsum dolor sit amet"
          description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        />
      </BaselineExample>
    </BaselineSection>
  </Box>
)

export default ContentContent
