import React from 'react'

import { Box, type AppSystemStyleObject } from '#/common/style/theme'
import IconTextButton from '#/components/common/IconTextButton'
import TText from '#/components/common/TText'

import { UI_BASELINE_NAMESPACE } from '../common/categories'
import { noop } from './BaselineContent'

const IMPORT_PLAN_ICON_SRC =
  '/files/img/hiilikartta/sidebar/kaavat-action-upload.svg'
const DRAW_PLAN_ICON_SRC =
  '/files/img/hiilikartta/sidebar/kaavat-action-draw.svg'

const RouteImage = Box as unknown as React.ComponentType<
  React.ComponentProps<'img'> & { component?: 'img'; sx?: AppSystemStyleObject }
>

const CarbonPlanActionRows = () => (
  <>
    <IconTextButton
      icon={
        <RouteImage
          component="img"
          src={IMPORT_PLAN_ICON_SRC}
          alt=""
          aria-hidden="true"
          sx={{
            width: '0.75rem',
            height: '0.90625rem',
            display: 'block',
          }}
        />
      }
      text={
        <TText
          ns={UI_BASELINE_NAMESPACE}
          keyName="content.carbon_plans.import_title"
        />
      }
      helperText={
        <TText
          ns={UI_BASELINE_NAMESPACE}
          keyName="content.carbon_plans.upload_info"
        />
      }
      helperAriaLabel="Show plan import information"
      onClick={noop}
    />
    <IconTextButton
      icon={
        <RouteImage
          component="img"
          src={DRAW_PLAN_ICON_SRC}
          alt=""
          aria-hidden="true"
          sx={{
            width: '1.0125rem',
            height: '0.75rem',
            display: 'block',
          }}
        />
      }
      text={
        <TText
          ns={UI_BASELINE_NAMESPACE}
          keyName="content.carbon_plans.draw_plan_action"
        />
      }
      helperText={
        <TText
          ns={UI_BASELINE_NAMESPACE}
          keyName="content.carbon_plans.draw_new_info"
        />
      }
      helperAriaLabel="Show drawing instructions"
      onClick={noop}
    />
  </>
)

export default CarbonPlanActionRows
