import type React from 'react'
import type { SxProps, Theme } from '@mui/material'

export type ComponentFixtureStateId = string

export type ComponentFixtureStateMetadata = {
  id: ComponentFixtureStateId
  label: string
  description?: string
}

export type ComponentFixtureMetadata = {
  id: string
  label: string
  description?: string
  sourceGlobs: string[]
  states: ComponentFixtureStateMetadata[]
}

export type ComponentFixtureWrapper = React.ComponentType<{
  children: React.ReactNode
}>

export type ComponentFixtureState = ComponentFixtureStateMetadata & {
  canvasSx?: SxProps<Theme>
  wrapper?: ComponentFixtureWrapper
  render: () => React.ReactNode
}

export type ComponentFixture = Omit<ComponentFixtureMetadata, 'states'> & {
  canvasSx?: SxProps<Theme>
  wrapper?: ComponentFixtureWrapper
  states: ComponentFixtureState[]
}

export type ComponentFixtureStateLookup = {
  fixture: ComponentFixture
  state: ComponentFixtureState
}
