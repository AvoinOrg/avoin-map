import { Outlet, createFileRoute } from '@tanstack/react-router'

import { getLocaleObj } from '#/common/navigation/tolgee/shared'
import StartShellProviders from '#/start/StartShellProviders'
import { getStartStaticData } from '#/start/tolgee/staticData'

const LocaleLayout = () => {
  const { locale, tolgeeStaticData } = Route.useLoaderData()

  return (
    <StartShellProviders locale={locale} tolgeeStaticData={tolgeeStaticData}>
      <Outlet />
    </StartShellProviders>
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
