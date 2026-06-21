import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ActivityCard from '../ActivityCard'
import type { Activity } from '../../types'

const mockActivity: Activity = {
  id: 'a1',
  user_id: 'u1',
  image_url: '',
  activity_type: 'Tree Plantation',
  description: 'Planted neem trees in local park',
  points_awarded: 50,
  carbon_saved: 12.5,
  confidence: 95,
  status: 'approved',
  created_at: '2025-03-10T10:00:00Z',
}

describe('ActivityCard', () => {
  it('renders activity type', () => {
    render(<ActivityCard activity={mockActivity} />)
    expect(screen.getByText('Tree Plantation')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<ActivityCard activity={mockActivity} />)
    expect(screen.getByText('Planted neem trees in local park')).toBeInTheDocument()
  })

  it('renders date when no description', () => {
    const noDesc = { ...mockActivity, description: undefined }
    render(<ActivityCard activity={noDesc} />)
    expect(screen.getByText(/10 Mar/)).toBeInTheDocument()
  })

  it('renders points when awarded', () => {
    render(<ActivityCard activity={mockActivity} />)
    expect(screen.getByText('+50 pts')).toBeInTheDocument()
  })

  it('shows Approved status', () => {
    render(<ActivityCard activity={mockActivity} />)
    expect(screen.getByText('Approved')).toBeInTheDocument()
  })

  it('shows Pending status', () => {
    const pending = { ...mockActivity, status: 'pending' as const }
    render(<ActivityCard activity={pending} />)
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('shows Rejected status', () => {
    const rejected = { ...mockActivity, status: 'rejected' as const }
    render(<ActivityCard activity={rejected} />)
    expect(screen.getByText('Rejected')).toBeInTheDocument()
  })

  it('renders carbon saved', () => {
    render(<ActivityCard activity={mockActivity} />)
    expect(screen.getByText('12.5kg')).toBeInTheDocument()
  })

  it('does not render points when zero', () => {
    const noPoints = { ...mockActivity, points_awarded: 0 }
    render(<ActivityCard activity={noPoints} />)
    expect(screen.queryByText(/pts/)).not.toBeInTheDocument()
  })

  it('renders tree icon emoji for Tree Plantation', () => {
    render(<ActivityCard activity={mockActivity} />)
    expect(screen.getByText('🌳')).toBeInTheDocument()
  })
})
