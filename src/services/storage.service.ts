import { createClient } from "@/lib/supabase/client";

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

const BUCKET = "product-images";
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function uploadProductImage(file: File, productId: string, position: number): Promise<UploadResult> {
  if (!ALLOWED.includes(file.type)) return { success: false, error: "Only JPEG, PNG, WebP and AVIF images are allowed." };
  if (file.size > MAX_SIZE) return { success: false, error: "Image must be smaller than 5MB." };

  const supabase = createClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const fileName = `${productId}/${position}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(fileName, file, { cacheControl: "3600", upsert: false });
  if (uploadError) return { success: false, error: uploadError.message };

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return { success: true, url: data.publicUrl, path: fileName };
}

export async function deleteProductImage(path: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  return !error;
}
