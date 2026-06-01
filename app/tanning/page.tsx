"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import AppFrame from "@/components/AppFrame";
import PageHeader from "@/components/PageHeader";
import PhotoInput from "@/components/PhotoInput";
import { supabase } from "@/lib/supabase";
import { uploadPhoto } from "@/lib/uploadPhoto";

type Employee = {
  id: string;
  name: string;
  initials: string | null;
};

type TanningBed = {
  id: string;
  name: string;
};

export default function TanningPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [beds, setBeds] = useState<TanningBed[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [bedId, setBedId] = useState("");
  const [memberName, setMemberName] = useState("");
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [{ data: employeeData }, { data: bedData }] = await Promise.all([
        supabase
          .from("employees")
          .select("id, name, initials")
          .eq("active", true)
          .order("name"),
        supabase
          .from("tanning_beds")
          .select("id, name")
          .eq("active", true)
          .order("name"),
      ]);

      setEmployees(employeeData || []);
      setBeds(bedData || []);
    }

    loadData();
  }, []);

  async function submitTanningLog() {
    setMessage("");

    if (!employeeId) {
      setMessage("Please select an employee.");
      return;
    }

    if (!bedId) {
      setMessage("Please select a tanning bed.");
      return;
    }

    setSubmitting(true);

    try {
      const photoUrl = await uploadPhoto(photo, "tanning-photos");

      const { error } = await supabase.from("tanning_logs").insert({
        employee_id: employeeId,
        tanning_bed_id: bedId,
        member_name: memberName.trim() || null,
        comment: comment.trim() || null,
        photo_url: photoUrl,
      });

      if (error) throw new Error(error.message);

      setBedId("");
      setMemberName("");
      setComment("");
      setPhoto(null);
      setMessage("Tanning cleaning log submitted with date and time.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthGuard>
      <AppFrame>
      <PageHeader
  title="Tanning Log"
  subtitle="Record each tanning bed cleaning with automatic date and time tracking."
  badge="Black Card Spa"
/>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-xl shadow-black/5 md:p-7">
            <div className="mb-6 rounded-[1.5rem] bg-[#8E24AA] p-5 text-white">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#FFC107]">
                Tanning
              </p>
              <h2 className="mt-2 text-2xl font-black">Bed Cleaning Entry</h2>
              <p className="mt-1 text-sm text-white/75">
                Choose the bed, add member info if needed, and submit.
              </p>
            </div>

            <label className="mb-2 block text-sm font-black uppercase tracking-[0.16em] text-black/60">
              Employee
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="mb-5 w-full rounded-2xl border border-black/10 bg-white p-4 text-base font-bold text-black outline-none ring-[#8E24AA]/20 transition focus:ring-4"
            >
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.initials
                    ? `${employee.initials} — ${employee.name}`
                    : employee.name}
                </option>
              ))}
            </select>

            <label className="mb-2 block text-sm font-black uppercase tracking-[0.16em] text-black/60">
              Member Name
            </label>
            <input
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              className="mb-5 w-full rounded-2xl border border-black/10 bg-white p-4 text-base font-bold text-black outline-none ring-[#8E24AA]/20 transition placeholder:text-black/40 focus:ring-4"
              placeholder="Optional"
            />

            <label className="mb-2 block text-sm font-black uppercase tracking-[0.16em] text-black/60">
              Comments
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="h-36 w-full rounded-2xl border border-black/10 bg-white p-4 text-base text-black outline-none ring-[#8E24AA]/20 transition placeholder:text-black/40 focus:ring-4"
              placeholder="Add notes, cleaning issues, supplies needed, etc..."
            />
          </section>

          <section className="space-y-6">
            <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-xl shadow-black/5 md:p-7">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-[#8E24AA]">
                    Select Bed
                  </p>
                  <h3 className="text-2xl font-black text-black">Cleaned Equipment</h3>
                </div>
                {bedId && (
                  <span className="rounded-full bg-[#FFC107] px-4 py-2 text-sm font-black text-black">
                    Selected
                  </span>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {beds.map((bed) => {
                  const selected = bedId === bed.id;
                  return (
                    <button
                      key={bed.id}
                      type="button"
                      onClick={() => setBedId(bed.id)}
                      className={`min-h-28 rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-[#8E24AA] bg-[#8E24AA] text-white shadow-lg shadow-[#8E24AA]/20"
                          : "border-black/10 bg-white text-black hover:border-[#8E24AA]/40 hover:bg-[#8E24AA]/5"
                      }`}
                    >
                      <span className="text-lg font-black">{bed.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <PhotoInput label="Optional Tanning Photo" file={photo} onChange={setPhoto} />

            {message && (
              <div className="rounded-2xl border border-[#8E24AA]/20 bg-[#8E24AA]/10 p-4 text-sm font-bold text-black">
                {message}
              </div>
            )}

            <button
              type="button"
              onClick={submitTanningLog}
              disabled={submitting}
              className="w-full rounded-2xl bg-black p-5 text-lg font-black text-white shadow-xl shadow-black/15 transition hover:bg-[#8E24AA] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Tanning Log"}
            </button>
          </section>
        </div>
      </AppFrame>
    </AuthGuard>
  );
}
