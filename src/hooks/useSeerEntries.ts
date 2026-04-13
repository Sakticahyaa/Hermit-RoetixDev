import { useState, useEffect } from 'react'
import {
  fetchSeerEntries, createSeerEntry, updateSeerEntry, deleteSeerEntry,
} from '../lib/supabase'
import type { SeerEntry, SeerInsert, SeerUpdate } from '../types'

export function useSeerEntries(tenantId: string | undefined) {
  const [entries, setEntries] = useState<SeerEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return
    fetchSeerEntries(tenantId)
      .then(setEntries)
      .finally(() => setLoading(false))
  }, [tenantId])

  const addEntry = async (e: Omit<SeerInsert, 'tenant_id'>) => {
    if (!tenantId) return
    const created = await createSeerEntry({ ...e, tenant_id: tenantId })
    setEntries(prev => [...prev, created])
  }

  const editEntry = async (id: string, updates: SeerUpdate) => {
    const updated = await updateSeerEntry(id, updates)
    setEntries(prev => prev.map(e => e.id === id ? updated : e))
  }

  const removeEntry = async (id: string) => {
    await deleteSeerEntry(id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  return { entries, loading, addEntry, editEntry, removeEntry }
}
