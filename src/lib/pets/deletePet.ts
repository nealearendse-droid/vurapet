import { SupabaseClient } from '@supabase/supabase-js';

const RELATED_TABLES = [
  'travel_plans',
  'vaccine_records',
  'weight_entries',
  'health_journal',
  'guardians',
  'memories',
] as const;

export async function deletePetWithRelatedData(
  supabase: SupabaseClient,
  petId: string,
  userId: string
): Promise<{ error: string | null }> {
  for (const table of RELATED_TABLES) {
    await supabase.from(table).delete().eq('pet_id', petId);
  }

  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', petId)
    .eq('user_id', userId);

  return { error: error?.message ?? null };
}
