import { describe, it, expect } from 'vitest'
import { getLevelInfo, LEVELS, ACTIVITY_ICONS, ACTIVITY_COLORS } from '../index'

describe('getLevelInfo', () => {
  it('returns Seedling for 0 points', () => {
    const info = getLevelInfo(0)
    expect(info.label).toBe('Seedling')
    expect(info.level).toBe(1)
  })

  it('returns Sapling for 150 points', () => {
    const info = getLevelInfo(150)
    expect(info.label).toBe('Sapling')
    expect(info.level).toBe(2)
  })

  it('returns Tree for 400 points', () => {
    const info = getLevelInfo(400)
    expect(info.label).toBe('Tree')
    expect(info.level).toBe(3)
  })

  it('returns Grove for 700 points', () => {
    const info = getLevelInfo(700)
    expect(info.label).toBe('Grove')
    expect(info.level).toBe(4)
  })

  it('returns Forest Guardian for 1200 points', () => {
    const info = getLevelInfo(1200)
    expect(info.label).toBe('Forest Guardian')
    expect(info.level).toBe(5)
  })

  it('returns Sustainability Legend for 2500 points', () => {
    const info = getLevelInfo(2500)
    expect(info.label).toBe('Sustainability Legend')
    expect(info.level).toBe(6)
  })

  it('calculates correct progress percentage', () => {
    const info = getLevelInfo(50) // halfway through Seedling (0-100)
    expect(info.progress).toBe(50)
  })

  it('caps progress at 100 for max level', () => {
    const info = getLevelInfo(5000)
    expect(info.progress).toBe(100)
  })

  it('returns next level info', () => {
    const info = getLevelInfo(50)
    expect(info.next).not.toBeNull()
    expect(info.next?.label).toBe('Sapling')
  })

  it('returns null next for max level', () => {
    const info = getLevelInfo(2500)
    expect(info.next).toBeNull()
  })
})

describe('LEVELS', () => {
  it('has 6 levels', () => {
    expect(LEVELS).toHaveLength(6)
  })

  it('levels are in ascending order', () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].min).toBeGreaterThan(LEVELS[i - 1].min)
    }
  })

  it('each level has required fields', () => {
    LEVELS.forEach(level => {
      expect(level).toHaveProperty('level')
      expect(level).toHaveProperty('label')
      expect(level).toHaveProperty('min')
      expect(level).toHaveProperty('max')
    })
  })
})

describe('ACTIVITY_ICONS', () => {
  it('has icon for Tree Plantation', () => {
    expect(ACTIVITY_ICONS['Tree Plantation']).toBe('🌳')
  })

  it('has icon for Cycling', () => {
    expect(ACTIVITY_ICONS['Cycling']).toBe('🚴')
  })

  it('has icon for Public Transport', () => {
    expect(ACTIVITY_ICONS['Public Transport']).toBe('🚌')
  })

  it('has at least 5 activity types', () => {
    expect(Object.keys(ACTIVITY_ICONS).length).toBeGreaterThanOrEqual(5)
  })
})

describe('ACTIVITY_COLORS', () => {
  it('has color for each activity type with icon', () => {
    Object.keys(ACTIVITY_ICONS).forEach(type => {
      expect(ACTIVITY_COLORS).toHaveProperty(type)
    })
  })

  it('colors contain gradient classes', () => {
    Object.values(ACTIVITY_COLORS).forEach(color => {
      expect(color).toMatch(/from-/)
      expect(color).toMatch(/to-/)
    })
  })
})
