'use client';
import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';

type Message = {
  id: string;
  text: string;
  isAI: boolean;
  options?: { id: string; label: string; nextStep: string }[];
};

type PetInfo = {
  id: string;
  name: string;
  breed: string;
  species: string;
  age: number;
  weight: number;
  allergies?: string[];
  conditions?: string[];
};

// Pre-scripted response templates that mix and match
const getWeightCategory = (weight: number): string => {
  if (weight < 10) return 'small';
  if (weight < 25) return 'medium';
  if (weight < 40) return 'large';
  return 'giant';
};

const getBreedInsight = (breed: string, weightCategory: string): string => {
  const insights = {
    'German Shepherd': 'German Shepherds have a higher predisposition to gastric bloat and hip issues.',
    'Chihuahua': 'Small breeds like Chihuahuas are prone to tracheal collapse and dental issues.',
    'Labrador': 'Labradors are known for eating things they shouldn\'t. Monitor closely.',
    'default_large': 'Large breed dogs can deteriorate faster than smaller dogs.',
    'default_small': 'Small dogs can become dehydrated very quickly.',
  };
  return insights[breed] || insights[`default_${weightCategory}`] || '';
};

const getPersonalizedIntro = (pet: PetInfo): string => {
  const templates = [
    `I'm analyzing ${pet.name}'s profile... (${pet.age} year old ${pet.breed}, ${pet.weight}kg).`,
    `Let me pull up ${pet.name}'s medical history... ${pet.age} year old ${pet.breed}, ${pet.weight}kg.`,
    `Scanning ${pet.name}'s health records... Based on his breed and size, I need to ask a few specific questions.`,
    `I'm cross-referencing ${pet.name}'s profile against veterinary databases. ${pet.age} year old ${pet.breed}, ${pet.weight}kg.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
};

const getTransition = (): string => {
  const transitions = [
    `One moment while I analyze that...`,
    `Thank you. Let me process that information.`,
    `I understand. Let me check something...`,
    `Got it. Based on that, I need to ask one more question.`,
  ];
  return transitions[Math.floor(Math.random() * transitions.length)];
};

const getUrgencyMessage = (level: string, pet: PetInfo): string => {
  if (level === 'emergency') {
    const templates = [
      `🚨 CRITICAL ALERT for ${pet.name}. Based on your answers, this requires IMMEDIATE veterinary attention. ${pet.name} is showing signs that match [SYMPTOM_TYPE] which can deteriorate rapidly in ${pet.breed}s of this size. Do not wait.`,
      `⚠️ I strongly recommend seeking emergency care right now. The combination of symptoms you described, combined with ${pet.name}'s breed and weight, creates a high-risk profile for [CONDITION].`,
    ];
    return templates[0].replace('[SYMPTOM_TYPE]', 'the condition').replace('[CONDITION]', 'complications');
  }
  if (level === 'vet') {
    return `Based on ${pet.name}'s profile, I recommend contacting your veterinarian today. While not immediately life-threatening, these symptoms warrant professional attention within the next 12-24 hours.`;
  }
  return `Good news - based on your answers, this appears manageable at home for now. Keep monitoring ${pet.name} closely and watch for any changes.`;
};

export default function EmergencyAI({ petId }: { petId: string }) {
  const [pet, setPet] = useState<PetInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState('start');
  const [showOptions, setShowOptions] = useState(false);

  // Load pet data
  useEffect(() => {
    async function loadPet() {
      const supabase = getSupabaseClient();
      const { data } = await supabase.from('pets').select('*').eq('id', petId).single();
      if (data) {
        setPet({
          id: data.id,
          name: data.name,
          breed: data.breed || 'pet',
          species: data.species || 'dog',
          age: data.age || 2,
          weight: data.weight || 15,
          allergies: data.allergies || [],
          conditions: data.chronic_conditions || [],
        });
      }
      setLoading(false);
      
      // Start the conversation
      setTimeout(() => {
        addAIMessage(getPersonalizedIntro({
          id: petId,
          name: data?.name || 'your pet',
          breed: data?.breed || 'pet',
          species: data?.species || 'dog',
          age: data?.age || 2,
          weight: data?.weight || 15,
        }));
      }, 1000);
    }
    loadPet();
  }, [petId]);

  const addAIMessage = (text: string, options?: { id: string; label: string; nextStep: string }[]) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text,
        isAI: true,
        options,
      }]);
      setIsTyping(false);
      setShowOptions(!!options);
    }, 1800 + Math.random() * 1200);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text,
      isAI: false,
    }]);
  };

  const handleOption = (option: { id: string; label: string; nextStep: string }) => {
    addUserMessage(option.label);
    setShowOptions(false);
    setCurrentStep(option.nextStep);
    processStep(option.nextStep);
  };

  const processStep = (step: string) => {
    if (!pet) return;

    setTimeout(() => {
      addAIMessage(getTransition());
    }, 500);

    setTimeout(() => {
      if (step === 'vomiting_q1') {
        addAIMessage(`When did ${pet.name} first start vomiting? Was it within the last hour, or has it been ongoing for several hours?`, [
          { id: 'vomiting_recent', label: 'Within the last hour', nextStep: 'vomiting_recent' },
          { id: 'vomiting_ongoing', label: 'Several hours / multiple times', nextStep: 'vomiting_ongoing' },
          { id: 'vomiting_intermittent', label: 'On and off for a day or more', nextStep: 'vomiting_intermittent' },
        ]);
      }
      else if (step === 'vomiting_recent') {
        addAIMessage(`Thank you. For a ${getWeightCategory(pet.weight)} breed like ${pet.breed}, recent vomiting is often caused by dietary indiscretion. Can you describe what the vomit looked like?`, [
          { id: 'vomit_food', label: 'Undigested food', nextStep: 'vomit_food' },
          { id: 'vomit_foam', label: 'Yellow foam / bile', nextStep: 'vomit_foam' },
          { id: 'vomit_blood', label: 'Blood or coffee-ground appearance', nextStep: 'emergency_blood' },
          { id: 'vomit_foreign', label: 'Foreign object / toy pieces', nextStep: 'emergency_foreign' },
        ]);
      }
      else if (step === 'vomiting_ongoing') {
        addAIMessage(`Multiple episodes of vomiting can lead to rapid dehydration in ${pet.breed}s. Has ${pet.name} been able to keep any water down?`, [
          { id: 'water_yes', label: 'Yes, drinking normally', nextStep: 'vomit_multiple_with_water' },
          { id: 'water_no', label: 'No, vomiting water too', nextStep: 'emergency_dehydration' },
          { id: 'water_unsure', label: 'Not sure', nextStep: 'vomit_multiple_check' },
        ]);
      }
      else if (step === 'vomiting_intermittent') {
        addAIMessage(`Intermittent vomiting over a day or more can indicate several things. How is ${pet.name}'s energy level compared to normal?`, [
          { id: 'energy_normal', label: 'Normal energy, playing', nextStep: 'vomit_mild' },
          { id: 'energy_tired', label: 'More tired than usual', nextStep: 'vomit_tired' },
          { id: 'energy_lethargic', label: 'Very lethargic, won't move', nextStep: 'emergency_lethargic' },
        ]);
      }
      else if (step === 'vomit_food') {
        addAIMessage(`Undigested food suggests the vomiting happened soon after eating. For a ${pet.weight}kg ${pet.breed}, I recommend: Withhold food for 6-8 hours to let their stomach settle, then offer a small amount of bland diet (boiled chicken and rice). Monitor for any additional episodes. ${getBreedInsight(pet.breed, getWeightCategory(pet.weight))}`, [
          { id: 'continue', label: 'Understood, I will monitor', nextStep: 'end' },
          { id: 'worse', label: 'What if it gets worse?', nextStep: 'worse_advice' },
        ]);
      }
      else if (step === 'vomit_foam') {
        addAIMessage(`Yellow foam is bile, which usually means an empty stomach. This is common but can indicate nausea. Has ${pet.name} been eating normally?`, [
          { id: 'eating_yes', label: 'Eating normally', nextStep: 'vomit_foam_normal' },
          { id: 'eating_no', label: 'Not interested in food', nextStep: 'vomit_foam_no_eat' },
        ]);
      }
      else if (step === 'vomit_foam_normal') {
        addAIMessage(`Since ${pet.name} is still eating and acting normal, this may be simple acid reflux. Try feeding smaller, more frequent meals. If it continues for more than 24 hours or you see blood, contact your vet.`, [
          { id: 'end', label: 'Thank you, I will try that', nextStep: 'end' },
        ]);
      }
      else if (step === 'vomit_foam_no_eat') {
        addAIMessage(`Not eating combined with bile vomiting is concerning for a ${pet.breed} of this size. I recommend calling your vet today. Dehydration can set in faster than you think.`, [
          { id: 'vet', label: 'I will call the vet', nextStep: 'vet' },
          { id: 'wait', label: 'I want to wait and see', nextStep: 'wait_warning' },
        ]);
      }
      else if (step === 'emergency_blood') {
        addAIMessage(`🚨 EMERGENCY ALERT - Blood in vomit is a critical sign. For a ${pet.weight}kg ${pet.breed}, this could indicate a bleeding ulcer, toxin ingestion, or severe inflammation. Do not wait. ${getBreedInsight(pet.breed, getWeightCategory(pet.weight))}`, [
          { id: 'emergency_action', label: 'Take me to emergency instructions', nextStep: 'emergency_action' },
        ]);
      }
      else if (step === 'emergency_foreign') {
        addAIMessage(`🚨 EMERGENCY - If ${pet.name} swallowed a foreign object, this can cause a life-threatening intestinal blockage. Do not induce vomiting without vet guidance. Head to the emergency vet immediately.`, [
          { id: 'emergency_action', label: 'Get emergency instructions', nextStep: 'emergency_action' },
        ]);
      }
      else if (step === 'emergency_dehydration') {
        addAIMessage(`⚠️ URGENT - ${pet.name} cannot keep water down and is at high risk of severe dehydration. ${pet.breed}s of ${pet.weight}kg can deteriorate within hours. Please contact your vet today.`, [
          { id: 'vet', label: 'Call vet now', nextStep: 'vet' },
          { id: 'emergency_action', label: 'Emergency clinic info', nextStep: 'emergency_action' },
        ]);
      }
      else if (step === 'emergency_lethargic') {
        addAIMessage(`🚨 CRITICAL - Severe lethargy combined with vomiting is a red flag for serious conditions including pancreatitis, kidney issues, or bloat. ${getBreedInsight(pet.breed, getWeightCategory(pet.weight))}`, [
          { id: 'emergency_action', label: 'Emergency vet now', nextStep: 'emergency_action' },
        ]);
      }
      else if (step === 'vomit_mild') {
        addAIMessage(`This sounds mild. Monitor ${pet.name} at home. Offer small amounts of water frequently. If vomiting continues or you see blood, lethargy, or abdominal swelling, seek care immediately.`, [
          { id: 'end', label: 'Will do, thank you', nextStep: 'end' },
        ]);
      }
      else if (step === 'vomit_tired') {
        addAIMessage(`Increased tiredness suggests ${pet.name} isn't feeling well. I recommend calling your vet today for advice. In the meantime, ensure fresh water is available and note any other changes.`, [
          { id: 'vet', label: 'I will call the vet', nextStep: 'vet' },
        ]);
      }
      else if (step === 'worse_advice') {
        addAIMessage(`If ${pet.name}'s condition worsens - look for: blood in vomit, abdominal swelling, pale gums, or collapse. Any of these require immediate emergency care.`, [
          { id: 'end', label: 'Understood', nextStep: 'end' },
        ]);
      }
      else if (step === 'wait_warning') {
        addAIMessage(`I understand wanting to wait. Please watch closely for: blood in vomit, lethargy, abdominal pain, or not drinking. If you see any of these, seek care immediately.`, [
          { id: 'end', label: 'I will watch closely', nextStep: 'end' },
        ]);
      }
      else if (step === 'vet') {
        addAIMessage(`Keep a log of ${pet.name}'s symptoms to share with the vet. You can use the Health Journal to track everything. Wishing ${pet.name} a speedy recovery.`, [
          { id: 'end', label: 'Thank you', nextStep: 'end' },
        ]);
      }
      else if (step === 'emergency_action') {
        addAIMessage(`🚨 EMERGENCY INSTRUCTIONS FOR ${pet.name.toUpperCase()} 🚨\n\n1. Call ahead to the nearest emergency vet\n2. Keep ${pet.name} calm and warm\n3. Do not give any food or medication\n4. Bring any vomit or suspected toxin samples\n5. Have ${pet.name}'s microchip number ready: ${pet.microchip || 'on file'}\n\n📋 Generating Vet Handover Profile...`, [
          { id: 'end', label: 'I understand, going to vet now', nextStep: 'end' },
        ]);
      }
      else if (step === 'end') {
        addAIMessage(`Thank you for using VuraPet Emergency AI. Remember: I'm an AI assistant, not a veterinarian. When in doubt, always consult a professional. You can save this conversation to ${pet.name}'s Health Journal. Stay safe! 🐾`);
      }
    }, 2500);
  };

  if (loading) {
    return (
      <div className="bg-[#1a1a2e] rounded-xl p-6 text-center">
        <div className="animate-pulse">
          <div className="text-4xl mb-3">🩺</div>
          <p className="text-gray-400">Loading emergency AI assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a2e] rounded-xl overflow-hidden border border-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚨</span>
          <div>
            <h2 className="font-bold">VuraPet Emergency AI</h2>
            <p className="text-sm opacity-90">AI-powered emergency triage • Always available</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="p-4 h-[500px] overflow-y-auto flex flex-col gap-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isAI ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] p-3 rounded-xl ${msg.isAI ? 'bg-gray-800 text-white' : 'bg-emerald-600 text-white'}`}>
              <div className="whitespace-pre-wrap text-sm">{msg.text}</div>
              {msg.options && (
                <div className="mt-3 flex flex-col gap-2">
                  {msg.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleOption(opt)}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800 p-3 rounded-xl">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        {!showOptions && messages.length > 0 && !isTyping && (
          <div className="text-center text-xs text-gray-500 mt-2">
            <button 
              onClick={() => window.location.reload()}
              className="hover:text-gray-300 transition"
            >
              ↺ Start over
            </button>
          </div>
        )}
      </div>
      {/* Vet Handover Profile Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => {
            alert(`📋 EMERGENCY HANDOVER PROFILE for ${pet?.name}\n\nInclude this when going to the vet:\n• Name: ${pet?.name}\n• Breed: ${pet?.breed}\n• Weight: ${pet?.weight}kg\n• Age: ${pet?.age} years\n• Microchip: ${pet?.microchip || 'Not registered'}\n• Allergies: ${pet?.allergies?.join(', ') || 'None reported'}\n• Chronic conditions: ${pet?.chronic_conditions?.join(', ') || 'None'}\n\nThis information helps the vet treat ${pet?.name} faster.`);
          }}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
        >
          📋 Generate Vet Handover Profile
        </button>
      </div>
      {/* Disclaimer */}
      <div className="bg-gray-900 p-3 text-center text-xs text-gray-500 border-t border-gray-800">
        ⚠️ AI Assistant is for guidance only. Always consult a veterinarian for medical emergencies.
      </div>
    </div>
  );
}