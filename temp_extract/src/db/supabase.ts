import { createClient } from '@supabase/supabase-js';

// Public/anon key — safe for client-side use, access is governed by RLS policies
// defined in supabase-schema.sql. Never put the service_role key in client code.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pxnbpozsayfokjdvwplp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_W1ZdsNCe8Arf7WqOi-jrPA_5K8QYaXh';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket names used across the app
export const BUCKETS = {
  LIBRARY: 'library', // photos, journal PDFs, audio
} as const;

/**
 * Best-effort mirror of a Firestore write into a Supabase Postgres table.
 * Firestore stays the real-time source of truth for the UI (onSnapshot),
 * Supabase acts as the durable/searchable backup + shared data store
 * requested for "semua data" and chat history. Failures never block the UI.
 */
export async function mirror(table: string, id: string, data: Record<string, any>) {
  try {
    await supabase.from(table).upsert({ id, ...data, synced_at: new Date().toISOString() });
  } catch (err) {
    console.warn(`[supabase mirror] failed to sync ${table}/${id}`, err);
  }
}

/**
 * Uploads a file to a Supabase Storage bucket and returns its public URL.
 * Path is namespaced by category/type to keep the bucket organized.
 */
export async function uploadLibraryFile(file: File, folder: string): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKETS.LIBRARY).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKETS.LIBRARY).getPublicUrl(path);
  return data.publicUrl;
}
