import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { ProtectedRoute, AdminRoute } from '../ProtectedRoute'
import { useAuth } from '../../hooks/useAuth'

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}))

describe('ProtectedRoute', () => {
  it('shows loading state when auth is loading', () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ user: null, loading: true })
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )
    expect(screen.getByText('Loading EcoQuest...')).toBeInTheDocument()
  })

  it('renders children when user is authenticated', () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: '1', name: 'Test', is_admin: false },
      loading: false,
    })
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to landing when no user', () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ user: null, loading: false })
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})

describe('AdminRoute', () => {
  it('renders children for admin users', () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: '1', name: 'Admin', is_admin: true },
      loading: false,
    })
    render(
      <MemoryRouter>
        <AdminRoute>
          <div>Admin Content</div>
        </AdminRoute>
      </MemoryRouter>
    )
    expect(screen.getByText('Admin Content')).toBeInTheDocument()
  })

  it('redirects non-admin users to dashboard', () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: '1', name: 'User', is_admin: false },
      loading: false,
    })
    render(
      <MemoryRouter>
        <AdminRoute>
          <div>Admin Content</div>
        </AdminRoute>
      </MemoryRouter>
    )
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
  })
})
