import { useTranslate } from '@tolgee/react'

import { AppRouteLink } from '#/common/navigation/appRouteLinks'
import { Box } from '#/common/style/theme'
import TText from '#/components/common/TText'
import {
  IntoSidebarHeaderSlot,
  SidebarBoundary,
  SidebarContentBox,
  SidebarHeader,
} from '#/components/Sidebar'

import {
  UI_BASELINE_CATEGORIES,
  UI_BASELINE_NAMESPACE,
} from '../common/categories'

const UiBaselineHomePage = () => {
  const { t } = useTranslate(UI_BASELINE_NAMESPACE)

  return (
    <SidebarBoundary
      id="ui-baseline-home"
      mode="floating"
      config={{ width: 'compact' }}
    >
      <IntoSidebarHeaderSlot>
        <SidebarHeader
          title={<TText ns={UI_BASELINE_NAMESPACE} keyName="home.title" />}
          backgroundImage="/files/img/energiakartta/sidebar/main-hero-header-crop.jpg"
        />
      </IntoSidebarHeaderSlot>
      <SidebarContentBox>
        <Box component="p">
          <TText ns={UI_BASELINE_NAMESPACE} keyName="home.intro" />
        </Box>

        <Box component="nav" aria-label={t('home.category_list_aria')}>
          <Box component="ul">
            {UI_BASELINE_CATEGORIES.map((category) => (
              <Box component="li" key={category.id}>
                <AppRouteLink routeKey={category.routeKey}>
                  <TText
                    ns={UI_BASELINE_NAMESPACE}
                    keyName={category.labelKey}
                  />
                </AppRouteLink>
              </Box>
            ))}
          </Box>
        </Box>
      </SidebarContentBox>
    </SidebarBoundary>
  )
}

export default UiBaselineHomePage
