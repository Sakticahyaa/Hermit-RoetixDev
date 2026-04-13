import { useState, useEffect } from 'react'
import { fetchMembers } from '../lib/supabase'
import type { Member } from '../types'

export function useMembers(tenantId: string | undefined) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tenantId) return
    fetchMembers(tenantId)
      .then(setMembers)
      .finally(() => setLoading(false))
  }, [tenantId])

  const getColor = (memberId: string | null): string => {
    if (!memberId) return '#6b7280'
    return members.find(m => m.id === memberId)?.avatar_color ?? '#6366f1'
  }

  const getName = (memberId: string | null): string => {
    if (!memberId) return '—'
    return members.find(m => m.id === memberId)?.name ?? '—'
  }

  return { members, loading, getColor, getName }
}
