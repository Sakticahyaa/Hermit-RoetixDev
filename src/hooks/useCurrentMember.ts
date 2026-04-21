import { useState } from 'react'
import type { Member } from '../types'

const KEY = 'hermit-member-id'

export function useCurrentMember(members: Member[]) {
  const [memberId, setMemberId] = useState<string | null>(() => localStorage.getItem(KEY))

  const currentMember = members.find(m => m.id === memberId) ?? null

  const pick = (member: Member) => {
    localStorage.setItem(KEY, member.id)
    setMemberId(member.id)
  }

  const clear = () => {
    localStorage.removeItem(KEY)
    setMemberId(null)
  }

  return { currentMember, pick, clear, needsPick: !currentMember && members.length > 0 }
}
