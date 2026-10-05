import { useMemo } from 'react'
import { BANK_CONFIG } from '@/config/bank'
import { createRepository } from '@/lib/db'

export function useRepository() {
  return useMemo(() => createRepository(BANK_CONFIG.bankId), [])
}
