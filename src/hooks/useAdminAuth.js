'use client'

import { useState } from 'react'

const SESSION_KEY = 'dot_admin_pw'

export function useAdminAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const verify = async (password) => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) return true
      setError(true)
      return false
    } catch {
      setError(true)
      return false
    } finally {
      setLoading(false)
    }
  }

  const getSaved = () => sessionStorage.getItem(SESSION_KEY)
  const save = (pw) => sessionStorage.setItem(SESSION_KEY, pw)
  const clear = () => sessionStorage.removeItem(SESSION_KEY)

  return { verify, loading, error, setError, getSaved, save, clear }
}
