import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StatCard from '../StatCard'
import { Zap } from 'lucide-react'

describe('StatCard', () => {
  it('renders title and value', () => {
    render(<StatCard title="Total Points" value={1234} icon={<Zap />} />)
    expect(screen.getByText('Total Points')).toBeInTheDocument()
    expect(screen.getByText('1234')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(<StatCard title="Carbon Saved" value="42.5 kg" icon={<Zap />} subtitle="This month" />)
    expect(screen.getByText('This month')).toBeInTheDocument()
  })

  it('does not render subtitle when not provided', () => {
    render(<StatCard title="Carbon Saved" value="42.5 kg" icon={<Zap />} />)
    expect(screen.queryByText('This month')).not.toBeInTheDocument()
  })

  it('renders with different color variants', () => {
    const { container } = render(
      <StatCard title="Test" value={100} icon={<Zap />} color="blue" />
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders string values correctly', () => {
    render(<StatCard title="Level" value="Forest Guardian" icon={<Zap />} />)
    expect(screen.getByText('Forest Guardian')).toBeInTheDocument()
  })
})
