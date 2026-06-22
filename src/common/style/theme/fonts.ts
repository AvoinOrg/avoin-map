import { Arimo } from 'next/font/google'

export { ARIMO_FONT_FAMILY } from './fontConstants'

export const arimo = Arimo({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-arimo',
  fallback: [
    'Arial',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
  ],
})
