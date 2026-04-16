'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

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
  // Emergency conditions - GO NOW
  if (answers.breathing === 'struggling') {
    return {
      urgency: 'emergency',
      title: '🚨 Emergency - Go to Vet NOW',
      message: 'Breathing difficulty is a serious emergency. Please take your pet to the nearest emergency vet immediately.',
      tips: [
        'Keep your pet calm and still',
        'Do not give food or water',
        'Call the emergency vet on the way',
        'Note the time symptoms started',
      ],
    };
  }

  if (answers.mainSymptom === 'seizure') {
    return {
      urgency: 'emergency',
      title: '🚨 Emergency - Go to Vet NOW',
      message: 'Seizures require immediate veterinary attention. Please go to the nearest emergency vet.',
      tips: [
        'Do not put your hand near their mouth',
        'Move objects away to prevent injury',
        'Time the seizure if possible',
        'Keep the room quiet and dark',
      ],
    };
  }

  if (answers.mainSymptom === 'blood_stool' || answers.mainSymptom === 'blood_vomit') {
    return {
      urgency: 'emergency',
      title: '🚨 Emergency - Go to Vet NOW',
      message: 'Blood in vomit or stool can indicate a serious condition. Please seek emergency veterinary care.',
      tips: [
        'Note the color and amount of blood',
        'Collect a sample if possible',
        'Do not give any medication',
        'Keep your pet warm and calm',
      ],
    };
  }

  if (answers.mainSymptom === 'collapse' || answers.mainSymptom === 'not_responding') {
    return {
      urgency: 'emergency',
      title: '🚨 Emergency - Go to Vet NOW',
      message: 'A collapsed or unresponsive pet needs immediate emergency care.',
      tips: [
        'Check if your pet is breathing',
        'Keep them warm with a blanket',
        'Do not move them unnecessarily',
        'Call ahead to the emergency vet',
      ],
    };
  }

  // Call vet today conditions
  if (answers.eating === 'nothing' && answers.duration !== 'few_hours') {
    return {
      urgency: 'call_vet',
      title: '📞 Call Your Vet Today',
      message: 'A pet that has stopped eating for more than a day should be seen by a vet. This is especially important for cats.',
      tips: [
        'Try offering their favorite treat',
        'Check for mouth pain or dental issues',
        'Note when they last ate normally',
        'Monitor water intake too',
      ],
    };
  }

  if (answers.vomiting === 'multiple' || answers.diarrhea === 'multiple') {
    return {
      urgency: 'call_vet',
      title: '📞 Call Your Vet Today',
      message: 'Multiple episodes of vomiting or diarrhea can lead to dehydration. Your pet should be checked today.',
      tips: [
        'Remove food for 12 hours (adults only)',
        'Offer small amounts of water frequently',
        'Watch for signs of dehydration (dry gums)',
        'Note what they ate recently',
      ],
    };
  }

  if (answers.energy === 'lethargic' && answers.duration !== 'few_hours') {
    return {
      urgency: 'call_vet',
      title: '📞 Call Your Vet Today',
      message: 'Persistent lethargy (lasting more than a day) can indicate an underlying health issue.',
      tips: [
        'Check their temperature if you can',
        'Note any other changes in behavior',
        'Check gums - they should be pink',
        'Monitor food and water intake',
      ],
    };
  }

  if (answers.mainSymptom === 'limping' && answers.duration !== 'few_hours') {
    return {
      urgency: 'call_vet',
      title: '📞 Call Your Vet Today',
      message: 'Persistent limping should be checked to rule out fractures, sprains, or joint issues.',
      tips: [
        'Restrict exercise and jumping',
        'Check the paw for cuts or thorns',
        'Feel gently for swelling or heat',
        'Do not give human painkillers',
      ],
    };
  }

  // Monitor at home
  return {
    urgency: 'monitor',
    title: '🏠 Monitor at Home',
    message: 'Based on your answers, this seems manageable at home for now. Keep watching closely and call your vet if things get worse.',
    tips: [
      'Monitor for changes over the next 24 hours',
      'Make sure fresh water is available',
      'Keep a written log of symptoms',
      'Call your vet if symptoms worsen or persist',
    ],
  };
}

export default function SymptomChecker({ petId, petName, petSpecies }: { petId: string; petName: string; petSpecies: string }) {
  const supabase = createSupabaseBrowserClient();

  const [step, setStep] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [saving, setSaving] = useState(false);

  // Answers
  const [mainSymptom, setMainSymptom] = useState('');
  const [duration, setDuration] = useState('');
  const [eating, setEating] = useState('');
  const [energy, setEnergy] = useState('');
  const [vomiting, setVomiting] = useState('');
  const [diarrhea, setDiarrhea] = useState('');
  const [breathing, setBreathing] = useState('');

  function handleAnalyze() {
    const analysisResult = analyzeSymptoms({
      mainSymptom,
      duration,
      eating,
      energy,
      vomiting,
      diarrhea,
      breathing,
      species: petSpecies,
    });

    setResult(analysisResult);
    saveToJournal(analysisResult);
  }

  async function saveToJournal(analysisResult: Result) {
    setSaving(true);

    await supabase.from('health_journal').insert({
      pet_id: petId,
      date: new Date().toISOString().split('T')[0],
      symptoms: `Symptom Check: ${mainSymptom}. Duration: ${duration}. Result: ${analysisResult.title}`,
      notes: analysisResult.message,
    });

    setSaving(false);
  }

  function resetChecker() {
    setStep(0);
    setResult(null);
    setMainSymptom('');
    setDuration('');
    setEating('');
    setEnergy('');
    setVomiting('');
    setDiarrhea('');
    setBreathing('');
  }

  const urgencyColors = {
    monitor: 'bg-green-50 border-green-200 text-green-800',
    call_vet: 'bg-amber-50 border-amber-200 text-amber-800',
    emergency: 'bg-red-50 border-red-200 text-red-800',
  };

  // Show result
  if (result) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">🩺 Symptom Checker Result</h2>

        <div className={`rounded-xl p-6 border-2 mb-6 ${urgencyColors[result.urgency]}`}>
          <h3 className="text-2xl font-bold mb-2">{result.title}</h3>
          <p className="text-lg">{result.message}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-5 mb-6">
          <h4 className="font-semibold mb-3">What to do now:</h4>
          <ul className="space-y-2">
            {result.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Disclaimer:</strong> This is NOT a medical diagnosis. It is general guidance only. 
            Always consult your veterinarian for professional medical advice about {petName}'s health.
          </p>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          ✅ This check has been saved to {petName}'s Health Journal.
        </p>

        <button
          onClick={resetChecker}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Start New Check
        </button>
      </div>
    );
  }

  // Questions flow
  const questions = [
    {
      question: `What is ${petName}'s main concern?`,
      options: [
        { value: 'vomiting', label: '🤮 Vomiting' },
        { value: 'diarrhea', label: '💩 Diarrhea' },
        { value: 'not_eating', label: '🚫 Not eating' },
        { value: 'limping', label: '🦿 Limping' },
        { value: 'coughing', label: '😷 Coughing / Sneezing' },
        { value: 'scratching', label: '🐾 Excessive scratching' },
        { value: 'blood_stool', label: '🩸 Blood in stool' },
        { value: 'blood_vomit', label: '🩸 Blood in vomit' },
        { value: 'seizure', label: '⚡ Seizure / Shaking' },
        { value: 'collapse', label: '😰 Collapse / Not responding' },
        { value: 'other', label: '❓ Something else' },
      ],
      value: mainSymptom,
      setValue: setMainSymptom,
    },
    {
      question: 'How long has this been going on?',
      options: [
        { value: 'few_hours', label: '⏰ A few hours' },
        { value: 'one_day', label: '📅 About 1 day' },
        { value: 'few_days', label: '📅 2-3 days' },
        { value: 'week_plus', label: '📅 A week or more' },
      ],
      value: duration,
      setValue: setDuration,
    },
    {
      question: `Is ${petName} eating?`,
      options: [
        { value: 'normal', label: '😋 Eating normally' },
        { value: 'less', label: '😐 Eating less than usual' },
        { value: 'nothing', label: '🚫 Not eating at all' },
      ],
      value: eating,
      setValue: setEating,
    },
    {
      question: `How is ${petName}'s energy?`,
      options: [
        { value: 'normal', label: '⚡ Normal energy' },
        { value: 'tired', label: '😴 More tired than usual' },
        { value: 'lethargic', label: '🛌 Very lethargic / won\'t move' },
      ],
      value: energy,
      setValue: setEnergy,
    },
    {
      question: 'Any vomiting?',
      options: [
        { value: 'none', label: '✅ No vomiting' },
        { value: 'once', label: '1️⃣ Vomited once' },
        { value: 'multiple', label: '🔄 Vomited multiple times' },
      ],
      value: vomiting,
      setValue: setVomiting,
    },
    {
      question: 'Any diarrhea?',
      options: [
        { value: 'none', label: '✅ No diarrhea' },
        { value: 'once', label: '1️⃣ Once' },
        { value: 'multiple', label: '🔄 Multiple times' },
      ],
      value: diarrhea,
      setValue: setDiarrhea,
    },
    {
      question: `How is ${petName}'s breathing?`,
      options: [
        { value: 'normal', label: '✅ Normal breathing' },
        { value: 'fast', label: '💨 Faster than usual' },
        { value: 'struggling', label: '🚨 Struggling to breathe' },
      ],
      value: breathing,
      setValue: setBreathing,
    },
  ];

  const currentQuestion = questions[step];
  const isLastStep = step === questions.length - 1;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-2">🩺 Should I Call the Vet?</h2>
      <p className="text-sm text-gray-600 mb-6">
        Answer a few questions about {petName} and we'll help you decide.
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${((step + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">
          {step + 1}. {currentQuestion.question}
        </h3>

        <div className="space-y-2">
          {currentQuestion.options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                currentQuestion.setValue(option.value);
                if (!isLastStep) {
                  setStep(step + 1);
                }
              }}
              className={`w-full text-left p-4 rounded-xl border-2 transition ${
                currentQuestion.value === option.value
                  ? 'border-blue-600 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            ← Back
          </button>
        )}

        {isLastStep && currentQuestion.value && (
          <button
            onClick={handleAnalyze}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Get Recommendation
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        Step {step + 1} of {questions.length}
      </p>
    </div>
  );
}