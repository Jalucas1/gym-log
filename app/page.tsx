'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AuthGuard from '@/components/AuthGuard'
import AppFrame from '@/components/AppFrame'
import PageHeader from '@/components/PageHeader'
import PhotoInput from '@/components/PhotoInput'

type Employee = { id: string; name: string; initials: string | null }
type Task = { id: string; name: string }

export default function HomePage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [employeeId, setEmployeeId] = useState('')
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [comment, setComment] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [{ data: employeeData }, { data: taskData }] = await Promise.all([
      supabase.from('employees').select('id,name,initials').eq('active', true).order('name'),
      supabase.from('tasks').select('id,name').eq('active', true).order('name'),
    ])
    setEmployees(employeeData || [])
    setTasks(taskData || [])
  }

  const allSelected = selectedTasks.length === tasks.length && tasks.length > 0
  const selectedLabel = useMemo(() => `${selectedTasks.length} selected`, [selectedTasks])

  function toggleTask(id: string) {
    setSelectedTasks((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id])
  }

  function toggleAll() {
    setSelectedTasks(allSelected ? [] : tasks.map((task) => task.id))
  }

  async function uploadPhoto() {
    if (!photo) return null
    const ext = photo.name.split('.').pop() || 'jpg'
    const path = `cleaning/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('cleaning-photos').upload(path, photo)
    if (error) throw error
    const { data } = supabase.storage.from('cleaning-photos').getPublicUrl(path)
    return data.publicUrl
  }

  async function submitTasks() {
    setMessage('')
    if (!employeeId) return setMessage('Please select an employee.')
    if (selectedTasks.length === 0) return setMessage('Please select at least one task.')

    try {
      setSaving(true)
      const photoUrl = await uploadPhoto()
      const rows = selectedTasks.map((taskId) => ({ employee_id: employeeId, task_id: taskId, comment: comment || null, photo_url: photoUrl }))
      const { error } = await supabase.from('cleaning_logs').insert(rows)
      if (error) throw error
      setEmployeeId('')
      setSelectedTasks([])
      setComment('')
      setPhoto(null)
      setMessage(`Logged ${rows.length} cleaning task${rows.length === 1 ? '' : 's'} successfully.`)
    } catch (error: any) {
      setMessage(error.message || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AuthGuard>
      <AppFrame>
        <PageHeader title="Log Cleaning Tasks" subtitle="Select completed tasks, add notes, and submit. Time records automatically." badge="Cleaning Log" />
        <div className="card">
          <div className="grid gap-8 xl:grid-cols-[1fr_0.72fr]">
            <section>
              <label className="label">Employee</label>
              <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="field mb-8 text-lg">
                <option value="">Select employee</option>
                {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.initials ? `${employee.initials} - ${employee.name}` : employee.name}</option>)}
              </select>

              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="section-title">Tasks Completed</h2>
                  <p className="section-subtitle">{selectedLabel}</p>
                </div>
                <button onClick={toggleAll} className="btn-ghost shrink-0">{allSelected ? 'Clear All' : 'Select All'}</button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {tasks.map((task) => {
                  const selected = selectedTasks.includes(task.id)
                  return (
                    <button key={task.id} onClick={() => toggleTask(task.id)} className={`flex min-h-20 items-center gap-4 rounded-2xl border px-5 py-4 text-left text-lg font-black transition ${selected ? 'border-[#8E24AA] bg-[#8E24AA] text-white shadow-lg shadow-[#8E24AA]/20' : 'border-slate-200 bg-white text-slate-700 hover:border-[#8E24AA]/40 hover:bg-[#8E24AA]/5'}`}>
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 ${selected ? 'border-white bg-[#FFC107] text-black' : 'border-slate-400 bg-white'}`}>{selected ? '✓' : ''}</span>
                      {task.name}
                    </button>
                  )
                })}
              </div>
            </section>

            <aside className="space-y-5">
              <div>
                <label className="label">Comments</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="field min-h-44 resize-none" placeholder="Add notes, issues, or supplies needed..." />
              </div>
              <PhotoInput onChange={setPhoto} />
              {photo && <p className="pill w-full justify-center">Photo attached: {photo.name}</p>}
              {message && <p className="rounded-2xl border border-[#8E24AA]/20 bg-[#8E24AA]/5 p-4 text-sm font-black text-[#8E24AA]">{message}</p>}
              <button onClick={submitTasks} disabled={saving} className="btn-primary w-full disabled:opacity-60">{saving ? 'Submitting...' : 'Submit Tasks'}</button>
              <div className="rounded-[2rem] border border-[#FFC107]/40 bg-[#FFC107]/15 p-5 text-sm font-bold text-slate-800">Time will be recorded automatically when you submit.</div>
            </aside>
          </div>
        </div>
      </AppFrame>
    </AuthGuard>
  )
}
