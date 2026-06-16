import { notFound } from 'next/navigation'

import { ComponentFixtureFrame } from '#/common/component-fixtures/ComponentFixtureFrame'
import {
  getComponentFixtureMetadata,
  getComponentFixtureStateMetadata,
} from '#/common/component-fixtures/metadata'

type Props = {
  params: Promise<{
    fixtureId: string
    stateId: string
  }>
}

const assertDevelopmentFixtureRoute = () => {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }
}

const ComponentFixtureStatePage = async ({ params }: Props) => {
  assertDevelopmentFixtureRoute()

  const { fixtureId, stateId } = await params
  const fixture = getComponentFixtureMetadata(fixtureId)
  const state = getComponentFixtureStateMetadata({ fixtureId, stateId })

  if (!fixture || !state) {
    notFound()
  }

  return <ComponentFixtureFrame fixtureId={fixtureId} stateId={stateId} />
}

export default ComponentFixtureStatePage
