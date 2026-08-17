import { createRouter as createTanStackRouter } from '@tanstack/react-router'

import { routeTree } from './routeTree.gen'

const StartNotFound = () => (
  <main
    style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: 24,
      background: '#f4f6f3',
      color: '#111111',
    }}
  >
    <div style={{ maxWidth: 520, textAlign: 'center' }}>
      <p
        style={{
          margin: '0 0 8px',
          fontSize: '3rem',
          fontWeight: 700,
        }}
      >
        404
      </p>
      <h1 style={{ margin: '0 0 12px', fontSize: '1.5rem' }}>
        Page not found
      </h1>
      <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: 1.5 }}>
        The page you are looking for does not exist or has been moved.
      </p>
    </div>
  </main>
)

export const createRouter = () =>
  createTanStackRouter({
    routeTree,
    defaultNotFoundComponent: StartNotFound,
    scrollRestoration: true,
  })

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
