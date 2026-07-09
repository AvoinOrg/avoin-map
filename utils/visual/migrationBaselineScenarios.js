const MIGRATION_BASELINE_EXTRA_SCENARIOS = [
  {
    id: 'main-forests',
    applet: 'main',
    locale: 'en',
    path: '/en/forests',
    requiresWebGL: true,
    tags: ['migration-baseline', 'applet:main', 'legacy:forests'],
  },
  {
    id: 'carbon-report',
    applet: 'carbon',
    locale: 'fi',
    path: '/fi/carbon/report',
    requiresWebGL: true,
    tags: ['migration-baseline', 'applet:carbon', 'surface:report'],
  },
  {
    id: 'carbon-plans',
    applet: 'carbon',
    locale: 'fi',
    path: '/fi/carbon/plans',
    requiresWebGL: true,
    tags: ['migration-baseline', 'applet:carbon', 'surface:plans'],
  },
  {
    id: 'luonnonmetsakartat-admin',
    applet: 'luonnonmetsakartat',
    locale: 'fi',
    path: '/fi/luonnonmetsakartat/admin',
    requiresWebGL: true,
    tags: [
      'migration-baseline',
      'applet:luonnonmetsakartat',
      'surface:admin-unauthenticated',
    ],
  },
  {
    id: 'luonnonmetsakartat-admin-import',
    applet: 'luonnonmetsakartat',
    locale: 'fi',
    path: '/fi/luonnonmetsakartat/admin/tuo',
    requiresWebGL: true,
    tags: [
      'migration-baseline',
      'applet:luonnonmetsakartat',
      'surface:admin-import-unauthenticated',
    ],
  },
]

module.exports = {
  MIGRATION_BASELINE_EXTRA_SCENARIOS,
}
