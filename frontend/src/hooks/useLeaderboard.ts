import { useState, useEffect } from 'react'
import { apiClient } from '../api/client'
import type { LeaderboardEntry } from '../types'

export function useLeaderboard(limit = 100) {
  const [data, setData] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiClient.get(`/leaderboard?limit=${limit}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [limit])

  return { data, loading, error }
}
