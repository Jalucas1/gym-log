'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AuthGuard from '@/components/AuthGuard'
import AppFrame from '@/components/AppFrame'
import PageHeader from '@/components/PageHeader'

type Employee = { id: string; name: string; initials: string | null; active: boolean }

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [name, setName] = useState('')
  const [initials, setInitials] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => { loadEmployees() }, [])

  async function loadEmployees() {
    const { data } = await supabase.from('employees').select('id,name,initials,active').order('active', { ascending: false }).order('name')
    setEmployees(data || [])
  }

  async function saveEmployee() {
    setMessage('')
    if (!name.trim()) return setMessage('Employee name is required.')

    if (editingId) {
      const { error } = await supabase.from('employees').update({ name: name.trim(), initials: initials.trim() || null }).eq('id', editingId)
      if (error) return setMessage(error.message)
      setMessage('Employee updated.')
    } else {
      const { error } = await supabase.from('employees').insert({ name: name.trim(), initials: initials.trim() || null, active: true })
      if (error) return setMessage(error.message)
      setMessage('Employee added.')
    }

    setName('')
    setInitials('')
    setEditingId(null)
    loadEmployees()
  }

  function startEdit(employee: Employee) {
    setEditingId(employee.id)
    setName(employee.name)
    setInitials(employee.initials || '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function setActive(employee: Employee, active: boolean) {
    await supabase.from('employees').update({ active }).eq('id', employee.id)
    loadEmployees()
  }

  return (
    <AuthGuard>
      <AppFrame>
        <PageHeader title="Team Management" subtitle="Add, edit, deactivate, or reactivate employees without losing old log history." badge="Employees" />
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="card h-fit">
            <h2 className="section-title">{editingId ? 'Edit Employee' : 'Add Employee'}</h2>
            <p className="section-subtitle mb-6">Keep your active employee dropdown clean.</p>
            <label className="label">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="field mb-4" placeholder="Employee name" />
            <label className="label">Initials</label>
            <input value={initials} onChange={(e) => setInitials(e.target.value.toUpperCase())} className="field mb-5" placeholder="RM" maxLength={4} />
            {message && <p className="mb-4 rounded-2xl bg-[#8E24AA]/5 p-4 text-sm font-black text-[#8E24AA]">{message}</p>}
            <div className="flex gap-3">
              <button onClick={saveEmployee} className="btn-primary flex-1">{editingId ? 'Save Changes' : 'Add Employee'}</button>
              {editingId && <button onClick={() => { setEditingId(null); setName(''); setInitials('') }} className="btn-ghost">Cancel</button>}
            </div>
          </div>

          <div className="card">
            <h2 className="section-title">Employees</h2>
            <div className="mt-5 space-y-3">
              {employees.map((employee) => (
                <div key={employee.id} className="flex flex-col gap-4 rounded-[1.7rem] border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-black ${employee.active ? 'bg-[#8E24AA] text-white' : 'bg-slate-200 text-slate-500'}`}>{employee.initials || employee.name.slice(0, 2).toUpperCase()}</div>
                    <div>
                      <p className="text-lg font-black text-slate-950">{employee.name}</p>
                      <p className="text-sm font-bold text-slate-500">{employee.active ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(employee)} className="btn-ghost py-3">Edit</button>
                    {employee.active ? <button onClick={() => setActive(employee, false)} className="btn-ghost py-3">Deactivate</button> : <button onClick={() => setActive(employee, true)} className="btn-yellow py-3">Reactivate</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppFrame>
    </AuthGuard>
  )
}
