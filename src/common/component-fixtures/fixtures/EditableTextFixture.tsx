import React from 'react'

import { Box } from '#/common/style/theme'
import EditableText from '#/components/common/EditableText'
import type { ComponentFixture } from '#/common/component-fixtures/types'

type EditableTextScenarioAction =
  | 'edit-mode'
  | 'changed-draft'
  | 'save-action'
  | 'cancel-action'
  | 'keyboard-activation'

const EDIT_BUTTON_ARIA_LABEL = 'Editable text edit'
const INPUT_ARIA_LABEL = 'Editable text field'

const EditableTextFixtureWrapper = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <Box
    sx={{
      width: 420,
      p: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: 1,
    }}
  >
    {children}
  </Box>
)

const setInputValue = (input: HTMLInputElement, value: string) => {
  const inputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )?.set

  inputValueSetter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

const findEditableTextEditButton = (root: HTMLDivElement | null) =>
  root?.querySelector(
    `button[aria-label="${EDIT_BUTTON_ARIA_LABEL}"], [role="button"][aria-label="${EDIT_BUTTON_ARIA_LABEL}"]`
  ) as HTMLButtonElement | null

const findEditableTextInput = (root: HTMLDivElement | null) =>
  root?.querySelector(`input[aria-label="${INPUT_ARIA_LABEL}"]`) as
    | HTMLInputElement
    | null

const findEditableTextSaveButton = (root: HTMLDivElement | null) =>
  root?.querySelector(
    'button[aria-label="Save text"], [role="button"][aria-label="Save text"]'
  ) as HTMLButtonElement | null

const findEditableTextCancelButton = (root: HTMLDivElement | null) =>
  root?.querySelector(
    'button[aria-label="Cancel text editing"], [role="button"][aria-label="Cancel text editing"]'
  ) as HTMLButtonElement | null

const waitForEditableTextState = ({
  rootRef,
  matches,
  onReady,
}: {
  rootRef: React.RefObject<HTMLDivElement | null>
  matches: (root: HTMLDivElement) => boolean
  onReady: () => void
}) => {
  const root = rootRef.current

  if (root != null && matches(root)) {
    onReady()
    return
  }

  window.setTimeout(() => {
    waitForEditableTextState({ rootRef, matches, onReady })
  }, 30)
}

const runAction = (
  action: EditableTextScenarioAction,
  rootRef: React.RefObject<HTMLDivElement | null>,
  draftValue = '',
  setActionMessage?: (message: string) => void,
) => {
  const root = rootRef.current
  const editButton = findEditableTextEditButton(root)

  if (!editButton) {
    return
  }

  const activateEdit = () => {
    if (action === 'keyboard-activation') {
      editButton.focus()
      editButton.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          key: 'Enter',
        })
      )
    } else {
      editButton.click()
    }
  }

  activateEdit()

  if (action === 'edit-mode' || action === 'keyboard-activation') {
    waitForEditableTextState({
      rootRef,
      matches: (currentRoot) => findEditableTextInput(currentRoot) != null,
      onReady: () => {
        setActionMessage?.(
          action === 'keyboard-activation'
            ? 'Edit mode entered with keyboard activation'
            : 'Edit mode activated'
        )
      },
    })
    return
  }

  const activateActionAfterEdit = () => {
    const input = findEditableTextInput(root)

    if (!input) {
      window.setTimeout(activateActionAfterEdit, 30)
      return
    }

    if (
      action === 'changed-draft' ||
      action === 'save-action' ||
      action === 'cancel-action'
    ) {
      setInputValue(input, draftValue)
    }

    if (action === 'changed-draft') {
      waitForEditableTextState({
        rootRef,
        matches: (currentRoot) =>
          findEditableTextInput(currentRoot)?.value === draftValue,
        onReady: () => {
          setActionMessage?.('Draft changed, edit mode active')
        },
      })
      return
    }

    if (action === 'save-action') {
      window.setTimeout(() => {
        const saveButton = findEditableTextSaveButton(root)
        saveButton?.click()
      }, 0)
      return
    }

    if (action === 'cancel-action') {
      window.setTimeout(() => {
        const cancelButton = findEditableTextCancelButton(root)
        cancelButton?.click()
        waitForEditableTextState({
          rootRef,
          matches: (currentRoot) =>
            findEditableTextInput(currentRoot) == null &&
            currentRoot.textContent?.includes('Editable plan') === true &&
            currentRoot.textContent.includes(draftValue) === false,
          onReady: () => {
            setActionMessage?.('Edit action canceled, value restored')
          },
        })
      }, 0)
      return
    }
  }

  window.setTimeout(activateActionAfterEdit, 30)
}

const EditableTextScenario = ({
  value,
  valueAppendix,
  action,
}: {
  value: string
  valueAppendix?: string
  action?: EditableTextScenarioAction
}) => {
  const [textValue, setTextValue] = React.useState(value)
  const [actionMessage, setActionMessage] = React.useState<string | null>(null)
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const actionRunRef = React.useRef(false)

  const draftValue =
    action === 'changed-draft' ||
    action === 'save-action' ||
    action === 'cancel-action'
      ? 'Long draft field value for fixture'
      : undefined

  React.useEffect(() => {
    if (!action || actionRunRef.current) {
      return
    }

    actionRunRef.current = true

    const actionTimeout = window.setTimeout(() => {
      runAction(action, rootRef, draftValue, (message) => {
        setActionMessage(message)
      })
    }, 120)

    return () => {
      window.clearTimeout(actionTimeout)
    }
  }, [action, draftValue])

  return (
    <Box ref={rootRef} sx={{ width: '100%' }}>
      <EditableText
        value={textValue}
        valueAppendix={valueAppendix}
        onChange={(event) => {
          setTextValue(event.target.value)
          setActionMessage(`Committed: ${event.target.value}`)
        }}
        editButtonAriaLabel={EDIT_BUTTON_ARIA_LABEL}
        saveButtonAriaLabel="Save text"
        cancelButtonAriaLabel="Cancel text editing"
        textFieldAriaLabel={INPUT_ARIA_LABEL}
      />
      {actionMessage ? <Box sx={{ color: 'neutral.dark', mt: 0.5 }}>{actionMessage}</Box> : null}
    </Box>
  )
}

export const editableTextFixture: ComponentFixture = {
  id: 'editable-text',
  label: 'EditableText',
  description: 'Shared editable inline text control states.',
  sourceGlobs: [
    'src/components/common/EditableText.tsx',
    'src/components/common/EditableText.test.tsx',
    'src/common/component-fixtures/fixtures/EditableTextFixture.tsx',
  ],
  wrapper: EditableTextFixtureWrapper,
  states: [
    {
      id: 'display',
      label: 'Display',
      description: 'Read-only mode with default value.',
      render: () => <EditableTextScenario value="Editable plan name" />,
    },
    {
      id: 'display-with-appendix',
      label: 'Display with appendix',
      description: 'Read-only mode with value appendix.',
      render: () => <EditableTextScenario value="Plan" valueAppendix=" m²" />,
    },
    {
      id: 'edit-mode',
      label: 'Edit mode',
      description: 'Entered edit mode through edit control activation.',
      waitFor: 'text=Edit mode activated',
      render: () => <EditableTextScenario value="Editable plan" action="edit-mode" />,
    },
    {
      id: 'changed-draft',
      label: 'Changed draft',
      description: 'Draft value changed while edit mode is active.',
      waitFor: 'text=Draft changed, edit mode active',
      render: () => <EditableTextScenario value="Editable plan" action="changed-draft" />,
    },
    {
      id: 'save-action',
      label: 'Save action',
      description: 'Draft is committed and component returns to display mode.',
      waitFor: 'text=Committed:',
      render: () => <EditableTextScenario value="Editable plan" action="save-action" />,
    },
    {
      id: 'cancel-action',
      label: 'Cancel action',
      description: 'Draft is reverted and component returns to display mode.',
      waitFor: 'text=Edit action canceled, value restored',
      render: () => <EditableTextScenario value="Editable plan" action="cancel-action" />,
    },
    {
      id: 'keyboard-activation',
      label: 'Keyboard activation',
      description: 'Edit mode is entered from keyboard keydown.',
      waitFor: 'text=Edit mode entered with keyboard activation',
      render: () => <EditableTextScenario value="Editable plan" action="keyboard-activation" />,
    },
    {
      id: 'long-text-overflow',
      label: 'Long text overflow',
      description: 'Display text uses ellipsis in narrow space.',
      wrapper: ({ children }) => (
        <Box
          sx={{
            width: 240,
            maxWidth: '100%',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            minWidth: 0,
          }}
        >
          <Box sx={{ width: '100%', minWidth: 0 }}>{children}</Box>
        </Box>
      ),
      render: () => (
        <EditableTextScenario
          value="This is a very long plan title that demonstrates overflow behavior"
        />
      ),
    },
  ],
}
