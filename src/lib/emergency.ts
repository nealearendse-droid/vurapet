import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function getEmergencyPetData(token: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const { data: pet, error } = await supabase
    .from('pets')
    .select(`
      id,
      name,
      species,
      breed,
      date_of_birth,
      sex,
      colour,
      microchip,
      allergies,
      chronic_conditions,
      primary_vet,
      emergency_vet,
      profile_photo_url,
      photo_url,
      vet_clinic,
      vet_phone,
      vet_name,
      feeding_schedule,
      feeding_instructions,
      medication_instructions,
      do_not_feed,
      warning_signs,
      daily_routine,
      behaviour_notes,
      emergency_steps,
      weight,
      owner_phone,
      medications,
      personality,
      red_flags,
      emergency_token,
      emergency_card_enabled,
      emergency_message,
      created_at
    `)
    .eq('emergency_token', token)
    .single()

  if (error) {
    console.error('Emergency lookup error:', error.message)
    return null
  }

  if (!pet?.emergency_card_enabled) return null

  return pet
}