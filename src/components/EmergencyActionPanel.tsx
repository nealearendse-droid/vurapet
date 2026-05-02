'use client';

import { useState } from 'react';

type Urgency = 'monitor' | 'call_vet' | 'emergency';

type Result = {
  urgency: Urgency;
  title: string;
  message: string;
  tips: string[];
};

function analyzeSymptoms(answers: {
  mainSymptom: string;
  duration: string;
  eating: string;
  energy: string;
  vomiting: string;
  diarrhea: string;
  breathing: string;
  species: string;
}): Result {
  if (answers.breathing === 'struggling') {
    return {
      urgency: 'emergency',
      title: '🚨 Emergency — Go to Vet NOW',
      message: 'Breathing difficulty is a serious emergency. Take your pet to the nearest emergency vet immediately.',
      tips: ['Keep your pet calm and still', 'Do not give food or water', 'Call the emergency vet on the way', 'Note the time symptoms started'],
    };
  }
  if (answers.mainSymptom === 'seizure') {
    return {
      urgency: 'emergency',
      title: '🚨 Emergency — Go to Vet NOW',
      message: 'Seizures require immediate veterinary attention. Go to the nearest emergency vet now.',
      tips: ['Do not put your hand near their mouth', 'Move objects away to prevent injury', 'Time the seizure if possible', 'Keep the room quiet and dark'],
    };
  }
  if (answers.mainSymptom === 'blood_stool' || answers.mainSymptom === 'blood_vomit') {
    return {
      urgency: 'emergency',
      title: '🚨 Emergency — Go to Vet NOW',
      message: 'Blood in vomit or stool can indicate a serious condition. Seek emergency veterinary care now.',
      tips: ['Note the colour and amount of blood', 'Collect a sample if possible', 'Do not give any medication', 'Keep your pet warm and calm'],
    };
  }
  if (answers.mainSymptom === 'collapse' || answers.mainSymptom === 'not_responding') {
    return {
      urgency: 'emergency',
      title: '🚨 Emergency — Go to Vet NOW',
      message: 'A collapsed or unresponsive pet needs immediate emergency care.',
      tips: ['Check if your pet is breathing', 'Keep them warm with a blanket', 'Do not move them unnecessarily', 'Call ahead to the emergency vet'],
    };
  }
  if (answers.eating === 'nothing' && answers.duration !== 'few_hours') {
    return {
      urgency: 'call_vet',
      title: '📞 Call the Vet Today',
      message: 'A pet that has stopped eating for more than a day should be seen by a vet today.',
      tips: ['Try offering their favourite treat', 'Check for mouth pain or difficulty swallowing', 'Note when they last ate normally', 'Monitor water intake too'],
    };
  }
  if (answers.vomiting === 'multiple' || answers.diarrhea === 'multiple') {
    return {
      urgency: 'call_vet',
      title: '📞 Call the Vet Today',
      message: 'Multiple episodes of vomiting or diarrhea can cause dangerous dehydration. Call the vet today.',
      tips: ['Remove food for 12 hours (adults only)', 'Offer small amounts of water frequently', 'Watch for signs of dehydration — dry gums', 'Note what they ate recently'],
    };
  }
  if (answers.energy === 'lethargic' && answers.duration !== 'few_hours') {
    return {
      urgency: 'call_vet',
      title: '📞 Call the Vet Today',
      message: 'Persistent lethargy lasting more than a day can signal an underlying health issue.',
      tips: ['Check their temperature if you can', 'Note any other behavioural changes', 'Check gums — they should be pink and moist', 'Monitor food and water intake'],
    };
  }
  if (answers.mainSymptom === 'limping' && answers.duration !== 'few_hours') {
    return {
      urgency: 'call_vet',
      title: '📞 Call the Vet Today',
      message: 'Persistent limping should be checked to rule out fractures, sprains, or joint issues.',
      tips: ['Restrict exercise and jumping', 'Check the paw for cuts or thorns', 'Feel gently for swelling or heat', 'Do not give human painkillers'],
    };
  }
  return {
    urgency: 'monitor',
    title: '🏠 Monitor at Home',
    message: "Based on what you've described, this seems manageable at home for now. Watch closely and call the vet if things get worse.",
    tips: ['Monitor for changes over the next 24 hours', 'Make sure fresh water is always available', 'Keep a written log of symptoms', 'Call the vet if symptoms worsen or persist'],
  };
}

interface Props {
  petName: string;
  petSpecies: string;
  ownerName?: string;
  ownerPhone?: string;
  vetName?: string;
  vetPhone?: string;
}

export default function EmergencyActionPanel({ petName, petSpecies, ownerName, ownerPhone, vetName, vetPhone }: Props) {
  const [result, setResult] = useState<Result | null>(null);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  const scenarios = [
    { id: 'not_eating', emoji: '🚫', label: 'Not Eating', sublabel: 'Refusing food or water', color: '#fff7ed', borderColor: '#f97316',
      answers: { mainSymptom: 'not_eating', duration: 'one_day', eating: 'nothing', energy: 'tired', vomiting: 'none', diarrhea: 'none', breathing: 'normal', species: petSpecies } },
    { id: 'vomiting', emoji: '🤢', label: 'Vomiting', sublabel: 'Once or repeatedly', color: '#fef2f2', borderColor: '#ef4444',
      answers: { mainSymptom: 'vomiting', duration: 'one_day', eating: 'less', energy: 'tired', vomiting: 'multiple', diarrhea: 'none', breathing: 'normal', species: petSpecies } },
    { id: 'injured', emoji: '🦴', label: 'Injured / Limping', sublabel: "Can't put weight on a leg", color: '#fef2f2', borderColor: '#ef4444',
      answers: { mainSymptom: 'limping', duration: 'one_day', eating: 'less', energy: 'tired', vomiting: 'none', diarrhea: 'none', breathing: 'normal', species: petSpecies } },
    { id: 'something_off', emoji: '😟', label: 'Something Feels Off', sublabel: 'Lethargic, hiding, or unusual', color: '#fffbeb', borderColor: '#f59e0b',
      answers: { mainSymptom: 'other', duration: 'one_day', eating: 'less', energy: 'lethargic', vomiting: 'none', diarrhea: 'none', breathing: 'normal', species: petSpecies } },
  ];

  const urgencyStyle = {
    emergency: { bg: '#fef2f2', border: '#ef4444', titleColor: '#991b1b', badgeBg: '#ef4444' },
    call_vet:  { bg: '#fffbeb', border: '#f59e0b', titleColor: '#92400e', badgeBg: '#f59e0b' },
    monitor:   { bg: '#f0fdf4', border: '#22c55e', titleColor: '#14532d', badgeBg: '#22c55e' },
  };

  const handleScenario = (scenario: typeof scenarios[0]) => {
    setActiveScenario(scenario.id);
    setResult(analyzeSymptoms(scenario.answers));
    setTimeout(() => document.getElementById('eap-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };
  return (
    <div style={{ background: '#fff', border: '2px solid #ef4444', borderRadius: 20, padding: '20px 16px' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 28 }}>🚨</span>
        <div>
          <p style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0 }}>Emergency Guide</p>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>What's happening with {petName}?</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {scenarios.map((s) => (
          <button key={s.id} onClick={() => handleScenario(s)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '16px 10px', borderRadius: 14, cursor: 'pointer', gap: 4, minHeight: 100,
            background: activeScenario === s.id ? s.color : '#fff',
            border: `${activeScenario === s.id ? 2 : 1}px solid ${activeScenario === s.id ? s.borderColor : '#e5e7eb'}`,
          }}>
            <span style={{ fontSize: 28 }}>{s.emoji}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111827', textAlign: 'center' }}>{s.label}</span>
            <span style={{ fontSize: 11, color: '#6b7280', textAlign: 'center' }}>{s.sublabel}</span>
          </button>
        ))}
      </div>

      {result && (
        <div id="eap-result" style={{ border: `2px solid ${urgencyStyle[result.urgency].border}`, borderRadius: 14, padding: 16, marginBottom: 16, background: urgencyStyle[result.urgency].bg }}>
          <p style={{ fontSize: 18, fontWeight: 800, color: urgencyStyle[result.urgency].titleColor, margin: '0 0 8px' }}>{result.title}</p>
          <p style={{ fontSize: 14, color: '#374151', margin: '0 0 14px', lineHeight: 1.6 }}>{result.message}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {result.tips.map((tip, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: urgencyStyle[result.urgency].badgeBg, flexShrink: 0, marginTop: 5, display: 'inline-block' }} />
                <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{tip}</span>
              </div>
            ))}
          </div>
          <button onClick={() => { setResult(null); setActiveScenario(null); }} style={{ background: 'none', border: 'none', fontSize: 13, color: '#6b7280', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
            ↩ Check a different symptom
          </button>
        </div>
      )}

      <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 14, marginBottom: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', margin: '0 0 10px', textTransform: 'uppercase' }}>Quick Contacts</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {ownerPhone ? (
            <a href={`tel:${ownerPhone}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 10px', borderRadius: 14, background: '#f97316', textDecoration: 'none', gap: 2 }}>
              <span style={{ fontSize: 22 }}>📱</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Call Owner</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>{ownerName || 'Owner'}</span>
            </a>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 10px', borderRadius: 14, background: '#f3f4f6', gap: 2 }}>
              <span style={{ fontSize: 22 }}>📱</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#9ca3af' }}>Call Owner</span>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>No number saved</span>
            </div>
          )}
          {vetPhone ? (
            <a href={`tel:${vetPhone}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 10px', borderRadius: 14, background: '#dc2626', textDecoration: 'none', gap: 2 }}>
              <span style={{ fontSize: 22 }}>🏥</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Call Vet</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>{vetName || 'Vet'}</span>
            </a>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 10px', borderRadius: 14, background: '#f3f4f6', gap: 2 }}>
              <span style={{ fontSize: 22 }}>🏥</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#9ca3af' }}>Call Vet</span>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>No number saved</span>
            </div>
          )}
        </div>
      </div>

      <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
        ⚠️ This is guidance only — not a medical diagnosis. When in doubt, call the vet.
      </p>

    </div>
  );
}