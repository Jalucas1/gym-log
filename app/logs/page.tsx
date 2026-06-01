'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AuthGuard from '@/components/AuthGuard'
import AppFrame from '@/components/AppFrame'
import PageHeader from '@/components/PageHeader'

type CleaningLog = { id: string; completed_at: string; employee_name: string | null; employee_initials: string | null; task_name: string | null; comment: string | null; photo_url: string | null }
type TanningLog = { id: string; completed_at: string; employee_name: string | null; employee_initials: string | null; bed_name: string | null; member_name: string | null; comment: string | null; photo_url: string | null }

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export default function LogsPage() {
  const [tab, setTab] = useState<'cleaning' | 'tanning'>('cleaning')
  const [cleaning, setCleaning] = useState<CleaningLog[]>([])
  const [tanning, setTanning] = useState<TanningLog[]>([])

  useEffect(() => { loadLogs() }, [])

  async function loadLogs() {
    const [{ data: cleaningData }, { data: tanningData }] = await Promise.all([
      supabase.from('cleaning_logs_view').select('*').order('completed_at', { ascending: false }).limit(100),
      supabase.from('tanning_logs_view').select('*').order('completed_at', { ascending: false }).limit(100),
    ])
    setCleaning(cleaningData || [])
    setTanning(tanningData || [])
  }

  return (
    <AuthGuard>
      <AppFrame>
        <PageHeader title="Logs" subtitle="Review cleaning and tanning activity in one premium operations view." badge="Audit Trail" />
        <div className="card">
          <div className="mb-6 flex rounded-2xl bg-slate-100 p-1">
            <button onClick={() => setTab('cleaning')} className={`flex-1 rounded-xl px-4 py-3 text-sm font-black ${tab === 'cleaning' ? 'bg-[#8E24AA] text-white' : 'text-slate-500'}`}>Cleaning Logs</button>
            <button onClick={() => setTab('tanning')} className={`flex-1 rounded-xl px-4 py-3 text-sm font-black ${tab === 'tanning' ? 'bg-[#8E24AA] text-white' : 'text-slate-500'}`}>Tanning Logs</button>
          </div>

          {tab === 'cleaning' ? (
            <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-black text-white"><tr><th className="p-4">Time</th><th>Employee</th><th>Task</th><th>Comments</th><th>Photo</th></tr></thead>
                <tbody>
                  {cleaning.map((log) => <tr key={log.id} className="border-t border-slate-100"><td className="p-4 font-black">{formatTime(log.completed_at)}</td><td>{log.employee_initials ? `${log.employee_initials} - ` : ''}{log.employee_name}</td><td className="font-bold">{log.task_name}</td><td>{log.comment || '—'}</td><td>{log.photo_url ? <a className="font-black text-[#8E24AA]" href={log.photo_url} target="_blank">View</a> : '—'}</td></tr>)}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-black text-white"><tr><th className="p-4">Time</th><th>Employee</th><th>Bed</th><th>Member</th><th>Comments</th><th>Photo</th></tr></thead>
                <tbody>
                  {tanning.map((log) => <tr key={log.id} className="border-t border-slate-100"><td className="p-4 font-black">{formatTime(log.completed_at)}</td><td>{log.employee_initials ? `${log.employee_initials} - ` : ''}{log.employee_name}</td><td className="font-bold">{log.bed_name}</td><td>{log.member_name || '—'}</td><td>{log.comment || '—'}</td><td>{log.photo_url ? <a className="font-black text-[#8E24AA]" href={log.photo_url} target="_blank">View</a> : '—'}</td></tr>)}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AppFrame>
    </AuthGuard>
  )
}
