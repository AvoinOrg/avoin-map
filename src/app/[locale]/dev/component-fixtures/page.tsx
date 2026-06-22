import Link from 'next/link'
import { notFound } from 'next/navigation'

import { componentFixtureMetadata } from '#/common/component-fixtures/metadata'

type Props = {
  params: Promise<{ locale: string }>
}

const assertDevelopmentFixtureRoute = () => {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }
}

const ComponentFixturesPage = async ({ params }: Props) => {
  assertDevelopmentFixtureRoute()

  const { locale } = await params

  return (
    <main
      style={{
        height: '100vh',
        minHeight: '100vh',
        overflow: 'auto',
        padding: '40px 32px',
        backgroundColor: '#f4f6f3',
        color: '#111111',
      }}
    >
      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        <h1
          style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 700 }}
        >
          Component fixtures
        </h1>
        <p style={{ margin: '0 0 24px', maxWidth: 620, fontSize: '0.875rem' }}>
          Temporary development harness for isolated component refactor checks.
        </p>

        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {componentFixtureMetadata.map((fixture) => (
            <li
              key={fixture.id}
              style={{
                marginBottom: 24,
                padding: 16,
                backgroundColor: '#ffffff',
                border: '1px solid #cbd3c9',
                borderRadius: 4,
              }}
            >
              <h2
                style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700 }}
              >
                {fixture.label}
              </h2>
              {fixture.description && (
                <p
                  style={{
                    margin: '0 0 12px',
                    fontSize: '0.8125rem',
                    color: '#4e5a4d',
                  }}
                >
                  {fixture.description}
                </p>
              )}
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  listStyle: 'none',
                }}
              >
                {fixture.states.map((state) => (
                  <li key={state.id}>
                    <Link
                      href={`/${locale}/dev/component-fixtures/${fixture.id}/${state.id}`}
                      style={{
                        display: 'inline-flex',
                        padding: '6px 10px',
                        color: '#111111',
                        fontSize: '0.8125rem',
                        textDecoration: 'none',
                        border: '1px solid #9ea99c',
                        borderRadius: 4,
                      }}
                    >
                      {state.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}

export default ComponentFixturesPage
