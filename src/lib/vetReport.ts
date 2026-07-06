import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function getVetReportData(token: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  const { data: pet, error } = await supabase
    .from('pets')
    .select('id,name,species,breed,profile_photo_url,photo_url,vet_report_token')
    .eq('vet_report_token', token)
    .single()

  if (error || !pet) {
    console.error('Vet report lookup error:', error?.message)
    return null
  }

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: logs } = await supabase
    .from('chow_logs')
    .select('logged_at,outcome,water_intake,stool_quality')
    .eq('pet_id', pet.id)
    .gte('logged_at', thirtyDaysAgo.toISOString())
    .order('logged_at', { ascending: false })

  const allLogs = logs || []

  // ── Feeding compliance (bowl cleared %) ──
  const totalMeals = allLogs.length
  const clearedMeals = allLogs.filter(l => l.outcome === 'cleared').length
  const compliancePct = totalMeals > 0 ? Math.round((clearedMeals / totalMeals) * 100) : null

  // ── Water intake trend ──
  const waterAnswers = allLogs.map(l => l.water_intake).filter(Boolean)
  const concerningWaterDays = waterAnswers.filter(
    w => w === 'More than usual' || w === 'Much more than usual'
  ).length

  // ── Stool quality average ──
  const stoolScores = allLogs.map(l => l.stool_quality).filter((v): v is number => v != null)
  const stoolAvg = stoolScores.length > 0
    ? Math.round((stoolScores.reduce((sum, v) => sum + v, 0) / stoolScores.length) * 10) / 10
    : null

  // ── Weight change (last 30 days) ──
  const { data: weightEntries } = await supabase
    .from('weight_entries')
    .select('recorded_at,weight_kg')
    .eq('pet_id', pet.id)
    .gte('recorded_at', thirtyDaysAgo.toISOString())
    .order('recorded_at', { ascending: true })

  let weightChangeKg: number | null = null
  let weightChangePct: number | null = null
  if (weightEntries && weightEntries.length >= 2) {
    const first = weightEntries[0].weight_kg
    const last = weightEntries[weightEntries.length - 1].weight_kg
    weightChangeKg = Math.round((last - first) * 10) / 10
    weightChangePct = Math.round(((last - first) / first) * 1000) / 10
  }

  return {
    pet,
    period: { from: thirtyDaysAgo, to: new Date() },
    totalMeals,
    compliancePct,
    concerningWaterDays,
    totalLoggedDays: waterAnswers.length,
    stoolAvg,
    weightChangeKg,
    weightChangePct,
  }
}