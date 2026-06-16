import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Box, Typography } from '@mui/material'

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
    <Box
      component="main"
      sx={{
        height: '100vh',
        minHeight: '100vh',
        overflow: 'auto',
        px: { mobile: 2, desktop: 4 },
        py: { mobile: 3, desktop: 5 },
        backgroundColor: '#f4f6f3',
        color: '#111111',
      }}
    >
      <Box sx={{ maxWidth: 920, mx: 'auto' }}>
        <Typography
          component="h1"
          sx={{ mb: 1, fontSize: '1.25rem', fontWeight: 700 }}
        >
          Component fixtures
        </Typography>
        <Typography sx={{ mb: 3, maxWidth: 620, fontSize: '0.875rem' }}>
          Temporary development harness for isolated component refactor checks.
        </Typography>

        <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
          {componentFixtureMetadata.map((fixture) => (
            <Box
              component="li"
              key={fixture.id}
              sx={{
                mb: 3,
                p: 2,
                backgroundColor: '#ffffff',
                border: '1px solid #cbd3c9',
                borderRadius: 1,
              }}
            >
              <Typography
                component="h2"
                sx={{ mb: 0.5, fontSize: '1rem', fontWeight: 700 }}
              >
                {fixture.label}
              </Typography>
              {fixture.description && (
                <Typography
                  sx={{ mb: 1.5, fontSize: '0.8125rem', color: '#4e5a4d' }}
                >
                  {fixture.description}
                </Typography>
              )}
              <Box
                component="ul"
                sx={{
                  m: 0,
                  p: 0,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  listStyle: 'none',
                }}
              >
                {fixture.states.map((state) => (
                  <Box component="li" key={state.id}>
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
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default ComponentFixturesPage
