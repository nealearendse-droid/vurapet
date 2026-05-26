'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  COUNTRY_OPTIONS,
  DESTINATION_OPTIONS,
  CountryCode,
  isSnubNosedBreed,
} from '@/data/travelRules';
import { AIRLINES } from '@/data/travelAirlines';
import {
  generateTravelPlan,
  calcIataCrate,
  TravelPlanResult,
  PetVaccineRecord,
} from '@/lib/travel/planEngine';
import { downloadTravelPackPdf } from '@/lib/travel/exportPdf';

type Pet = {
  id: string;
  name: string;
  species: string;
  breed?: string | null;
  weight?: number | string | null;
  microchip?: string | null;
  user_id?: string;
};

const TABS = ['Requirements', 'Timeline', 'Airlines', 'Crate', 'Saved'] as const;
type TabId = typeof TABS[number];

const TAB_ICONS: Record<TabId, string> = {
  Requirements: '📋',
  Timeline: '📅',
  Airlines: '✈️',
  Crate: '📦',
  Saved: '💾',
};

const LABEL_CLASS = 'text-xs font-semibold text-gray-900 block mb-1';
const FIELD_CLASS =
  'w-full border border-gray-400 rounded-lg p-2.5 text-sm font-medium text-gray-900 bg-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#0F6E56]/50 focus:border-[#0F6E56]';

export default function TravelPlanner({ petId, pet }: { petId: string; pet: Pet }) {
  const supabase = createSupabaseBrowserClient();

  const [activeTab, setActiveTab] = useState<TabId>('Requirements');
  const [from, setFrom] = useState<CountryCode>('ZA');
  const [to, setTo] = useState<CountryCode>('GB');
  const [travelDate, setTravelDate] = useState('');
  const [breed, setBreed] = useState(pet.breed || '');
  const [species, setSpecies] = useState(pet.species || 'dog');
  const [petWeight, setPetWeight] = useState('');
  const [snubNosed, setSnubNosed] = useState(false);
  const [plan, setPlan] = useState<TravelPlanResult | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [vaccines, setVaccines] = useState<PetVaccineRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const [crateLen, setCrateLen] = useState('');
  const [crateHt, setCrateHt] = useState('');
  const [crateWd, setCrateWd] = useState('');
  const [crateResult, setCrateResult] = useState<{ length: number; height: number; width: number } | null>(null);

  const fromLabel = COUNTRY_OPTIONS.find(c => c.code === from)?.label ?? from;
  const toLabel = DESTINATION_OPTIONS.find(c => c.code === to)?.label ?? to;

  const loadPetData = useCallback(async () => {
    setLoading(true);
    const [{ data: vax }, { data: weights }] = await Promise.all([
      supabase.from('vaccine_records').select('vaccine_name, date_given, next_due_date').eq('pet_id', petId),
      supabase.from('weight_entries').select('weight_kg, recorded_at').eq('pet_id', petId).order('recorded_at', { ascending: false }).limit(1),
    ]);
    setVaccines(vax || []);
    if (weights?.[0]?.weight_kg) {
      setPetWeight(String(weights[0].weight_kg));
    } else if (pet.weight) {
      setPetWeight(String(pet.weight));
    }
    const detectedSnub = isSnubNosedBreed(pet.breed || '');
    setSnubNosed(detectedSnub);

    const { data: saved } = await supabase
      .from('travel_plans')
      .select('*')
      .eq('pet_id', petId)
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (saved) {
      setPlanId(saved.id);
      setFrom(saved.from_country as CountryCode);
      setTo(saved.to_country as CountryCode);
      setTravelDate(saved.travel_date || '');
      setBreed(saved.breed || pet.breed || '');
      setSpecies(saved.species || pet.species);
      if (saved.pet_weight_kg) setPetWeight(String(saved.pet_weight_kg));
      setSnubNosed(saved.snub_nosed);
      const regen = generateTravelPlan({
        from: saved.from_country as CountryCode,
        to: saved.to_country as CountryCode,
        travelDate: saved.travel_date,
        petName: pet.name,
        breed: saved.breed || '',
        species: saved.species || 'dog',
        microchip: pet.microchip,
        vaccines: vax || [],
        snubNosed: saved.snub_nosed,
      });
      if (regen) setPlan(regen);
    }
    setLoading(false);
  }, [petId, pet, supabase]);

  useEffect(() => {
    loadPetData();
  }, [loadPetData]);

  async function handleGenerate() {
    setGenerating(true);
    setSaveMsg(null);
    const result = generateTravelPlan({
      from,
      to,
      travelDate: travelDate || null,
      petName: pet.name,
      breed,
      species,
      microchip: pet.microchip,
      vaccines,
      snubNosed,
    });
    if (!result) {
      setSaveMsg('Rules for this route are not available yet.');
      setGenerating(false);
      return;
    }
    setPlan(result);
    setActiveTab('Requirements');
    setGenerating(false);
  }

  async function handleSave() {
    if (!plan) return;
    setSaving(true);
    setSaveMsg(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setSaveMsg('Please log in to save your plan.');
      setSaving(false);
      return;
    }

    const payload = {
      user_id: session.user.id,
      pet_id: petId,
      from_country: from,
      to_country: to,
      travel_date: travelDate || null,
      species,
      breed,
      pet_weight_kg: parseFloat(petWeight) || null,
      snub_nosed: snubNosed,
      checklist_json: plan.checklist,
      timeline_json: plan.timeline,
      readiness_score: plan.readinessScore,
      status: 'active',
    };

    let error;
    if (planId) {
      ({ error } = await supabase.from('travel_plans').update(payload).eq('id', planId));
    } else {
      const { data, error: insertErr } = await supabase.from('travel_plans').insert(payload).select('id').single();
      error = insertErr;
      if (data) setPlanId(data.id);
    }

    setSaving(false);
    setSaveMsg(error ? `Could not save: ${error.message}` : '✓ Plan saved to your account');
  }

  function handleExportPdf() {
    if (!plan) return;
    downloadTravelPackPdf(
      {
        petName: pet.name,
        fromLabel,
        toLabel,
        travelDate,
        generatedAt: new Date().toLocaleString(),
      },
      plan
    );
  }

  async function syncToVaccineCalendar() {
    if (!plan) return;
    setSyncing(true);
    const keyItems = plan.timeline.filter(t =>
      ['tl-permit', 'tl-titre', 'tl-tapeworm', 'tl-health-cert'].includes(t.id) && t.dueDate
    );
    for (const item of keyItems) {
      await supabase.from('vaccine_records').insert({
        pet_id: petId,
        vaccine_name: `✈️ Travel: ${item.label}`,
        name: `✈️ Travel: ${item.label}`,
        type: 'travel',
        date_given: item.dueDate!,
        next_due_date: item.dueDate,
        notes: item.text,
      });
    }
    setSyncing(false);
    setSaveMsg(`✓ Added ${keyItems.length} travel reminders to Vaccine Calendar`);
  }

  function handleCalcCrate() {
    const len = parseFloat(crateLen);
    const ht = parseFloat(crateHt);
    const wd = parseFloat(crateWd);
    if (!len || !ht || !wd) {
      setCrateResult(null);
      return;
    }
    setCrateResult(calcIataCrate(len, ht, wd));
  }

  function showAirlines() {
    const wt = parseFloat(petWeight) || 0;
    return AIRLINES.map(a => {
      const canCabin = wt > 0 && wt <= a.cabinKg;
      const canCargo = wt > 0 && wt <= a.cargoKg;
      const snubIssue = snubNosed && !a.snubNosed;
      const status = snubIssue ? 'warn' : canCabin || canCargo ? 'ok' : wt === 0 ? 'warn' : 'no';
      return { ...a, canCabin, canCargo, snubIssue, status };
    });
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading travel planner…</div>;
  }

  const scoreColor =
    !plan ? 'bg-gray-200 text-gray-600' :
    plan.readinessScore >= 70 ? 'bg-emerald-100 text-emerald-800' :
    plan.readinessScore >= 40 ? 'bg-amber-100 text-amber-800' :
    'bg-red-100 text-red-800';

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-white text-gray-900 [&_select]:text-gray-900 [&_input]:text-gray-900 [&_option]:text-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0F6E56] to-[#1D9E75] p-5 text-white">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold">Travel Planner</h1>
            <p className="text-sm opacity-90 mt-0.5">
              {pet.name} · {fromLabel} → {toLabel}
            </p>
          </div>
          {plan && (
            <div className={`px-3 py-1.5 rounded-full text-sm font-semibold ${scoreColor}`}>
              {plan.readinessScore}% ready
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-[72px] py-3 px-2 text-xs font-medium transition border-b-2 ${
              activeTab === tab
                ? 'border-[#0F6E56] text-[#0F6E56] bg-white'
                : 'border-transparent text-gray-700 hover:text-gray-900'
            }`}
          >
            <span className="block text-base mb-0.5">{TAB_ICONS[tab]}</span>
            {tab}
          </button>
        ))}
      </div>

      <div className="p-5">
        {saveMsg && (
          <div className={`mb-4 text-sm p-3 rounded-lg ${saveMsg.startsWith('✓') ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}>
            {saveMsg}
          </div>
        )}

        {/* Requirements */}
        {activeTab === 'Requirements' && (
          <>
            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className={LABEL_CLASS}>Departure country</label>
                <select value={from} onChange={e => setFrom(e.target.value as CountryCode)} className={FIELD_CLASS}>
                  {COUNTRY_OPTIONS.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>Destination country</label>
                <select value={to} onChange={e => setTo(e.target.value as CountryCode)} className={FIELD_CLASS}>
                  {DESTINATION_OPTIONS.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>Species</label>
                <select value={species} onChange={e => setSpecies(e.target.value)} className={FIELD_CLASS}>
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
                  <option value="rabbit">Rabbit</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS}>Breed</label>
                <input type="text" value={breed} onChange={e => setBreed(e.target.value)} className={FIELD_CLASS} placeholder="From pet profile" />
              </div>
              <div>
                <label className={LABEL_CLASS}>Travel date</label>
                <input type="date" value={travelDate} onChange={e => setTravelDate(e.target.value)} className={FIELD_CLASS} style={{ colorScheme: 'light' }} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Weight (kg)</label>
                <input type="number" value={petWeight} onChange={e => setPetWeight(e.target.value)} className={FIELD_CLASS} placeholder="From weight tracker" />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-4 cursor-pointer">
              <input type="checkbox" checked={snubNosed} onChange={e => setSnubNosed(e.target.checked)} className="w-4 h-4 accent-[#0F6E56]" />
              Snub-nosed / brachycephalic breed
            </label>
            <p className="text-xs text-gray-700 mb-3">
              Prefilled from {pet.name}&apos;s profile
              {pet.microchip ? ` · Microchip ${pet.microchip}` : ' · No microchip on file'}
              {' · '}
              <Link href={`/pets/${petId}/vaccines`} className="text-[#0F6E56] font-semibold underline">Vaccine calendar</Link>
            </p>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-[#0F6E56] hover:bg-[#085041] text-white font-medium py-3 rounded-lg text-sm disabled:opacity-60"
            >
              {generating ? 'Generating…' : 'Generate travel plan'}
            </button>

            {plan && (
              <div className="mt-5 space-y-3">
                {plan.warnings.map((w, i) => (
                  <div key={i} className="bg-red-50 border border-red-200 text-red-900 text-sm p-3 rounded-lg">{w}</div>
                ))}
                {plan.gaps.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                    <p className="text-sm font-medium text-amber-900 mb-2">Record gaps</p>
                    {plan.gaps.map((g, i) => (
                      <p key={i} className="text-sm text-amber-800">• {g.message}</p>
                    ))}
                  </div>
                )}
                <p className="text-sm font-medium text-gray-800">
                  Export steps from <strong>{plan.originName}</strong> → <strong>{plan.destName}</strong>
                </p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                  {plan.corridorSteps.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
                <div className="space-y-2">
                  {plan.checklist.map(item => (
                    <div key={item.id} className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm">
                      <div className="flex justify-between gap-2">
                        <span className="font-medium text-gray-800">{item.title}</span>
                        <StatusBadge status={item.status} />
                      </div>
                      {item.detail && <p className="text-gray-500 mt-1 text-xs">{item.detail}</p>}
                      {item.officialUrl && item.officialUrl.startsWith('http') && (
                        <a href={item.officialUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 text-xs mt-1 inline-block underline">
                          Official source →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 border-t pt-3">
                  Planning aid only — verify with {plan.destRule.officialLinks?.[0]?.label || 'official authorities'} and your airline. Airline policies last verified Jan 2025.
                </p>
              </div>
            )}
          </>
        )}

        {/* Timeline */}
        {activeTab === 'Timeline' && (
          !plan ? (
            <p className="text-center text-gray-800 text-sm py-8">Generate a plan on the Requirements tab first.</p>
          ) : (
            <div className="space-y-4">
              {plan.timeline.map(item => (
                <div key={item.id} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${urgencyClass(item.urgency)}`}>
                    {item.label.split(' ')[0].slice(0, 3)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-700 font-semibold">{item.label}{item.dueDate ? ` · ${item.dueDate}` : ''}</p>
                    <p className="text-sm text-gray-800">{item.text}</p>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={syncToVaccineCalendar}
                disabled={syncing}
                className="w-full border border-emerald-600 text-emerald-700 py-2 rounded-lg text-sm font-medium hover:bg-emerald-50"
              >
                {syncing ? 'Syncing…' : 'Add key dates to Vaccine Calendar'}
              </button>
            </div>
          )
        )}

        {/* Airlines */}
        {activeTab === 'Airlines' && (
          <div>
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded-lg mb-3">
              Indicative only — always confirm with the airline before booking. Last verified Jan 2025.
            </p>
            <div className="space-y-2">
              {showAirlines().map(a => (
                <div key={a.name} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">{a.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      a.status === 'ok' ? 'bg-emerald-100 text-emerald-800' :
                      a.status === 'warn' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {a.canCabin ? 'Cabin OK' : a.canCargo ? 'Cargo' : parseFloat(petWeight) ? 'Check airline' : 'Enter weight'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{a.notes}</p>
                  {a.policyUrl && (
                    <a href={a.policyUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 underline mt-1 inline-block">Policy →</a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Crate */}
        {activeTab === 'Crate' && (
          <div>
            <p className="text-sm text-gray-800 mb-3">IATA minimum internal dimensions (pet standing naturally).</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className={LABEL_CLASS}>Length (nose to tail base) cm</label>
                <input type="number" value={crateLen} onChange={e => setCrateLen(e.target.value)} className={FIELD_CLASS} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Height (floor to head) cm</label>
                <input type="number" value={crateHt} onChange={e => setCrateHt(e.target.value)} className={FIELD_CLASS} />
              </div>
              <div>
                <label className={LABEL_CLASS}>Width (shoulder to shoulder) cm</label>
                <input type="number" value={crateWd} onChange={e => setCrateWd(e.target.value)} className={FIELD_CLASS} />
              </div>
            </div>
            <button type="button" onClick={handleCalcCrate} className="bg-[#0F6E56] text-white px-4 py-2 rounded-lg text-sm font-medium">
              Calculate
            </button>
            {crateResult && (
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {(['length', 'height', 'width'] as const).map(dim => (
                  <div key={dim} className="bg-emerald-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 capitalize">{dim}</p>
                    <p className="text-2xl font-semibold text-[#0F6E56]">{crateResult[dim]}cm</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Saved / export */}
        {activeTab === 'Saved' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-800">
              Save your plan to your VuraPet account so it persists across sessions. Export a PDF pack for your vet or travel agent.
            </p>
            <button
              type="button"
              onClick={handleSave}
              disabled={!plan || saving}
              className="w-full bg-[#0F6E56] text-white py-3 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {saving ? 'Saving…' : planId ? 'Update saved plan' : 'Save plan'}
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={!plan}
              className="w-full border border-gray-400 py-3 rounded-lg text-sm font-semibold text-gray-900 disabled:opacity-50 hover:bg-gray-50"
            >
              Download Travel Pack (PDF)
            </button>
            {planId && (
              <p className="text-xs text-gray-400 text-center">Plan ID saved · auto-loads when you return</p>
            )}
            {!plan && (
              <p className="text-xs text-amber-600 text-center">Generate a plan first on the Requirements tab.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'done' ? 'bg-emerald-100 text-emerald-800' :
    status === 'blocked' ? 'bg-red-100 text-red-800' :
    status === 'warning' ? 'bg-amber-100 text-amber-800' :
    'bg-gray-100 text-gray-600';
  return <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${cls}`}>{status}</span>;
}

function urgencyClass(u: string) {
  if (u === 'now') return 'bg-red-100 text-red-800';
  if (u === 'soon') return 'bg-amber-100 text-amber-800';
  if (u === 'before') return 'bg-blue-100 text-blue-800';
  return 'bg-emerald-100 text-emerald-800';
}
