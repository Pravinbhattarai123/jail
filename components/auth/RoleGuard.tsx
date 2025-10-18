'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/lib/store'
import { setUser } from '@/lib/store/userSlice'

const ALLOWED = new Set(['ADMIN', 'MODERATOR', 'SELLER'])

export default function RoleGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const dispatch = useDispatch()
  const user = useSelector((s: RootState) => s.user.user)
   
  useEffect(() => {
    // If we already have a user, check role
    if (user) { 
      if (!ALLOWED.has((user as any).role)) router.replace('/login?next=/dashboard')
      return
    }
    // Else fetch from server to hydrate
    ;(async () => {
      try {
  const res = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' })
        if (!res.ok) throw new Error('unauthorized')
        const data = await res.json()
        dispatch(setUser(data.user))
      } catch {
        router.replace('/login?next=/dashboard')
      }
    })()
  }, [user, dispatch, router])

  if (!user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-600">Checking permissions…</div>
    )
  }

  if (!ALLOWED.has((user as any).role)) return null
  return <>{children}</>
}
