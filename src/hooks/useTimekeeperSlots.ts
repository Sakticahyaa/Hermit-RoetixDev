import { useState, useEffect, useCallback } from 'react'
import {
  fetchTimekeeperSlots,
  createTimekeeperSlot,
  updateTimekeeperSlot,
  deleteTimekeeperSlot,
} from '../lib/supabase'
import type { TimekeeperSlot, TimekeeperSlotInsert, TimekeeperSlotUpdate } from '../types'

export function useTimekeeperSlots(tenantId: string | undefined) {
  const [slots, setSlots] = useState<TimekeeperSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!tenantId) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchTimekeeperSlots(tenantId)
      setSlots(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  useEffect(() => { load() }, [load])

  const addSlot = async (slot: Omit<TimekeeperSlotInsert, 'tenant_id'>): Promise<void> => {
    if (!tenantId) return
    const created = await createTimekeeperSlot({ ...slot, tenant_id: tenantId })
    setSlots(prev => [...prev, created])
  }

  const editSlot = async (id: string, updates: TimekeeperSlotUpdate): Promise<void> => {
    const updated = await updateTimekeeperSlot(id, updates)
    setSlots(prev => prev.map(s => s.id === id ? updated : s))
  }

  const removeSlot = async (id: string): Promise<void> => {
    await deleteTimekeeperSlot(id)
    setSlots(prev => prev.filter(s => s.id !== id))
  }

  return { slots, loading, error, reload: load, addSlot, editSlot, removeSlot }
}
