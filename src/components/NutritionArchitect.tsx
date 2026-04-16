'use client';

import { useMemo, useState } from 'react';

function calcDailyCalories(species: string, weightKg: number, activity: string) {
  // simple + safe estimate (not medical advice)
  const isCat = species.toLowerCase().includes('cat');

  // RER (Resting Energy Requirement)
  const rer = 70 * Math.pow(weightKg, 0.75);

  // Very simplified multipliers
  let multiplier = isCat ? 1.2 : 1.6;
  if (activity === 'low') multiplier = isCat ? 1.0 : 1.2;
  if (activity === 'normal') multiplier = isCat ? 1.2 : 1.6;
  if (activity === 'high') multiplier = isCat ? 1.4 : 2.0;

  return Math.round(rer * multiplier);
}

export default function NutritionArchitect({
  species,
  latestWeightKg,
}: {
  species: string;
  latestWeightKg: number | null;
}) {
  const [activity, setActivity] = useState<'low' | 'normal' | 'high'>('normal');
  const [manualWeight, setManualWeight] = useState<string>('');

  const weightToUse = useMemo(() => {
    const manual = Number(manualWeight);
    if (manualWeight && !Number.isNaN(manual) && manual > 0) return manual;
    return latestWeightKg;
  }, [manualWeight, latestWeightKg]);

  const calories = useMemo(() => {
    if (!weightToUse) return null;
    return calcDailyCalories(species, weightToUse, activity);
  }, [species, weightToUse, activity]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-2">🍎 Nutrition Architect</h2>
      <p className="text-sm text-gray-600 mb-4">
        This gives a daily calorie estimate. Always confirm with your vet.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Activity level</label>
          <select
            className="w-full border rounded-lg p-2"
            value={activity}
            onChange={(e) => setActivity(e.target.value as any)}
          >
            <option value="low">Low (lazy day)</option>
            <option value="normal">Normal</option>
            <option value="high">High (very active)</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Weight to use (kg) — optional
          </label>
          <input
            className="w-full border rounded-lg p-2"
            value={manualWeight}
            onChange={(e) => setManualWeight(e.target.value)}
            placeholder={
              latestWeightKg
                ? `Leave empty to use latest: ${latestWeightKg.toFixed(1)} kg`
                : 'Enter a weight (no weights logged yet)'
            }
            inputMode="decimal"
          />
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-4">
        <div className="text-sm text-blue-800">Estimated daily calories</div>
        {calories === null ? (
          <div className="text-gray-600 mt-1">
            Add a weight (in Weight Tracker) or type a weight above.
          </div>
        ) : (
          <div className="text-3xl font-extrabold text-blue-700 mt-1">{calories} kcal/day</div>
        )}
        <div className="text-xs text-gray-500 mt-2">
          Not a diagnosis or medical advice. If your pet has illness, pregnancy, or is a puppy/kitten,
          the correct target may differ.
        </div>
      </div>
    </div>
  );
}