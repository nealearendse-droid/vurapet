'use client';
import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function EmergencyAI({ petId }: { petId: string }) {
  const [pet, setPet] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    async function loadPet() {
      const supabase = getSupabaseClient();
      const { data } = await supabase.from('pets').select('*').eq('id', petId).single();
      setPet(data);
      setLoading(false);
      
      // Start conversation after 1 second
      setTimeout(() => {
        addMessage(`🩺 I'm analyzing ${data?.name || 'your pet'}'s health...`, true);
        setTimeout(() => {
          addMessage(`What symptoms are you concerned about?`, true, [
            "🤢 Vomiting",
            "💩 Diarrhea",
            "😮‍💨 Breathing trouble",
            "🦴 Injury / Limping",
            "☠️ Ate something toxic",
            "😴 Unusually tired"
          ]);
        }, 2000);
      }, 1000);
    }
    loadPet();
  }, [petId]);

  const addMessage = (text: string, isAI: boolean, options?: string[]) => {
    setMessages(prev => [...prev, { text, isAI, options, id: Date.now() }]);
  };

  const handleUserChoice = (choice: string) => {
    // Add user's choice
    setMessages(prev => [...prev, { text: choice, isAI: false, id: Date.now() }]);
    
    // Show typing indicator
    setIsTyping(true);
    
    // AI responds based on choice
    setTimeout(() => {
      setIsTyping(false);
      
      if (choice.includes("Vomiting")) {
        addMessage(`How many times has ${pet?.name || 'your pet'} vomited?`, true, [
          "Just once",
          "2-3 times",
          "Multiple times (4+)",
          "Cannot keep water down"
        ]);
      }
      else if (choice.includes("Breathing")) {
        addMessage(`Describe ${pet?.name}'s breathing:`, true, [
          "Normal but noisy",
          "Faster than usual",
          "Struggling / gasping",
          "Gums look blue or pale"
        ]);
      }
      else if (choice.includes("Toxic")) {
        addMessage(`What did ${pet?.name} eat?`, true, [
          "Chocolate",
          "Grapes / Raisins",
          "Human medication",
          "Rat poison",
          "Something else"
        ]);
      }
      else if (choice === "Just once") {
        addMessage(`✅ Monitor at home. Withhold food for 6 hours, then offer bland diet. If vomiting continues, call your vet.`, true);
      }
      else if (choice === "2-3 times" || choice === "Multiple times (4+)") {
        addMessage(`⚠️ Contact your vet today. Multiple vomiting episodes can lead to dehydration. Make sure ${pet?.name} has access to small amounts of water.`, true);
      }
      else if (choice === "Cannot keep water down") {
        addMessage(`🚨 EMERGENCY - ${pet?.name} needs immediate veterinary care. Dehydration can happen very quickly. Please go to the nearest emergency vet now.`, true);
      }
      else if (choice === "Struggling / gasping" || choice === "Gums look blue or pale") {
        addMessage(`🚨 CRITICAL EMERGENCY - This is life-threatening. Go to the nearest emergency vet IMMEDIATELY. Call ahead to let them know you're coming.`, true);
      }
      else if (choice === "Chocolate") {
        addMessage(`How much chocolate and what type? Dark chocolate is more dangerous. For a ${pet?.weight || '?'}kg ${pet?.breed || 'pet'}`, true, [
          "Just a small bite",
          "A few pieces",
          "A whole bar/block"
        ]);
      }
      else if (choice === "Just a small bite") {
        addMessage(`✅ Monitor for vomiting, diarrhea, or hyperactivity. Call your vet if you notice any symptoms.`, true);
      }
      else if (choice === "A few pieces" || choice === "A whole bar/block") {
        addMessage(`⚠️ Contact your vet immediately. Chocolate toxicity can be serious. Have ${pet?.name}'s weight (${pet?.weight}kg) ready when you call.`, true);
      }
      else if (choice.includes("Grapes")) {
        addMessage(`🚨 EMERGENCY - Grapes/raisins can cause kidney failure in dogs. Take ${pet?.name} to the vet IMMEDIATELY. Time is critical.`, true);
      }
      else if (choice === "Something else") {
        addMessage(`Call your vet or poison control immediately. Bring the packaging or a sample of what ${pet?.name} ate with you.`, true);
      }
      else if (choice === "Injury / Limping") {
        addMessage(`Can ${pet?.name} put any weight on the injured leg?`, true, [
          "Yes, limping but using it",
          "No, won't touch the ground",
          "There's bleeding"
        ]);
      }
      else if (choice === "No, won't touch the ground") {
        addMessage(`⚠️ Keep ${pet?.name} calm and restrict movement. Call your vet today for an appointment.`, true);
      }
      else if (choice === "There's bleeding") {
        addMessage(`Apply direct pressure with a clean cloth. If bleeding doesn't stop in 5-10 minutes, go to emergency vet.`, true);
      }
      else if (choice === "Unusually tired") {
        addMessage(`Is ${pet?.name} eating and drinking normally?`, true, [
          "Yes, eating and drinking",
          "Not eating much",
          "Not eating or drinking at all"
        ]);
      }
      else if (choice === "Not eating or drinking at all") {
        addMessage(`⚠️ Call your vet today. Lethargy combined with not eating can indicate an underlying issue.`, true);
      }
      else if (choice === "Normal but noisy") {
        addMessage(`Monitor for now. Snorting or honking sounds may indicate reverse sneezing. If breathing becomes labored, seek care.`, true);
      }
      else {
        addMessage(`Thank you for using VuraPet Emergency AI. Remember: When in doubt, always consult a veterinarian. Wishing ${pet?.name} a speedy recovery! 🐾`, true);
      }
      
      // Add final help option
      setTimeout(() => {
        addMessage(`Need more help? You can also generate a Vet Handover Profile below to take with you to the clinic.`, true);
      }, 500);
    }, 2000);
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
      <div className="bg-gradient-to-r from-red-600 to-orange-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚨</span>
          <div>
            <h2 className="font-bold">VuraPet Emergency AI</h2>
            <p className="text-sm opacity-90">AI-powered emergency triage</p>
          </div>
        </div>
      </div>

      <div className="p-4 h-[450px] overflow-y-auto flex flex-col gap-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isAI ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] p-3 rounded-xl ${msg.isAI ? 'bg-gray-800 text-white' : 'bg-emerald-600 text-white'}`}>
              <div className="text-sm">{msg.text}</div>
              {msg.options && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {msg.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleUserChoice(opt)}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm transition"
                    >
                      {opt}
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
      </div>

      {/* Vet Handover Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => {
            alert(`📋 EMERGENCY HANDOVER PROFILE for ${pet?.name}\n\n• Name: ${pet?.name}\n• Breed: ${pet?.breed}\n• Weight: ${pet?.weight} kg\n• Age: ${pet?.age} years\n• Microchip: ${pet?.microchip || 'Not registered'}\n\nShow this to the vet for faster treatment.`);
          }}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-lg font-bold transition"
        >
          📋 Generate Vet Handover Profile
        </button>
      </div>

      <div className="bg-gray-900 p-3 text-center text-xs text-gray-500 border-t border-gray-800">
        ⚠️ AI Assistant is for guidance only. Always consult a veterinarian for medical emergencies.
      </div>
    </div>
  );
}