import { useState, useEffect } from 'react'
import { fetchTenant } from '../lib/supabase'
import type { Tenant } from '../types'

const SLUG = import.meta.env.VITE_TENANT_SLUG as string || 'roetixdev'

export function useTenant() {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTenant(SLUG)
      .then(setTenant)
      .finally(() => setLoading(false))
  }, [])

  return { tenant, loading }
}
