import type { AppRouteStaticData } from '#/common/routing/routeMetadata'

declare module '@tanstack/router-core' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- TanStack extends this interface through declaration merging.
  interface StaticDataRouteOption extends AppRouteStaticData {}
}

export {}
