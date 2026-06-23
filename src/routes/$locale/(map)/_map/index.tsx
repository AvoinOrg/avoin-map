import { createFileRoute } from '@tanstack/react-router'

import MainPage from 'applets/(main)/page'

export const Route = createFileRoute('/$locale/(map)/_map/')({
  component: MainPage,
})
