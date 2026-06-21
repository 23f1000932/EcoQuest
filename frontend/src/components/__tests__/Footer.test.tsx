import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Footer from '../Footer'

describe('Footer', () => {
  const renderFooter = () =>
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    )

  it('renders brand name', () => {
    renderFooter()
    expect(screen.getByText('EcoQuest India')).toBeInTheDocument()
  })

  it('renders platform links', () => {
    renderFooter()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Leaderboard')).toBeInTheDocument()
    expect(screen.getByText('Rewards')).toBeInTheDocument()
  })

  it('renders legal links', () => {
    renderFooter()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
    expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('renders social media links', () => {
    renderFooter()
    expect(screen.getByText('Twitter')).toBeInTheDocument()
    expect(screen.getByText('Instagram')).toBeInTheDocument()
    expect(screen.getByText('GitHub')).toBeInTheDocument()
  })

  it('renders copyright notice', () => {
    renderFooter()
    expect(screen.getByText(/EcoQuest India. All rights reserved/)).toBeInTheDocument()
  })

  it('renders Gemini AI attribution', () => {
    renderFooter()
    expect(screen.getByText('Gemini AI')).toBeInTheDocument()
  })

  it('renders Platform section heading', () => {
    renderFooter()
    expect(screen.getByText('Platform')).toBeInTheDocument()
  })

  it('renders Legal section heading', () => {
    renderFooter()
    expect(screen.getByText('Legal')).toBeInTheDocument()
  })
})
