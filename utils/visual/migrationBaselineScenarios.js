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
    id: 'hiilikartta-report',
    applet: 'hiilikartta',
    locale: 'fi',
    path: '/fi/hiilikartta/raportti',
    requiresWebGL: true,
    tags: ['migration-baseline', 'applet:hiilikartta', 'surface:report'],
  },
  {
    id: 'hiilikartta-plans',
    applet: 'hiilikartta',
    locale: 'fi',
    path: '/fi/hiilikartta/kaavat',
    requiresWebGL: true,
    tags: ['migration-baseline', 'applet:hiilikartta', 'surface:plans'],
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
