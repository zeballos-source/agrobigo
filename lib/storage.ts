import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const BUCKET = "product-images";

// Cliente con la service role key: solo se usa del lado del servidor,
// nunca se expone al navegador. Esta key se salta las políticas de acceso,
// así que el bucket puede quedar de solo-lectura pública sin necesitar
// reglas de escritura pública.
function storageClient() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el .env — ver README para crear el bucket y sacar esas claves."
    );
  }
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
}

const MAX_FILES = 10;
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB por foto

export const MAX_PRODUCT_IMAGES = MAX_FILES;

/**
 * Sube hasta MAX_FILES imágenes al bucket y devuelve sus URLs públicas.
 * Ignora silenciosamente archivos vacíos, no-imagen, o demasiado grandes.
 */
export async function uploadProductImages(files: File[]): Promise<string[]> {
  const valid = files
    .filter((f) => f && f.size > 0 && f.type.startsWith("image/") && f.size <= MAX_FILE_SIZE)
    .slice(0, MAX_FILES);

  if (valid.length === 0) return [];

  const supabase = storageClient();
  const urls: string[] = [];

  for (const file of valid) {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `productos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false
    });

    if (error) {
      console.error("Error subiendo imagen a Supabase Storage:", error.message);
      continue;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return urls;
}

/** Borra una imagen del bucket a partir de su URL pública. No falla si ya no existe. */
export async function deleteProductImageByUrl(url: string) {
  try {
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const path = url.slice(idx + marker.length);
    const supabase = storageClient();
    await supabase.storage.from(BUCKET).remove([path]);
  } catch (err) {
    console.error("No se pudo borrar la imagen del storage:", err);
  }
}
