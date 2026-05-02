'use client';

import { useState, useEffect } from 'react';

const brandsByBudget = {
  budget: ['Bobtail', 'Husky', 'Classic'],
  mid: ['Montego', 'Jock', 'Canine Cuisine', 'Vondis'],
  premium: ['Acana', 'Orijen', 'Royal Canin', "Hill's Science Diet"]
};

const breedNotes: Record<string, string> = {
  'Labrador': 'Large breed — needs glucosamine for joint support',
  'Boerboel': 'Giant breed — watch calcium levels to prevent hip dysplasia',
  'Rottweiler': 'Powerful breed — needs strong protein for muscle maintenance',
  'German Shepherd': 'Active breed — prone to digestive issues, choose sensitive formulas',
  'Bulldog': 'Brachycephalic — needs sensitive stomach formula',
  'Chihuahua': 'Small breed — needs small kibble, high metabolism',
  'Maltese': 'Small breed — prone to tear staining, needs Omega-3',
  'Persian': 'Long hair — needs Omega-3 for coat health',
  'Siamese': 'Active cat — needs high protein',
  'Domestic Shorthair': 'Average needs — good quality mid-range food'
};

const steps = [
  { id: 1, label: 'Pet type', icon: '🐾' },
  { id: 2, label: 'Breed', icon: '🦴' },
  { id: 3, label: 'Age', icon: '🎂' },
  { id: 4, label: 'Weight', icon: '⚖️' },
  { id: 5, label: 'Activity', icon: '⚡' },
  { id: 6, label: 'Health', icon: '❤️' },
  { id: 7, label: 'Budget', icon: '💳' },
  { id: 8, label: 'Treats', icon: '🍖' },
];

export default function NutritionArchitect() {
  const [step, setStep] = useState(1);
  const [petType, setPetType] = useState<'dog' | 'cat'>('dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState('medium');
  const [healthIssues, setHealthIssues] = useState('');
  const [budget, setBudget] = useState<'budget' | 'mid' | 'premium'>('mid');
  const [treats, setTreats] = useState('');
  const [results, setResults] = useState<any>(null);
  const [animating, setAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const calculateDailyCalories = () => {
    const kg = parseFloat(weight) || 0;
    const factor = activity === 'high' ? 1.8 : activity === 'low' ? 1.2 : 1.6;
    return Math.round(kg * 30 * factor * (petType === 'dog' ? 1 : 1.2));
  };

  const generatePlan = () => {
    const calories = calculateDailyCalories();
    const grams = Math.round(calories / 4);
    const recommendedBrands = brandsByBudget[budget];
    const note = breedNotes[breed] || '';
    const treatG = parseInt(treats) || 0;
    const adjustedGrams = treatG > 0 ? Math.round(grams * 0.9) : grams;

    setResults({
      dailyCalories: calories,
      dailyGrams: adjustedGrams,
      gramsPerMeal: Math.round(adjustedGrams / 2),
      brands: recommendedBrands,
      note,
      protein: Math.round(calories * 0.3 / 4),
      fat: Math.round(calories * 0.2 / 9),
      carbs: Math.round(calories * 0.5 / 4),
    });
    setStep(99);
  };

  const goNext = () => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      if (step < 8) setStep(s => s + 1);
      else generatePlan();
      setAnimating(false);
    }, 180);
  };

  const goPrev = () => {
    if (animating || step <= 1) return;
    setAnimating(true);
    setTimeout(() => {
      setStep(s => s - 1);
      setAnimating(false);
    }, 180);
  };

  const reset = () => { setStep(1); setResults(null); };

  const progress = ((step - 1) / 7) * 100;

  const macroBar = (label: string, val: number, max: number, color: string) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>
        <span>{label}</span><span>{val}g</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${Math.min((val / max) * 100, 100)}%`, background: color }} />
      </div>
    </div>
  );

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600&display=swap');

        .na-root {
          font-family: 'Space Grotesk', sans-serif;
          min-height: 100vh;
          background: #0a0a0f;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 2rem 1rem;
          position: relative;
          overflow: hidden;
        }

        .na-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 40% at 20% 10%, rgba(255,120,50,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 80% 90%, rgba(255,60,100,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 40% 60% at 60% 50%, rgba(255,160,50,0.04) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }

        .na-root::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.015'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
        }

        .na-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 580px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 28px;
          overflow: hidden;
          backdrop-filter: blur(20px);
          box-shadow: 0 40px 120px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06);
        }

        .na-header {
          padding: 2.5rem 2.5rem 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: relative;
        }

        .na-header-glow {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #ff7832, #ff3c64, transparent);
        }

        .na-title {
          font-family: 'Outfit', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #ff9550 0%, #ff5f7e 60%, #ff3c64 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          margin-bottom: 0.4rem;
        }

        .na-subtitle {
          font-size: 0.82rem;
          font-weight: 400;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .na-steps {
          display: flex;
          gap: 0;
          padding: 1.25rem 2.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          overflow-x: auto;
          scrollbar-width: none;
        }
        .na-steps::-webkit-scrollbar { display: none; }

        .na-step-dot {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          flex: 1;
          min-width: 48px;
          cursor: default;
          position: relative;
        }

        .na-step-dot::after {
          content: '';
          position: absolute;
          top: 12px;
          left: calc(50% + 12px);
          right: calc(-50% + 12px);
          height: 1px;
          background: rgba(255,255,255,0.1);
        }
        .na-step-dot:last-child::after { display: none; }

        .na-step-circle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          transition: all 0.3s;
          position: relative;
          z-index: 1;
        }

        .na-step-circle.done {
          background: linear-gradient(135deg, #ff7832, #ff3c64);
          color: white;
          box-shadow: 0 0 12px rgba(255,100,50,0.4);
        }
        .na-step-circle.active {
          background: rgba(255,120,50,0.15);
          border: 1.5px solid #ff7832;
          color: #ff9550;
          box-shadow: 0 0 16px rgba(255,120,50,0.25);
        }
        .na-step-circle.pending {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.2);
        }

        .na-step-label {
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          transition: color 0.3s;
          text-align: center;
        }
        .na-step-label.active { color: rgba(255,150,80,0.8); }
        .na-step-label.done { color: rgba(255,255,255,0.35); }

        .na-body {
          padding: 2.5rem;
        }

        .na-question-num {
          font-family: 'Outfit', sans-serif;
          font-size: 4rem;
          font-weight: 800;
          letter-spacing: -0.05em;
          line-height: 1;
          background: linear-gradient(135deg, rgba(255,149,80,0.15), rgba(255,60,100,0.08));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.25rem;
          display: block;
        }

        .na-question {
          font-family: 'Outfit', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: rgba(255,255,255,0.9);
          letter-spacing: -0.02em;
          margin-bottom: 2rem;
          line-height: 1.2;
        }

        .na-option-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .na-option {
          padding: 1rem;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.6);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          line-height: 1.3;
          font-family: 'Space Grotesk', sans-serif;
        }

        .na-option:hover {
          border-color: rgba(255,120,50,0.3);
          background: rgba(255,120,50,0.06);
          color: rgba(255,255,255,0.85);
        }

        .na-option.selected {
          border-color: rgba(255,100,50,0.6);
          background: rgba(255,100,50,0.1);
          color: #ff9550;
          box-shadow: 0 0 20px rgba(255,100,50,0.12), inset 0 0 20px rgba(255,100,50,0.04);
        }

        .na-option-icon {
          display: block;
          font-size: 1.75rem;
          margin-bottom: 0.4rem;
        }

        .na-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 1.1rem 1.5rem;
          font-size: 1.1rem;
          font-weight: 500;
          color: white;
          outline: none;
          transition: all 0.2s;
          font-family: 'Space Grotesk', sans-serif;
          margin-bottom: 2rem;
        }

        .na-input::placeholder { color: rgba(255,255,255,0.2); }
        .na-input:focus {
          border-color: rgba(255,120,50,0.5);
          background: rgba(255,120,50,0.04);
          box-shadow: 0 0 0 3px rgba(255,120,50,0.08);
        }

        .na-nav {
          display: flex;
          gap: 0.75rem;
        }

        .na-btn-back {
          padding: 0.9rem 1.5rem;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent;
          color: rgba(255,255,255,0.35);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Space Grotesk', sans-serif;
        }

        .na-btn-back:hover {
          border-color: rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.6);
        }

        .na-btn-next {
          flex: 1;
          padding: 0.9rem 2rem;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #ff7832 0%, #ff3c64 100%);
          color: white;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s;
          font-family: 'Space Grotesk', sans-serif;
          letter-spacing: 0.02em;
          box-shadow: 0 8px 24px rgba(255,80,50,0.3);
          position: relative;
          overflow: hidden;
        }

        .na-btn-next::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .na-btn-next:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 32px rgba(255,80,50,0.4);
        }
        .na-btn-next:hover::after { opacity: 1; }
        .na-btn-next:active { transform: translateY(0); }

        /* Results */
        .na-results-header {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .na-pet-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,120,50,0.1);
          border: 1px solid rgba(255,120,50,0.25);
          border-radius: 100px;
          padding: 0.4rem 1rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: #ff9550;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
        }

        .na-results-title {
          font-family: 'Outfit', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: white;
          letter-spacing: -0.03em;
          margin-bottom: 0.25rem;
        }

        .na-results-meta {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.3);
        }

        .na-breed-note {
          background: rgba(255,200,100,0.06);
          border: 1px solid rgba(255,200,100,0.15);
          border-radius: 12px;
          padding: 0.9rem 1.1rem;
          font-size: 0.82rem;
          color: rgba(255,210,120,0.85);
          margin-bottom: 1.5rem;
          display: flex;
          gap: 0.5rem;
          align-items: flex-start;
        }

        .na-stat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .na-stat {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 1rem;
          text-align: center;
        }

        .na-stat-val {
          font-family: 'Outfit', sans-serif;
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, #ff9550, #ff5f7e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          margin-bottom: 0.25rem;
        }

        .na-stat-label {
          font-size: 0.7rem;
          font-weight: 500;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .na-macros {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
          space-y: 0.75rem;
        }

        .na-macros-title {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-bottom: 1rem;
        }

        .na-brands {
          margin-bottom: 1.5rem;
        }

        .na-brands-title {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-bottom: 0.75rem;
        }

        .na-brand-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .na-brand-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 0.7rem 1rem;
          transition: border-color 0.2s;
        }

        .na-brand-item:hover { border-color: rgba(255,255,255,0.1); }

        .na-brand-name {
          font-size: 0.88rem;
          font-weight: 600;
          color: rgba(255,255,255,0.8);
        }

        .na-brand-store {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.25);
        }

        .na-tips {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .na-tips-title {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-bottom: 0.75rem;
        }

        .na-tip {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          font-size: 0.82rem;
          color: rgba(255,255,255,0.5);
          padding: 0.35rem 0;
          line-height: 1.4;
        }

        .na-tip-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(255,120,50,0.5);
          margin-top: 0.45rem;
          flex-shrink: 0;
        }

        .na-btn-reset {
          width: 100%;
          padding: 1rem;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.4);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Space Grotesk', sans-serif;
          letter-spacing: 0.03em;
        }

        .na-btn-reset:hover {
          border-color: rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.6);
          background: rgba(255,255,255,0.05);
        }

        .na-fade { animation: naFade 0.22s ease; }
        @keyframes naFade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="na-root">
        <div className="na-card">

          {/* Header */}
          <div className="na-header">
            <div className="na-header-glow" />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div className="na-title">Nutrition Architect</div>
                <div className="na-subtitle">Custom meal plans · South African brands</div>
              </div>
              <span style={{ fontSize: '2rem', marginTop: '-4px' }}>🥩</span>
            </div>
          </div>

          {/* Step indicators */}
          {step < 99 && (
            <div className="na-steps">
              {steps.map(s => {
                const state = s.id < step ? 'done' : s.id === step ? 'active' : 'pending';
                return (
                  <div key={s.id} className="na-step-dot">
                    <div className={`na-step-circle ${state}`}>
                      {state === 'done' ? '✓' : s.id}
                    </div>
                    <span className={`na-step-label ${state}`}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="na-body">

            {/* Questions */}
            {step < 99 && (
              <div className={animating ? '' : 'na-fade'} key={step}>

                <span className="na-question-num">0{step}</span>
                <div className="na-question">
                  {step === 1 && 'What type of pet?'}
                  {step === 2 && 'What breed?'}
                  {step === 3 && 'How old are they?'}
                  {step === 4 && 'How much do they weigh?'}
                  {step === 5 && 'Activity level?'}
                  {step === 6 && 'Any health issues?'}
                  {step === 7 && 'Monthly food budget?'}
                  {step === 8 && 'Daily treats?'}
                </div>

                {/* Step 1: Pet type */}
                {step === 1 && (
                  <div className="na-option-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    {[
                      { val: 'dog', icon: '🐕', label: 'Dog' },
                      { val: 'cat', icon: '🐈', label: 'Cat' },
                    ].map(o => (
                      <button key={o.val} className={`na-option ${petType === o.val ? 'selected' : ''}`}
                        onClick={() => setPetType(o.val as 'dog' | 'cat')}
                        style={{ padding: '1.5rem 1rem' }}>
                        <span className="na-option-icon">{o.icon}</span>
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 2: Breed */}
                {step === 2 && (
                  <input className="na-input" placeholder={petType === 'dog' ? 'Labrador, Boerboel, Rottweiler...' : 'Persian, Siamese, DSH...'}
                    value={breed} onChange={e => setBreed(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && goNext()} autoFocus />
                )}

                {/* Step 3: Age */}
                {step === 3 && (
                  <input className="na-input" placeholder="e.g. 3" type="number" min="0" max="25"
                    value={age} onChange={e => setAge(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && goNext()} autoFocus />
                )}

                {/* Step 4: Weight */}
                {step === 4 && (
                  <input className="na-input" placeholder="Weight in kg, e.g. 25" type="number" min="0" max="120"
                    value={weight} onChange={e => setWeight(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && goNext()} autoFocus />
                )}

                {/* Step 5: Activity */}
                {step === 5 && (
                  <div className="na-option-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                    {[
                      { val: 'low', icon: '🛋️', label: 'Low', sub: 'Couch potato' },
                      { val: 'medium', icon: '🚶', label: 'Medium', sub: 'Daily walks' },
                      { val: 'high', icon: '🏃', label: 'High', sub: 'Working dog' },
                    ].map(o => (
                      <button key={o.val} className={`na-option ${activity === o.val ? 'selected' : ''}`}
                        onClick={() => setActivity(o.val)}>
                        <span className="na-option-icon">{o.icon}</span>
                        <span style={{ display: 'block', fontWeight: 600 }}>{o.label}</span>
                        <span style={{ display: 'block', fontSize: '0.7rem', opacity: 0.5, marginTop: '2px' }}>{o.sub}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 6: Health */}
                {step === 6 && (
                  <input className="na-input" placeholder="Diabetes, allergies, joint issues, or none"
                    value={healthIssues} onChange={e => setHealthIssues(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && goNext()} autoFocus />
                )}

                {/* Step 7: Budget */}
                {step === 7 && (
                  <div className="na-option-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                    {[
                      { val: 'budget', icon: '💰', label: 'Budget', sub: 'R200–500/mo' },
                      { val: 'mid', icon: '⭐', label: 'Mid-range', sub: 'R500–1000/mo' },
                      { val: 'premium', icon: '👑', label: 'Premium', sub: 'R1000+/mo' },
                    ].map(o => (
                      <button key={o.val} className={`na-option ${budget === o.val ? 'selected' : ''}`}
                        onClick={() => setBudget(o.val as 'budget' | 'mid' | 'premium')}>
                        <span className="na-option-icon">{o.icon}</span>
                        <span style={{ display: 'block', fontWeight: 600 }}>{o.label}</span>
                        <span style={{ display: 'block', fontSize: '0.7rem', opacity: 0.5, marginTop: '2px' }}>{o.sub}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 8: Treats */}
                {step === 8 && (
                  <input className="na-input" placeholder="Daily treats in grams, e.g. 20 (or 0)"
                    type="number" min="0"
                    value={treats} onChange={e => setTreats(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && goNext()} autoFocus />
                )}

                <div className="na-nav">
                  {step > 1 && (
                    <button className="na-btn-back" onClick={goPrev}>← Back</button>
                  )}
                  <button className="na-btn-next" onClick={goNext}>
                    {step === 8 ? 'Generate My Plan →' : 'Continue →'}
                  </button>
                </div>
              </div>
            )}

            {/* Results */}
            {step === 99 && results && (
              <div className="na-fade">

                <div className="na-results-header">
                  <div className="na-pet-badge">
                    {petType === 'dog' ? '🐕' : '🐈'} {petType}
                  </div>
                  <div className="na-results-title">{breed || 'Your pet'}'s meal plan</div>
                  <div className="na-results-meta">{age} yrs old · {weight}kg · {activity} activity</div>
                </div>

                {results.note && (
                  <div className="na-breed-note">
                    <span>💡</span>
                    <span>{results.note}</span>
                  </div>
                )}

                {/* Stats */}
                <div className="na-stat-grid">
                  <div className="na-stat">
                    <div className="na-stat-val">{results.dailyCalories}</div>
                    <div className="na-stat-label">kcal / day</div>
                  </div>
                  <div className="na-stat">
                    <div className="na-stat-val">{results.dailyGrams}g</div>
                    <div className="na-stat-label">food / day</div>
                  </div>
                  <div className="na-stat">
                    <div className="na-stat-val">{results.gramsPerMeal}g</div>
                    <div className="na-stat-label">per meal × 2</div>
                  </div>
                </div>

                {/* Macros */}
                <div className="na-macros">
                  <div className="na-macros-title">Estimated macros</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {macroBar('Protein', results.protein, results.protein + results.fat + results.carbs, 'linear-gradient(90deg,#ff7832,#ff5f7e)')}
                    {macroBar('Fat', results.fat, results.protein + results.fat + results.carbs, 'linear-gradient(90deg,#ff9550,#ffb347)')}
                    {macroBar('Carbs', results.carbs, results.protein + results.fat + results.carbs, 'linear-gradient(90deg,#a78bfa,#818cf8)')}
                  </div>
                </div>

                {/* Brands */}
                <div className="na-brands">
                  <div className="na-brands-title">Recommended brands ({budget})</div>
                  <div className="na-brand-list">
                    {results.brands.map((brand: string, i: number) => (
                      <div key={i} className="na-brand-item">
                        <span className="na-brand-name">{brand}</span>
                        <span className="na-brand-store">Checkers · Pick n Pay</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="na-tips">
                  <div className="na-tips-title">Care tips for {breed || 'your pet'}</div>
                  {[
                    'Feed at the same times daily for digestive consistency',
                    'Fresh water should always be available',
                    healthIssues && healthIssues.toLowerCase() !== 'none' ? `Special consideration: ${healthIssues}` : null,
                    'Treats should be under 10% of daily calorie intake',
                    'Weigh monthly and adjust portions as needed',
                  ].filter(Boolean).map((tip, i) => (
                    <div key={i} className="na-tip">
                      <div className="na-tip-dot" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>

                <button className="na-btn-reset" onClick={reset}>
                  ↺ Generate a new plan
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}