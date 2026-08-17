import { Outlet, createFileRoute } from '@tanstack/react-router'

const LoginLayout = () => <Outlet />

export const Route = createFileRoute('/$locale/adds/login')({
  component: LoginLayout,
})
