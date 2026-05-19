'use client';

import { useState } from 'react';

type Message = {
  id: number;
  text: string;
  isAI: boolean;
  options?: string[];
};

export default function SymptomChecker({ petId, petName, petSpecies }: { petId: string; petName: string; petSpecies: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: `Hi! I'm your VuraPet symptom checker. What's worrying you about ${petName}?`, isAI: true, options: ["Vomiting", "Diarrhea", "Breathing trouble", "Injury", "Ate something toxic", "Lethargic", "Not eating", "Other"] }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleOption = (choice: string) => {
    setMessages(prev => [...prev, { id: Date.now(), text: choice, isAI: false }]);
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      let response = "";
      
      if (choice === "Vomiting") {
        response = `How many times has ${petName} vomited?`;
        setMessages(prev => [...prev, { id: Date.now(), text: response, isAI: true, options: ["Just once", "2-3 times", "Multiple times", "Can't keep water down"] }]);
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
        response = `🚨 EMERGENCY - ${petName} needs immediate veterinary care. Dehydration can happen quickly. Go to the nearest emergency vet now.`;
        setMessages(prev => [...prev, { id: Date.now(), text: response, isAI: true }]);
      }
      else if (choice === "Breathing trouble") {
        response = `Describe ${petName}'s breathing:`;
        setMessages(prev => [...prev, { id: Date.now(), text: response, isAI: true, options: ["Normal but noisy", "Faster than usual", "Struggling to breathe", "Gums look blue"] }]);
      }
      else if (choice === "Struggling to breathe" || choice === "Gums look blue") {
        response = `🚨 CRITICAL EMERGENCY - Go to the nearest emergency vet IMMEDIATELY. Call ahead to let them know you're coming.`;
        setMessages(prev => [...prev, { id: Date.now(), text: response, isAI: true }]);
      }
      else if (choice === "Ate something toxic") {
        response = `What did ${petName} eat?`;
        setMessages(prev => [...prev, { id: Date.now(), text: response, isAI: true, options: ["Chocolate", "Grapes/Raisins", "Medication", "Rat poison", "Something else"] }]);
      }
      else if (choice === "Chocolate") {
        response = `Call your vet immediately. Have ${petName}'s weight ready when you call.`;
        setMessages(prev => [...prev, { id: Date.now(), text: response, isAI: true }]);
      }
      else if (choice === "Grapes/Raisins") {
        response = `🚨 EMERGENCY - Grapes and raisins can cause kidney failure. Take ${petName} to the vet immediately.`;
        setMessages(prev => [...prev, { id: Date.now(), text: response, isAI: true }]);
      }
      else if (choice === "Injury") {
        response = `Can ${petName} put weight on the injured area?`;
        setMessages(prev => [...prev, { id: Date.now(), text: response, isAI: true, options: ["Yes, limping", "No, won't touch it", "There's bleeding"] }]);
      }
      else if (choice === "No, won't touch it") {
        response = `Keep ${petName} calm and restrict movement. Call your vet for an appointment today.`;
        setMessages(prev => [...prev, { id: Date.now(), text: response, isAI: true }]);
      }
      else if (choice === "There's bleeding") {
        response = `Apply direct pressure with a clean cloth. If bleeding doesn't stop in 10 minutes, go to the emergency vet.`;
        setMessages(prev => [...prev, { id: Date.now(), text: response, isAI: true }]);
      }
      else if (choice === "Diarrhea") {
        response = `How many episodes of diarrhea has ${petName} had?`;
        setMessages(prev => [...prev, { id: Date.now(), text: response, isAI: true, options: ["Just once", "2-3 times", "Multiple times", "With blood"] }]);
      }
      else if (choice === "With blood") {
        response = `🚨 Blood in diarrhea is concerning. Contact your vet today or go to emergency clinic if severe.`;
        setMessages(prev => [...prev, { id: Date.now(), text: response, isAI: true }]);
      }
      else if (choice === "Not eating") {
        response = `How long has ${petName} not been eating?`;
        setMessages(prev => [...prev, { id: Date.now(), text: response, isAI: true, options: ["Missed one meal", "Missed 2-3 meals", "Won't eat for 24+ hours"] }]);
      }
      else if (choice === "Lethargic") {
        response = `Is ${petName} still responsive and aware of surroundings?`;
        setMessages(prev => [...prev, { id: Date.now(), text: response, isAI: true, options: ["Yes, just tired", "No, seems confused/disoriented", "Won't wake up"] }]);
      }
      else if (choice === "Won't wake up") {
        response = `🚨 CRITICAL EMERGENCY - Get ${petName} to the nearest emergency vet immediately. This is a medical emergency.`;
        setMessages(prev => [...prev, { id: Date.now(), text: response, isAI: true }]);
      }
      else {
        response = `Thank you for using VuraPet Symptom Checker. When in doubt, always consult a veterinarian. Wishing ${petName} a speedy recovery!`;
        setMessages(prev => [...prev, { id: Date.now(), text: response, isAI: true }]);
      }
    }, 1000);
  };

  return (
    <div className="bg-[#1a1a2e] rounded-xl overflow-hidden border border-gray-800">
      <div className="bg-gradient-to-r from-red-600 to-orange-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🩺</span>
          <div>
            <h2 className="font-bold">VuraPet Symptom Checker</h2>
            <p className="text-sm opacity-80">Should you call the vet?</p>
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

      <div className="bg-gray-900 p-3 text-center text-xs text-gray-500">
        ⚠️ For guidance only. Always consult a veterinarian for medical emergencies.
      </div>
    </div>
  );
}