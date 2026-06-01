'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AuthGuard from '@/components/AuthGuard'
import AppFrame from '@/components/AppFrame'
import PageHeader from '@/components/PageHeader'

type Activity = { type: string; title: string; subtitle: string; time: string }

function startOfTodayIso() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ cleaning: 0, tanning: 0, employees: 0, tasks: 0 })
  const [activity, setActivity] = useState<Activity[]>([])

  useEffect(() => { loadDashboard() }, [])

  async function loadDashboard() {
    const today = startOfTodayIso()
    const [cleaningCount, tanningCount, employeeCount, taskCount, cleaningRecent, tanningRecent] = await Promise.all([
      supabase.from('cleaning_logs').select('id', { count: 'exact', head: true }).gte('completed_at', today),
      supabase.from('tanning_logs').select('id', { count: 'exact', head: true }).gte('completed_at', today),
      supabase.from('employees').select('id', { count: 'exact', head: true }).eq('active', true),
      supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('active', true),
      supabase.from('cleaning_logs_view').select('*').order('completed_at', { ascending: false }).limit(5),
      supabase.from('tanning_logs_view').select('*').order('completed_at', { ascending: false }).limit(5),
    ])

    setStats({
      cleaning: cleaningCount.count || 0,
      tanning: tanningCount.count || 0,
      employees: employeeCount.count || 0,
      tasks: taskCount.count || 0,
    })

    const merged: Activity[] = [
      ...(cleaningRecent.data || []).map((x: any) => ({ type: 'Cleaning', title: x.task_name, subtitle: x.employee_initials ? `${x.employee_initials} - ${x.employee_name}` : x.employee_name, time: x.completed_at })),
      ...(tanningRecent.data || []).map((x: any) => ({ type: 'Tanning', title: x.bed_name, subtitle: x.employee_initials ? `${x.employee_initials} - ${x.employee_name}` : x.employee_name, time: x.completed_at })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8)

    setActivity(merged)
  }

  const cards = [
    { label: "Today's Cleaning", value: stats.cleaning, icon: '✓' },
    { label: "Today's Tanning", value: stats.tanning, icon: '☀' },
    { label: 'Active Team', value: stats.employees, icon: '👤' },
    { label: 'Active Tasks', value: stats.tasks, icon: '▣' },
  ]

  return (
    <AuthGuard>
      <AppFrame>
        <PageHeader title="Dashboard" subtitle="A clean executive view of today's facility activity." badge="Operations Overview" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="card p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8E24AA] text-2xl font-black text-white">{card.icon}</div>
                <span className="rounded-full bg-[#FFC107] px-3 py-1 text-xs font-black text-black">LIVE</span>
              </div>
              <p className="mt-6 text-5xl font-black text-slate-950">{card.value}</p>
              <p className="mt-1 text-sm font-black uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="card mt-6">
          <h2 className="section-title">Recent Activity</h2>
          <p className="section-subtitle mb-5">Newest activity across cleaning and tanning logs.</p>
          <div className="space-y-3">
            {activity.map((item, index) => (
              <div key={`${item.time}-${index}`} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                <div>
                  <div className="pill mb-2 border-[#8E24AA]/20 bg-[#8E24AA]/5 text-[#8E24AA]">{item.type}</div>
                  <p className="text-lg font-black text-slate-950">{item.title}</p>
                  <p className="text-sm font-bold text-slate-500">{item.subtitle}</p>
                </div>
                <div className="rounded-2xl bg-black px-4 py-3 text-sm font-black text-white">{formatTime(item.time)}</div>
              </div>
            ))}
            {activity.length === 0 && <p className="rounded-2xl bg-slate-50 p-5 text-center font-bold text-slate-500">No activity yet.</p>}
          </div>
        </div>
      </AppFrame>
    </AuthGuard>
  )
}
