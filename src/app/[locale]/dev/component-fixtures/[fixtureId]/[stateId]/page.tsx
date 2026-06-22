import { notFound, redirect } from 'next/navigation'

import { ComponentFixtureFrame } from '#/common/component-fixtures/ComponentFixtureFrame'
import {
  getComponentFixtureMetadata,
  getComponentFixtureStateMetadata,
} from '#/common/component-fixtures/metadata'

type Props = {
  params: Promise<{
    locale: string
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

  const { locale, fixtureId, stateId } = await params
  const fixture = getComponentFixtureMetadata(fixtureId)
  const state = getComponentFixtureStateMetadata({ fixtureId, stateId })

  if (!fixture || !state) {
    notFound()
  }

  if (fixture.locale && fixture.locale !== locale) {
    redirect(`/${fixture.locale}/dev/component-fixtures/${fixtureId}/${stateId}`)
  }

  return <ComponentFixtureFrame fixtureId={fixtureId} stateId={stateId} />
}

export default ComponentFixtureStatePage
