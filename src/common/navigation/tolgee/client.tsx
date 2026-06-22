'use client'

import { TolgeeBase } from './shared'
import { TolgeeProvider, useTolgeeSSR } from '@tolgee/react'
import type { TolgeeStaticData } from '@tolgee/web'
import { useEffect } from 'react'

import { useAppRouter } from '#/common/navigation/navigation'

type Props = {
  locales: TolgeeStaticData
  locale: string
  children: React.ReactNode
}

const tolgee = TolgeeBase().init()

export const TolgeeNextProvider = ({ locale, locales, children }: Props) => {
  // synchronize SSR and client first render
  const tolgeeSSR = useTolgeeSSR(tolgee, locale, locales)
  const router = useAppRouter()

  useEffect(() => {
    const { unsubscribe } = tolgeeSSR.on('permanentChange', () => {
      // refresh page when there is a translation update
      router.refresh()
    })

    return () => unsubscribe()
  }, [tolgeeSSR, router])

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
