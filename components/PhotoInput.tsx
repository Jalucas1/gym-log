"use client";

import { useMemo } from "react";

type PhotoInputProps = {
  label?: string;
  file: File | null;
  onChange: (file: File | null) => void;
};

export default function PhotoInput({
  label = "Optional Photo",
  file,
  onChange,
}: PhotoInputProps) {
  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  return (
    <section className="rounded-[1.75rem] border border-black/10 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#8E24AA]">
            Verification
          </p>
          <label className="mt-1 block text-lg font-black text-black">
            {label}
          </label>
        </div>

        {file && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-full border border-black/10 px-4 py-2 text-sm font-bold text-black transition hover:bg-black hover:text-white"
          >
            Remove
          </button>
        )}
      </div>

      <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-[#8E24AA]/30 bg-[#8E24AA]/5 p-5 text-center transition hover:border-[#8E24AA] hover:bg-[#8E24AA]/10">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />

        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Selected upload preview"
            className="max-h-56 w-full rounded-[1.25rem] object-cover"
          />
        ) : (
          <div>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFC107] text-2xl font-black text-black">
              +
            </div>
            <p className="font-black text-black">Take or upload a photo</p>
            <p className="mt-1 text-sm text-black/60">
              This is optional unless your manager requires it.
            </p>
          </div>
        )}
      </label>
    </section>
  );
}
