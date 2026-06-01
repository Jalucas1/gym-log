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

type Task = {
  id: string;
  name: string;
  category: string | null;
};

export default function WalkAroundPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [{ data: employeeData }, { data: taskData }] = await Promise.all([
        supabase
          .from("employees")
          .select("id, name, initials")
          .eq("active", true)
          .order("name"),
        supabase
          .from("tasks")
          .select("id, name, category")
          .eq("active", true)
          .order("name"),
      ]);

      setEmployees(employeeData || []);
      setTasks(taskData || []);
    }

    loadData();
  }, []);

  function toggleTask(taskId: string) {
    setSelectedTasks((current) =>
      current.includes(taskId)
        ? current.filter((id) => id !== taskId)
        : [...current, taskId]
    );
  }

  async function submitWalkAround() {
    setMessage("");

    if (!employeeId) {
      setMessage("Please select an employee.");
      return;
    }

    if (selectedTasks.length === 0) {
      setMessage("Please select at least one completed task.");
      return;
    }

    setSubmitting(true);

    try {
      const photoUrl = await uploadPhoto(photo, "cleaning-photos");

      const rows = selectedTasks.map((taskId) => ({
        employee_id: employeeId,
        task_id: taskId,
        comment: comment.trim() || null,
        photo_url: photoUrl,
      }));

      const { error } = await supabase.from("cleaning_logs").insert(rows);

      if (error) throw new Error(error.message);

      setSelectedTasks([]);
      setComment("");
      setPhoto(null);
      setMessage(
        `Walk-around submitted. ${rows.length} task${rows.length === 1 ? "" : "s"} logged with date and time.`
      );
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
          eyebrow="Daily operations"
          title="Walk-Around"
          description="Log completed cleaning tasks with automatic date and time tracking."
        />

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-xl shadow-black/5 md:p-7">
            <div className="mb-6 rounded-[1.5rem] bg-black p-5 text-white">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#FFC107]">
                GymLog
              </p>
              <h2 className="mt-2 text-2xl font-black">Cleaning Checklist</h2>
              <p className="mt-1 text-sm text-white/70">
                Select your name, tap completed tasks, add notes, and submit.
              </p>
            </div>

            <label className="mb-2 block text-sm font-black uppercase tracking-[0.16em] text-black/60">
              Employee
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="mb-6 w-full rounded-2xl border border-black/10 bg-white p-4 text-base font-bold text-black outline-none ring-[#8E24AA]/20 transition focus:ring-4"
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

            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[#8E24AA]">
                  Tasks
                </p>
                <h3 className="text-2xl font-black text-black">Completed Today</h3>
              </div>
              <span className="rounded-full bg-[#FFC107] px-4 py-2 text-sm font-black text-black">
                {selectedTasks.length} selected
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {tasks.map((task) => {
                const checked = selectedTasks.includes(task.id);
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      checked
                        ? "border-[#8E24AA] bg-[#8E24AA] text-white shadow-lg shadow-[#8E24AA]/20"
                        : "border-black/10 bg-white text-black hover:border-[#8E24AA]/40 hover:bg-[#8E24AA]/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-black ${
                          checked
                            ? "border-white bg-white text-[#8E24AA]"
                            : "border-black/20 bg-white text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                      <span className="font-black">{task.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-xl shadow-black/5 md:p-7">
              <label className="mb-2 block text-sm font-black uppercase tracking-[0.16em] text-black/60">
                Comments
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="h-40 w-full rounded-2xl border border-black/10 bg-white p-4 text-base text-black outline-none ring-[#8E24AA]/20 transition placeholder:text-black/40 focus:ring-4"
                placeholder="Add notes, supplies needed, maintenance issues, or anything unusual..."
              />
            </section>

            <PhotoInput file={photo} onChange={setPhoto} />

            {message && (
              <div className="rounded-2xl border border-[#8E24AA]/20 bg-[#8E24AA]/10 p-4 text-sm font-bold text-black">
                {message}
              </div>
            )}

            <button
              type="button"
              onClick={submitWalkAround}
              disabled={submitting}
              className="w-full rounded-2xl bg-black p-5 text-lg font-black text-white shadow-xl shadow-black/15 transition hover:bg-[#8E24AA] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Walk-Around"}
            </button>
          </aside>
        </div>
      </AppFrame>
    </AuthGuard>
  );
}
