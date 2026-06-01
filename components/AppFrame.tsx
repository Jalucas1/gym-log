'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Walk-Around', icon: '✓' },
  { href: '/tanning', label: 'Tanning', icon: '☀' },
  { href: '/logs', label: 'Logs', icon: '≡' },
  { href: '/dashboard', label: 'Dashboard', icon: '▣' },
  { href: '/employees', label: 'Team', icon: '👤' },
]

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  function logout() {
    localStorage.removeItem('gymlog_authenticated')
    router.replace('/login')
  }

  return (
    <div className="page-shell">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/10 bg-black text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(142,36,170,0.55),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(255,193,7,0.18),transparent_35%)]" />
        <div className="relative flex h-full flex-col p-5">
          <div className="mb-8 rounded-[2rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFC107] text-2xl font-black text-black">G</div>
              <div>
                <p className="text-2xl font-black leading-none">GymLog</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.22em] text-white/55">PF Beachside </p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-4 text-sm font-black transition ${
                    active ? 'bg-[#8E24AA] text-white shadow-lg shadow-[#8E24AA]/30' : 'text-white/72 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <button onClick={logout} className="mt-auto rounded-2xl border border-white/10 px-4 py-4 text-left text-sm font-black text-white/70 hover:bg-white/10 hover:text-white">
            Logout
          </button>
        </div>
      </aside>

      <main className="content-wrap">{children}</main>

      <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-[1.6rem] border border-slate-200 bg-white/95 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur lg:hidden">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className={`rounded-2xl px-2 py-3 text-center text-[11px] font-black ${active ? 'bg-[#8E24AA] text-white' : 'text-slate-500'}`}>
              <div className="text-base leading-none">{item.icon}</div>
              <div className="mt-1 truncate">{item.label}</div>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
