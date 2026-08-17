import { TolgeeBase } from './shared'
import { TolgeeProvider, useTolgeeSSR } from '@tolgee/react'
import type { TolgeeStaticData } from '@tolgee/web'
import { useEffect } from 'react'

import { useAppRouter } from '#/common/navigation/navigation'

type Props = {
  staticData: TolgeeStaticData
  locale: string
  children: React.ReactNode
}

const tolgee = TolgeeBase().init()

export const TolgeeAppProvider = ({
  locale,
  staticData,
  children,
}: Props) => {
  // synchronize SSR and client first render
  const tolgeeSSR = useTolgeeSSR(tolgee, locale, staticData)
  const appRouter = useAppRouter()

  useEffect(() => {
    const { unsubscribe } = tolgeeSSR.on('permanentChange', () => {
      // refresh page when there is a translation update
      appRouter.refresh()
    })

    return () => unsubscribe()
  }, [tolgeeSSR, appRouter])

  return (
    <TolgeeProvider
      tolgee={tolgeeSSR}
      options={{ useSuspense: false }}
      fallback="Loading"
    >
      {children}
    </TolgeeProvider>
  )
}
