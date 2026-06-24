import { Outlet, createFileRoute } from '@tanstack/react-router'

import { getLocaleObj } from '#/common/navigation/tolgee/shared'
import ShellProvider from '#/runtime/ShellProvider'
import { getStartStaticData } from '#/runtime/tolgee/staticData'

const LocaleLayout = () => {
  const { locale, tolgeeStaticData } = Route.useLoaderData()

  return (
    <ShellProvider locale={locale} tolgeeStaticData={tolgeeStaticData}>
      <Outlet />
    </ShellProvider>
  )
}

export const Route = createFileRoute('/$locale')({
  loader: ({ params }) => {
    const locale = params.locale

    return {
      locale,
      tolgeeStaticData: getStartStaticData(getLocaleObj(locale)),
    }
  },
  component: LocaleLayout,
})
