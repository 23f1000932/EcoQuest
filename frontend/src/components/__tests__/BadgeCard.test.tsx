import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import BadgeCard from '../BadgeCard'
import type { Badge } from '../../types'

const mockBadge: Badge = {
  id: '1',
  slug: 'green-beginner',
  name: 'Green Beginner',
  description: 'Complete your first eco action',
  icon: '🌱',
  points_req: 0,
  color: '#86efac',
}

const mockEarnedBadge: Badge = {
  ...mockBadge,
  earned_at: '2025-01-15T10:00:00Z',
}

describe('BadgeCard', () => {
  it('renders badge name and icon', () => {
    render(<BadgeCard badge={mockBadge} earned />)
    expect(screen.getByText('Green Beginner')).toBeInTheDocument()
    expect(screen.getByText('🌱')).toBeInTheDocument()
  })

  it('shows earned date for earned badges', () => {
    render(<BadgeCard badge={mockEarnedBadge} earned />)
    expect(screen.getByText(/15 Jan/)).toBeInTheDocument()
  })

  it('shows points requirement for unearned badges', () => {
    render(<BadgeCard badge={mockBadge} earned={false} />)
    expect(screen.getByText('0 pts')).toBeInTheDocument()
  })

  it('renders lock icon for unearned badges', () => {
    const { container } = render(<BadgeCard badge={mockBadge} earned={false} />)
    // Lock icon from lucide-react renders as svg
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('has badge description as title attribute', () => {
    const { container } = render(<BadgeCard badge={mockBadge} earned />)
    const element = container.firstChild as HTMLElement
    expect(element).toHaveAttribute('title', 'Complete your first eco action')
  })
})
