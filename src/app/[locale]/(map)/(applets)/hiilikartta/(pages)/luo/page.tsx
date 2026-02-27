'use client'

import React from 'react'
import { Box, Button, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useRouter } from 'next/navigation'

import { getRoute } from '#/common/routing/routing-client'
import MutableLink from '#/components/common/MutableLink'
import { useMapStore } from '#/common/store'
import { ClickableModal } from '#/components/Modal'
import TText from '#/components/common/TText'

import { routeTree } from '#/common/routing/routes/hiilikartta'
import { NewPlanConf, PlanData, ZONING_CODE_COL } from '../../common/types'
import { useAppletStore } from '../../state/appletStore'
import { createLayerConf } from '../../common/utils'
import { getZoningClasses } from '../../common/zoningClasses'

const Page = () => {
  const router = useRouter()

  const addPlanConf = useAppletStore((state) => state.addPlanConf)
  const deletePlanConf = useAppletStore((state) => state.deletePlanConf)
  const addSerializableLayerGroup = useMapStore(
    (state) => state.addSerializableLayerGroup
  )

  const initializePlan = async () => {
    const colName = ZONING_CODE_COL
    const jsonName = 'Uusi kaava'
    const data: PlanData = {
      type: 'FeatureCollection',
      features: [],
    }

    const newPlanConf: NewPlanConf = {
      data: data,
      name: jsonName,
      areaHa: 0,
    }

    const planConf = await addPlanConf(newPlanConf)

    try {
      const layerConf = await createLayerConf(data, planConf.id, colName)
      await addSerializableLayerGroup(layerConf.id, {
        layerConf,
        persist: false,
      })
    } catch (e) {
      deletePlanConf(planConf.id)
      console.error(e)
      return null
    }

    return planConf.id
  }

  const handleNewPlanClick = async () => {
    const id = await initializePlan()
    // TODO: throw error if id is null, i.e. if file is invalid
    if (id) {
      const route = getRoute({
        routeNode: routeTree.plans.plan,
        routeTree: routeTree,
        params: {
          routeParams: {
            planId: id,
          },
        },
      })
      router.push(route)
    }
  }

  return (
    <>
      <MutableLink
        route={routeTree.create.import}
        routeTree={routeTree}
        sx={{ display: 'flex', color: 'inherit', textDecoration: 'none' }}
      >
        <BigMenuButton
          variant="contained"
          component="label"
          aria-label="Open plan import"
        >
          <TText keyName={'sidebar.create.upload'} ns={'hiilikartta'} />
        </BigMenuButton>
      </MutableLink>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          mr: 1,
          mt: 2,
        }}
      >
        <ClickableModal
          triggerAriaLabel="Show upload instructions"
          modalBody={
            <Box>
              <Typography component="div" sx={{ typography: 'body2' }}>
                <TText keyName={'sidebar.create.upload_info'} ns={'hiilikartta'} />
              </Typography>
            </Box>
          }
        >
          <Typography
            sx={{
              display: 'inline',
              color: 'neutral.dark',
              typography: 'body2',
            }}
          >
            <TText
              ns="hiilikartta"
              keyName={'sidebar.create.show_instructions'}
            ></TText>
          </Typography>
        </ClickableModal>
      </Box>

      <BigMenuButton
        sx={{ mt: 5 }}
        variant="contained"
        aria-label="Create new plan by drawing"
        onClick={handleNewPlanClick}
      >
        <TText keyName={'sidebar.create.draw_new'} ns={'hiilikartta'} />
      </BigMenuButton>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          mr: 1,
          mt: 2,
        }}
      >
        <ClickableModal
          triggerAriaLabel="Show drawing instructions"
          modalBody={
            <Box>
              <Typography sx={{ typography: 'body2' }}>
                <TText keyName={'sidebar.create.draw_new_info'}></TText>
              </Typography>
            </Box>
          }
        >
          <Typography
            sx={{
              display: 'inline',
              color: 'neutral.dark',
              typography: 'body2',
            }}
          >
            <TText
              ns="hiilikartta"
              keyName={'sidebar.create.show_instructions'}
            ></TText>
          </Typography>
        </ClickableModal>
      </Box>
    </>
  )
}

const BigMenuButton = styled(Button)<{ component?: string }>({
  width: '100%',
  height: '60px',
  margin: '0 0 0 0',
})

export default Page
