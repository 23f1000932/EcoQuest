import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LeaderboardRow from '../LeaderboardRow'
import type { LeaderboardEntry } from '../../types'

const mockEntry: LeaderboardEntry = {
  rank: 1,
  id: 'u1',
  name: 'Alice',
  points: 1500,
  carbon_saved: 45.2,
  level: 4,
  badges: [
    { id: 'b1', slug: 'eco-explorer', name: 'Eco Explorer', description: 'Earn 200 pts', icon: '🌿', points_req: 200, color: '#4ade80' },
  ],
}

describe('LeaderboardRow', () => {
  it('renders user name and points', () => {
    render(<LeaderboardRow entry={mockEntry} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('1,500 pt')).toBeInTheDocument()
  })

  it('shows medal for top 3 ranks', () => {
    render(<LeaderboardRow entry={{ ...mockEntry, rank: 1 }} />)
    expect(screen.getByText('🥇')).toBeInTheDocument()
  })

  it('shows silver medal for rank 2', () => {
    render(<LeaderboardRow entry={{ ...mockEntry, rank: 2 }} />)
    expect(screen.getByText('🥈')).toBeInTheDocument()
  })

  it('shows bronze medal for rank 3', () => {
    render(<LeaderboardRow entry={{ ...mockEntry, rank: 3 }} />)
    expect(screen.getByText('🥉')).toBeInTheDocument()
  })

  it('shows numeric rank for rank > 3', () => {
    render(<LeaderboardRow entry={{ ...mockEntry, rank: 5 }} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('displays "You" for current user', () => {
    render(<LeaderboardRow entry={mockEntry} isCurrentUser />)
    expect(screen.getByText('You')).toBeInTheDocument()
    expect(screen.queryByText('Alice')).not.toBeInTheDocument()
  })

  it('renders carbon saved', () => {
    render(<LeaderboardRow entry={mockEntry} />)
    expect(screen.getByText('45.2kg')).toBeInTheDocument()
  })

  it('renders badge icons', () => {
    render(<LeaderboardRow entry={mockEntry} />)
    expect(screen.getByText('🌿')).toBeInTheDocument()
  })

  it('renders avatar initial when no avatar_url', () => {
    render(<LeaderboardRow entry={mockEntry} />)
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('renders avatar image when avatar_url is provided', () => {
    const entryWithAvatar = { ...mockEntry, avatar_url: 'https://example.com/avatar.jpg' }
    render(<LeaderboardRow entry={entryWithAvatar} />)
    const img = screen.getByAltText('Alice')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  it('has correct id attribute', () => {
    const { container } = render(<LeaderboardRow entry={mockEntry} />)
    expect(container.querySelector('#leaderboard-row-1')).toBeInTheDocument()
  })
})
