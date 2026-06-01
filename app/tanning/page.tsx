'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AuthGuard from '@/components/AuthGuard'
import AppFrame from '@/components/AppFrame'
import PageHeader from '@/components/PageHeader'
import PhotoInput from '@/components/PhotoInput'

type Employee = { id: string; name: string; initials: string | null }
type Bed = { id: string; name: string }

export default function TanningPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [beds, setBeds] = useState<Bed[]>([])
  const [employeeId, setEmployeeId] = useState('')
  const [bedId, setBedId] = useState('')
  const [memberName, setMemberName] = useState('')
  const [comment, setComment] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [{ data: employeeData }, { data: bedData }] = await Promise.all([
      supabase.from('employees').select('id,name,initials').eq('active', true).order('name'),
      supabase.from('tanning_beds').select('id,name').eq('active', true).order('name'),
    ])
    setEmployees(employeeData || [])
    setBeds(bedData || [])
  }

  async function uploadPhoto() {
    if (!photo) return null
    const ext = photo.name.split('.').pop() || 'jpg'
    const path = `tanning/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('cleaning-photos').upload(path, photo)
    if (error) throw error
    const { data } = supabase.storage.from('cleaning-photos').getPublicUrl(path)
    return data.publicUrl
  }

  async function submitLog() {
    setMessage('')
    if (!employeeId) return setMessage('Please select an employee.')
    if (!bedId) return setMessage('Please select the bed cleaned.')

    try {
      setSaving(true)
      const photoUrl = await uploadPhoto()
      const { error } = await supabase.from('tanning_logs').insert({
        employee_id: employeeId,
        tanning_bed_id: bedId,
        member_name: memberName || null,
        comment: comment || null,
        photo_url: photoUrl,
      })
      if (error) throw error
      setEmployeeId('')
      setBedId('')
      setMemberName('')
      setComment('')
      setPhoto(null)
      setMessage('Tanning cleaning log submitted successfully.')
    } catch (error: any) {
      setMessage(error.message || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AuthGuard>
      <AppFrame>
        <PageHeader title="Tanning Log" subtitle="Record bed cleanings with member details, comments, and optional photo proof." badge="Tanning Cleaning" />
        <div className="card">
          <div className="grid gap-8 xl:grid-cols-[1fr_0.75fr]">
            <section>
              <label className="label">Employee</label>
              <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="field mb-8 text-lg">
                <option value="">Select employee</option>
                {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.initials ? `${employee.initials} - ${employee.name}` : employee.name}</option>)}
              </select>

              <h2 className="section-title mb-4">Bed Cleaned</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {beds.map((bed) => {
                  const selected = bedId === bed.id
                  return (
                    <button key={bed.id} onClick={() => setBedId(bed.id)} className={`rounded-[1.7rem] border px-5 py-8 text-left text-xl font-black transition ${selected ? 'border-[#8E24AA] bg-[#8E24AA] text-white shadow-lg shadow-[#8E24AA]/20' : 'border-slate-200 bg-white text-slate-800 hover:border-[#8E24AA]/40 hover:bg-[#8E24AA]/5'}`}>
                      <span className="mb-4 block text-3xl">☀</span>
                      {bed.name}
                    </button>
                  )
                })}
              </div>

              <label className="label mt-8">Member Name</label>
              <input value={memberName} onChange={(e) => setMemberName(e.target.value)} className="field" placeholder="Optional member name" />
            </section>

            <aside className="space-y-5">
              <div>
                <label className="label">Comments</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="field min-h-44 resize-none" placeholder="Add notes about the cleaning..." />
              </div>
              <PhotoInput onChange={setPhoto} />
              {photo && <p className="pill w-full justify-center">Photo attached: {photo.name}</p>}
              {message && <p className="rounded-2xl border border-[#8E24AA]/20 bg-[#8E24AA]/5 p-4 text-sm font-black text-[#8E24AA]">{message}</p>}
              <button onClick={submitLog} disabled={saving} className="btn-primary w-full disabled:opacity-60">{saving ? 'Submitting...' : 'Submit Tanning Log'}</button>
            </aside>
          </div>
        </div>
      </AppFrame>
    </AuthGuard>
  )
}
