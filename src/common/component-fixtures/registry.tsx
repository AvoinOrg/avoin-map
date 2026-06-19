'use client'

import { actionIconTextHelpersFixture } from './fixtures/ActionIconTextHelpersFixture'
import { buttonPrimitivesFixture } from './fixtures/ButtonPrimitivesFixture'
import { booleanControlsFixture } from './fixtures/BooleanControlsFixture'
import { colorPickerWithPopoverFixture } from './fixtures/ColorPickerWithPopoverFixture'
import { dropDownMultiSelectFixture } from './fixtures/DropDownMultiSelectFixture'
import { flowStepPrimitivesFixture } from './fixtures/FlowStepPrimitivesFixture'
import { folderFixture } from './fixtures/FolderFixture'
import { fullscreenPageFixture } from './fixtures/FullscreenPageFixture'
import { loadingFeedbackFixture } from './fixtures/LoadingFeedbackFixture'
import { layerToggleRowFixture } from './fixtures/LayerToggleRowFixture'
import { multiSelectAutocompleteFixture } from './fixtures/MultiSelectAutocompleteFixture'
import { editableTextFixture } from './fixtures/EditableTextFixture'
import { numberInputFieldFixture } from './fixtures/NumberInputFieldFixture'
import { sharedSvgIconFixture } from './fixtures/SharedSvgIconFixture'
import {
  textFieldWithHeaderFixture,
  textFieldWithLabelFixture,
} from './fixtures/TextFieldControlsFixture'
import { sidebarBackgroundContentFixture } from './fixtures/SidebarBackgroundContentFixture'
import type {
  ComponentFixture,
  ComponentFixtureStateLookup,
} from './types'

const componentFixtures: ComponentFixture[] = [
  sharedSvgIconFixture,
  layerToggleRowFixture,
  dropDownMultiSelectFixture,
  multiSelectAutocompleteFixture,
  numberInputFieldFixture,
  editableTextFixture,
  buttonPrimitivesFixture,
  booleanControlsFixture,
  flowStepPrimitivesFixture,
  colorPickerWithPopoverFixture,
  actionIconTextHelpersFixture,
  sidebarBackgroundContentFixture,
  folderFixture,
  fullscreenPageFixture,
  textFieldWithLabelFixture,
  textFieldWithHeaderFixture,
  loadingFeedbackFixture,
]

export const getComponentFixtures = () => componentFixtures

export const getComponentFixture = (
  fixtureId: string
): ComponentFixture | undefined =>
  componentFixtures.find((fixture) => fixture.id === fixtureId)

export const getComponentFixtureState = ({
  fixtureId,
  stateId,
}: {
  fixtureId: string
  stateId: string
}): ComponentFixtureStateLookup | undefined => {
  const fixture = getComponentFixture(fixtureId)
  const state = fixture?.states.find((candidate) => candidate.id === stateId)

  if (!fixture || !state) {
    return undefined
  }

  return { fixture, state }
}
