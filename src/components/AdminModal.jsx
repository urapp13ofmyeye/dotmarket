'use client'

import { useState } from 'react'

export default function AdminModal({ onSuccess, onClose }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        onSuccess(password)
      } else {
        setError(true)
        setPassword('')
      }
    } catch {
      setError(true)
      setPassword('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xs"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-center text-2xl mb-1">🔒</p>
        <h2 className="text-center text-sm font-bold text-gray-600 mb-4">관리자 확인</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(false) }}
            className={`border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 transition ${
              error
                ? 'border-red-300 focus:ring-red-100'
                : 'border-pink-200 focus:ring-pink-100'
            }`}
            autoFocus
            disabled={loading}
          />
          {error && (
            <p className="text-xs text-red-400 text-center -mt-1">비밀번호가 틀렸어요</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-pink-400 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-pink-500 transition disabled:opacity-60"
          >
            {loading ? '확인 중...' : '확인'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-300 text-xs text-center hover:text-gray-400 transition"
          >
            취소
          </button>
        </form>
      </div>
    </div>
  )
}
