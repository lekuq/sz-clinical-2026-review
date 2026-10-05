import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_SETTINGS } from '@/lib/db'
import type { UserSettings } from '@/types/persistence'
import { useRepository } from './useRepository'

export function useSettings() {
  const repository = useRepository()
  const [settings, setSettings] = useState<UserSettings>({ ...DEFAULT_SETTINGS })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    repository
      .getSettings()
      .then((stored) => {
        if (!cancelled) setSettings(stored)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [repository])

  const updateSettings = useCallback(
    async (patch: Partial<UserSettings>) => {
      const next = { ...settings, ...patch }
      setSettings(next)
      await repository.saveSettings(next)
    },
    [repository, settings],
  )

  return { settings, loading, updateSettings }
}
