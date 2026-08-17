import { createFileRoute, redirect } from '@tanstack/react-router'

import { DEFAULT_LOCALE } from '#/common/navigation/tolgee/shared'

const IndexRoute = () => null

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({
      href: `/${DEFAULT_LOCALE}`,
      statusCode: 308,
    })
  },
  component: IndexRoute,
})
