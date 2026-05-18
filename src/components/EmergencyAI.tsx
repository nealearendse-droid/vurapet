'use client';
import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function EmergencyAI({ petId }: { petId: string }) {
  const [pet, setPet] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showHandover, setShowHandover] = useState(false);

  useEffect(() => {
    async function loadPet() {
      const supabase = getSupabaseClient();
      const { data } = await supabase.from('pets').select('*').eq('id', petId).single();
      setPet(data);
      setLoading(false);
      
      setTimeout(() => {
        setMessages([{
          id: 1,
          text: `I'm analyzing ${data?.name || 'your pet'}'s health records...`,
          isAI: true
        }]);
        
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: 2,
            text: `What symptoms are you concerned about?`,
            isAI: true,
            options: ["Vomiting", "Diarrhea", "Breathing trouble", "Injury", "Ate something toxic"]
          }]);
        }, 2000);
      }, 1000);
    }
    loadPet();
  }, [petId]);

  const handleOption = (choice: string) => {
    setMessages(prev => [...prev, { id: Date.now(), text: choice, isAI: false }]);
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      
      let response = "";
      
      if (choice === "Vomiting") {
        response = `How many times has ${pet?.name || 'your pet'} vomited?`;
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: response,
          isAI: true,
          options: ["Just once", "2-3 times", "Multiple times", "Can't keep water down"]
        }]);
      }
      else if (choice === "Just once") {
        response = `Monitor at home. Withhold food for 6 hours, then offer bland diet like boiled chicken and rice. If vomiting continues, call your vet.`;
        setMessages(prev => [...prev, { id: Date.now(), text: response, isAI: true }]);
      }
      else if (choice === "2-3 times" || choice === "Multiple times") {
        response = `Call your vet today. Multiple vomiting episodes can lead to dehydration. Make sure water is available.`;
        setMessages(prev => [...prev, { id: Date.now(), text: response, isAI: true }]);
      }
      else if (choice === "Can't keep water down") {
        response = `🚨 EMERGENCY - ${pet?.name || 'Your pet'} needs immediate veterinary care. Dehydration can happen quickly. Go to the nearest emergency vet now.`;
        setMessages(prev => [...prev, { id: Date.now(), text: response, isAI: true }]);
      }
      else if (choice === "Breathing trouble") {
        response = `Describe ${pet?.name}'s breathing:`;
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: response,
          isAI: true,
          options: ["Normal but noisy", "Faster than usual", "Struggling to breathe", "Gums look blue"]
        }]);
      }
      else if (choice === "Struggling to breathe" || choice === "Gums look blue") {
        response = `🚨 CRITICAL EMERGENCY - Go to the nearest emergency vet IMMEDIATELY. Call ahead to let them know you're coming.`;
        setMessages(prev => [...prev, { id: Date.now(), text: response, isAI: true }]);
      }
      else if (choice === "Ate something toxic") {
        response = `What did ${pet?.name} eat?`;
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: response,
          isAI: true,
          options: ["Chocolate", "Grapes/Raisins", "Medication", "Rat poison", "Something else"]
        }]);
      }
      else if (choice === "Chocolate") {
        response = `For a ${pet?.weight || '?'}kg ${pet?.breed || 'pet'}, how much chocolate?`;
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: response,
          isAI: true,
          options: ["Small bite", "Few pieces", "Whole bar"]
        }]);
      }
      else if (choice === "Small bite") {
        response = `Monitor for vomiting or hyperactivity. Call your vet if you notice any symptoms.`;
        setMessages(prev => [...prev, { id: Date.now(), text: response, isAI: true }]);
      }
      else if (choice === "Few pieces" || choice === "Whole bar") {
        response = `Call your vet immediately. Have ${pet?.name}'s weight (${pet?.weight}kg) ready when you call.`;
        setMessages(prev => [...prev, { id: Date.now(), text: response, isAI: true }]);
      }
      else if (choice === "Grapes/Raisins") {
        response = `🚨 EMERGENCY - Grapes and raisins can cause kidney failure. Take ${pet?.name} to the vet immediately.`;
        setMessages(prev => [...prev, { id: Date.now(), text: response, isAI: true }]);
      }
      else if (choice === "Injury") {
        response = `Can ${pet?.name} put weight on the injured area?`;
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: response,
          isAI: true,
          options: ["Yes, limping", "No, won't touch it", "There's bleeding"]
        }]);
      }
      else if (choice === "No, won't touch it") {
        response = `Keep ${pet?.name} calm and restrict movement. Call your vet for an appointment today.`;
        setMessages(prev => [...prev, { id: Date.now(), text: response, isAI: true }]);
      }
      else if (choice === "There's bleeding") {
        response = `Apply direct pressure with a clean cloth. If bleeding doesn't stop in 10 minutes, go to the emergency vet.`;
        setMessages(prev => [...prev, { id: Date.now(), text: response, isAI: true }]);
      }
      else if (choice === "Diarrhea") {
        response = `How many episodes of diarrhea has ${pet?.name} had?`;
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: response,
          isAI: true,
          options: ["Just once", "2-3 times", "Multiple times", "With blood"]
        }]);
      }
      else if (choice === "With blood") {
        response = `🚨 Blood in diarrhea is concerning. Contact your vet today or go to emergency clinic if severe.`;
        setMessages(prev => [...prev, { id: Date.now(), text: response, isAI: true }]);
      }
      else {
        response = `Thank you for using VuraPet Emergency Assistant. When in doubt, always consult a veterinarian. Wishing ${pet?.name || 'your pet'} a speedy recovery!`;
      }
    }, 1500);
  };

  if (loading) {
    return (
      <div className="bg-[#1a1a2e] rounded-xl p-6 text-center">
        <p className="text-gray-400">Loading emergency assistant...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a2e] rounded-xl overflow-hidden border border-gray-800">
      <div className="bg-gradient-to-r from-red-600 to-orange-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚨</span>
          <div>
            <h2 className="font-bold">VuraPet Emergency Assistant</h2>
            <p className="text-sm">24/7 Emergency Triage Assistant</p>
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
                      onClick={() => handleOption(opt)}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm"
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
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => setShowHandover(true)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-lg font-bold"
        >
          📋 Generate Vet Handover Profile
        </button>
      </div>

            {showHandover && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div id="handover-print" style={{ background: '#1a1a2e', maxWidth: 500, width: '100%', borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ background: '#c47a3a', padding: '15px 20px', color: 'white' }}>
              <h3 style={{ margin: 0 }}>🚑 Emergency Handover Profile</h3>
            </div>
            <div style={{ padding: 20, maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ color: '#c47a3a', marginBottom: 10 }}>🐾 Patient Information</h4>
                <p><strong>Name:</strong> {pet?.name || 'Not added'}</p>
                <p><strong>Breed:</strong> {pet?.breed || 'Not added'}</p>
                <p><strong>Species:</strong> {pet?.species || 'Not added'}</p>
                <p><strong>Age:</strong> {pet?.age || '?'} years</p>
                <p><strong>Weight:</strong> {pet?.weight || '?'} kg</p>
                <p><strong>Colour:</strong> {pet?.colour || 'Not added'}</p>
              </div>
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ color: '#c47a3a', marginBottom: 10 }}>🆔 Identification</h4>
                <p><strong>Microchip:</strong> {pet?.microchip || 'Not registered'}</p>
              </div>
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ color: '#c47a3a', marginBottom: 10 }}>📞 Emergency Contacts</h4>
                <p><strong>Owner:</strong> {pet?.owner_name || 'Not added'}</p>
                <p><strong>Owner Phone:</strong> {pet?.owner_phone || 'Not added'}</p>
                <p><strong>Vet Clinic:</strong> {pet?.vet_clinic || 'Not added'}</p>
                <p><strong>Vet Phone:</strong> {pet?.vet_phone || 'Not added'}</p>
              </div>
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ color: '#c47a3a', marginBottom: 10 }}>📋 Current Symptoms</h4>
                <p>{messages.filter(m => !m.isAI).slice(-3).map(m => m.text).join(', ') || 'No symptoms recorded'}</p>
              </div>
            </div>
            <div style={{ padding: 15, borderTop: '1px solid #333', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={() => {
                const message = `🚑 EMERGENCY HANDOVER PROFILE for ${pet?.name}\n\nName: ${pet?.name}\nBreed: ${pet?.breed}\nWeight: ${pet?.weight}kg\nMicrochip: ${pet?.microchip || 'Not registered'}\nVet: ${pet?.vet_clinic || 'Not added'}\nVet Phone: ${pet?.vet_phone || 'Not added'}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
              }} style={{ flex: 1, background: '#25D366', color: 'white', padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer' }}>📱 WhatsApp</button>
              <button onClick={() => window.print()} style={{ flex: 1, background: '#333', color: 'white', padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer' }}>🖨️ Print</button>
              <button onClick={() => setShowHandover(false)} style={{ flex: 1, background: '#c47a3a', color: 'white', padding: '10px', borderRadius: 10, border: 'none', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-gray-900 p-3 text-center text-xs text-gray-500">
        ⚠️ For guidance only. Always consult a veterinarian for medical emergencies.
      </div>
    </div>
  );
}