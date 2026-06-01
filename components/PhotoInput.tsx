"use client";

type PhotoInputProps = {
  onChange?: (file: File | null) => void;
};

export default function PhotoInput({ onChange }: PhotoInputProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Optional Photo
      </label>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="block w-full rounded-lg border border-gray-300 p-3"
        onChange={(e) =>
          onChange?.(e.target.files?.[0] ?? null)
        }
      />
    </div>
  );
}