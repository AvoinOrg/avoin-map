import React from 'react'

import TextFieldWithLabel from '#/components/common/TextFieldWithLabel'

type TextFieldWithLabelProps = React.ComponentProps<typeof TextFieldWithLabel>

type TextFieldMultilineWithLabelBaseProps = Omit<
  TextFieldWithLabelProps,
  | 'multiline'
  | 'type'
  | 'inputMode'
  | 'pattern'
  | 'autoComplete'
  | 'onChange'
  | 'onFocus'
  | 'onBlur'
  | 'onKeyDown'
> & {
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement>
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>
}

export type TextFieldMultilineWithLabelProps =
  TextFieldMultilineWithLabelBaseProps &
    Pick<
      React.ComponentPropsWithoutRef<'textarea'>,
      'cols' | 'wrap' | 'spellCheck'
    >

const TextFieldMultilineWithLabel = ({
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  ...props
}: TextFieldMultilineWithLabelProps) => {
  return (
    <TextFieldWithLabel
      {...props}
      multiline
      onChange={
        onChange as React.ChangeEventHandler<
          HTMLInputElement | HTMLTextAreaElement
        >
      }
      onFocus={
        onFocus as React.FocusEventHandler<
          HTMLInputElement | HTMLTextAreaElement
        >
      }
      onBlur={
        onBlur as React.FocusEventHandler<
          HTMLInputElement | HTMLTextAreaElement
        >
      }
      onKeyDown={
        onKeyDown as React.KeyboardEventHandler<
          HTMLInputElement | HTMLTextAreaElement
        >
      }
    />
  )
}

export default TextFieldMultilineWithLabel
