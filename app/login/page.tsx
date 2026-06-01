'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')

  function login(e: React.FormEvent) {
    e.preventDefault()
    const expected = process.env.NEXT_PUBLIC_APP_PASSCODE || '7084'
    if (passcode === expected) {
      localStorage.setItem('gymlog_authenticated', 'true')
      router.replace('/')
      return
    }
    setError('Incorrect passcode. Please try again.')
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(142,36,170,0.75),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,193,7,0.35),transparent_32%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-5 py-10">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-white/80 backdrop-blur">
              <span className="h-3 w-3 rounded-full bg-[#FFC107]" /> Facility Operations
            </div>
            <h1 className="text-6xl font-black tracking-tight sm:text-7xl lg:text-8xl">Gym<span className="text-[#FFC107]">Log</span></h1>
            <p className="mt-5 max-w-xl text-xl font-semibold leading-8 text-white/72">Premium cleaning and tanning log management for high-accountability fitness facilities.</p>
          </div>

          <form onSubmit={login} className="rounded-[2.5rem] border border-white/15 bg-white p-6 text-black shadow-[0_30px_90px_rgba(0,0,0,0.45)] sm:p-8">
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8E24AA] text-2xl font-black text-white">G</div>
              <div>
                <h2 className="text-3xl font-black tracking-tight">Staff Login</h2>
                <p className="text-sm font-bold text-slate-500">Enter your facility passcode.</p>
              </div>
            </div>

            <label className="label">Passcode</label>
            <input
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="field text-2xl tracking-[0.25em]"
              type="password"
              inputMode="numeric"
              placeholder="••••"
            />

            {error && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</p>}

            <button className="btn-yellow mt-6 w-full">Access GymLog</button>
            
          </form>
        </div>
      </div>
    </main>
  )
}
