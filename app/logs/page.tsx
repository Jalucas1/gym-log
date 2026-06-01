"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import AppFrame from "@/components/AppFrame";
import PageHeader from "@/components/PageHeader";
import { supabase } from "@/lib/supabase";

type CleaningLog = {
  id: string;
  completed_at: string;
  employee_name: string | null;
  employee_initials: string | null;
  task_name: string | null;
  comment: string | null;
  photo_url: string | null;
};

type TanningLog = {
  id: string;
  completed_at: string;
  employee_name: string | null;
  employee_initials: string | null;
  bed_name: string | null;
  member_name: string | null;
  comment: string | null;
  photo_url: string | null;
};

type GroupedCleaningLog = {
  groupId: string;
  completed_at: string;
  employee_name: string | null;
  employee_initials: string | null;
  tasks: string[];
  comment: string | null;
  photo_url: string | null;
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function groupCleaningLogs(logs: CleaningLog[]): GroupedCleaningLog[] {
  const groups = new Map<string, GroupedCleaningLog>();

  logs.forEach((log) => {
    const roundedTime = new Date(log.completed_at);
    roundedTime.setSeconds(0, 0);

    const key = [
      roundedTime.toISOString(),
      log.employee_name || "unknown",
      log.employee_initials || "",
      log.comment || "",
      log.photo_url || "",
    ].join("|");

    if (!groups.has(key)) {
      groups.set(key, {
        groupId: key,
        completed_at: log.completed_at,
        employee_name: log.employee_name,
        employee_initials: log.employee_initials,
        tasks: [],
        comment: log.comment,
        photo_url: log.photo_url,
      });
    }

    if (log.task_name) {
      groups.get(key)?.tasks.push(log.task_name);
    }
  });

  return Array.from(groups.values());
}

export default function LogsPage() {
  const [activeTab, setActiveTab] = useState<"cleaning" | "tanning">(
    "cleaning"
  );
  const [cleaningLogs, setCleaningLogs] = useState<GroupedCleaningLog[]>([]);
  const [tanningLogs, setTanningLogs] = useState<TanningLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);

      const [{ data: cleaningData }, { data: tanningData }] =
        await Promise.all([
          supabase
            .from("cleaning_logs_view")
            .select("*")
            .order("completed_at", { ascending: false })
            .limit(200),
          supabase
            .from("tanning_logs_view")
            .select("*")
            .order("completed_at", { ascending: false })
            .limit(100),
        ]);

      const grouped = groupCleaningLogs((cleaningData || []) as CleaningLog[]);

      setCleaningLogs(grouped);
      setTanningLogs((tanningData || []) as TanningLog[]);
      setLoading(false);
    }

    loadLogs();
  }, []);

  return (
    <AuthGuard>
      <AppFrame>
        <PageHeader
          title="Activity Logs"
          subtitle="Review cleaning and tanning submissions with full date and time records."
          badge="Audit trail"
        />

        <div className="mb-6 grid grid-cols-2 gap-3 rounded-[1.5rem] border border-black/10 bg-white p-2 shadow-sm md:max-w-md">
          <button
            type="button"
            onClick={() => setActiveTab("cleaning")}
            className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
              activeTab === "cleaning"
                ? "bg-[#8E24AA] text-white shadow-lg shadow-[#8E24AA]/20"
                : "text-black hover:bg-black/5"
            }`}
          >
            Cleaning
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tanning")}
            className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
              activeTab === "tanning"
                ? "bg-[#8E24AA] text-white shadow-lg shadow-[#8E24AA]/20"
                : "text-black hover:bg-black/5"
            }`}
          >
            Tanning
          </button>
        </div>

        {loading ? (
          <div className="rounded-[2rem] border border-black/10 bg-white p-8 text-center font-bold text-black/60">
            Loading logs...
          </div>
        ) : activeTab === "cleaning" ? (
          <section className="space-y-4">
            {cleaningLogs.length === 0 && (
              <EmptyState message="No cleaning logs yet." />
            )}

            {cleaningLogs.map((log) => (
              <article
                key={log.groupId}
                className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-xl shadow-black/5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.16em] text-[#8E24AA]">
                      {formatDateTime(log.completed_at)}
                    </p>

                    <h2 className="mt-1 text-xl font-black text-black">
                      {log.tasks.length > 0
                        ? log.tasks.join(", ")
                        : "Cleaning tasks"}
                    </h2>

                    <p className="mt-1 text-sm font-bold text-black/60">
                      {log.employee_initials
                        ? `${log.employee_initials} — `
                        : ""}
                      {log.employee_name || "Unknown employee"}
                    </p>

                    {log.comment && (
                      <p className="mt-4 rounded-2xl bg-black/[0.03] p-4 text-sm text-black/75">
                        {log.comment}
                      </p>
                    )}
                  </div>

                  {log.photo_url && <PhotoLink url={log.photo_url} />}
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="space-y-4">
            {tanningLogs.length === 0 && (
              <EmptyState message="No tanning logs yet." />
            )}

            {tanningLogs.map((log) => (
              <article
                key={log.id}
                className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-xl shadow-black/5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.16em] text-[#8E24AA]">
                      {formatDateTime(log.completed_at)}
                    </p>

                    <h2 className="mt-1 text-xl font-black text-black">
                      {log.bed_name || "Tanning bed"}
                    </h2>

                    <p className="mt-1 text-sm font-bold text-black/60">
                      {log.employee_initials
                        ? `${log.employee_initials} — `
                        : ""}
                      {log.employee_name || "Unknown employee"}
                    </p>

                    {log.member_name && (
                      <p className="mt-3 inline-flex rounded-full bg-[#FFC107] px-4 py-2 text-sm font-black text-black">
                        Member: {log.member_name}
                      </p>
                    )}

                    {log.comment && (
                      <p className="mt-4 rounded-2xl bg-black/[0.03] p-4 text-sm text-black/75">
                        {log.comment}
                      </p>
                    )}
                  </div>

                  {log.photo_url && <PhotoLink url={log.photo_url} />}
                </div>
              </article>
            ))}
          </section>
        )}
      </AppFrame>
    </AuthGuard>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-black/20 bg-white p-10 text-center">
      <p className="text-lg font-black text-black">{message}</p>
      <p className="mt-2 text-sm text-black/60">
        New submissions will appear here with the date and time.
      </p>
    </div>
  );
}

function PhotoLink({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group block w-full overflow-hidden rounded-2xl border border-black/10 bg-black/[0.03] md:w-44"
    >
      <img
        src={url}
        alt="Uploaded log photo"
        className="h-40 w-full object-cover transition group-hover:scale-105"
      />

      <div className="p-3 text-center text-xs font-black uppercase tracking-[0.14em] text-[#8E24AA]">
        View Photo
      </div>
    </a>
  );
}