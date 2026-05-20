import React from 'react'

import DropDownSelectWithHeader from '#/components/common/DropDownSelectWithHeader'

type DropDownSelectWithLabelProps = React.ComponentProps<
  typeof DropDownSelectWithHeader
>

const DropDownSelectWithLabel = (props: DropDownSelectWithLabelProps) => {
  return <DropDownSelectWithHeader {...props} />
}

export default DropDownSelectWithLabel
