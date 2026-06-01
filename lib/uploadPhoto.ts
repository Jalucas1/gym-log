import { supabase } from "@/lib/supabase";

export type PhotoBucket = "cleaning-photos" | "tanning-photos";

export async function uploadPhoto(file: File | null, bucket: PhotoBucket) {
  if (!file) return null;

  const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeName = file.name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const today = new Date().toISOString().slice(0, 10);
  const filePath = `${today}/${Date.now()}-${safeName || "photo"}.${fileExt}`;

  const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    if (error.message.toLowerCase().includes("bucket not found")) {
      throw new Error(
        `Photo bucket not found. Create a Supabase Storage bucket named ${bucket}.`
      );
    }

    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}
