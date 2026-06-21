import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { vi } from 'vitest'
import { useAuth } from './hooks/useAuth'

// Mock the hook so we don't need Supabase connected
vi.mock('./hooks/useAuth', () => ({
  useAuth: vi.fn()
}))

describe('App Component', () => {
  it('renders landing page when not logged in', async () => {
    (useAuth as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ loading: false, user: null })

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )
    
    // Verify the app renders by checking for the Sign In button
    expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })
})
