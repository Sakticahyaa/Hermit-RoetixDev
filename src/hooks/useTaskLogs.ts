import { useState, useEffect } from 'react'
import { fetchTaskLogs } from '../lib/supabase'
import type { TaskLog } from '../types'

export function useTaskLogs(taskId: string | null) {
  const [logs, setLogs] = useState<TaskLog[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!taskId) { setLogs([]); return }
    setLoading(true)
    fetchTaskLogs(taskId)
      .then(setLogs)
      .finally(() => setLoading(false))
  }, [taskId])

  return { logs, loading }
}
