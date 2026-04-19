'use client';

import { useState } from 'react';

const brandsByBudget = {
  budget: ['Bobtail', 'Husky', 'Classic'],
  mid: ['Montego', 'Jock', 'Canine Cuisine', 'Vondis'],
  premium: ['Acana', 'Orijen', 'Royal Canin', 'Hill\'s Science Diet']
};

const breedNotes = {
  'Labrador': 'Large breed - needs glucosamine for joints',
  'Boerboel': 'Giant breed - watch calcium levels to prevent hip dysplasia',
  'Rottweiler': 'Powerful breed - needs strong protein for muscle maintenance',
  'German Shepherd': 'Active breed - prone to digestive issues, choose sensitive formulas',
  'Bulldog': 'Brachycephalic - needs sensitive stomach formula',
  'Chihuahua': 'Small breed - needs small kibble, high metabolism',
  'Maltese': 'Small breed - prone to tear staining, needs Omega-3',
  'Persian': 'Long hair - needs Omega-3 for coat health',
  'Siamese': 'Active cat - needs high protein',
  'Domestic Shorthair': 'Average needs - good quality mid-range food'
};

export default function NutritionArchitect() {
  const [step, setStep] = useState(1);
  const [petType, setPetType] = useState<'dog' | 'cat'>('dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState('');
  const [healthIssues, setHealthIssues] = useState('');
  const [budget, setBudget] = useState('mid');
  const [treats, setTreats] = useState('');
  const [results, setResults] = useState<any>(null);

  const calculateDailyCalories = () => {
    const kg = parseFloat(weight) || 0;
    const factor = activity === 'high' ? 1.8 : activity === 'low' ? 1.2 : 1.6;
    return Math.round(kg * 30 * factor * (petType === 'dog' ? 1 : 1.2));
  };

  const generatePlan = () => {
    const calories = calculateDailyCalories();
    const grams = Math.round(calories / 4); // Average kibble ~400 kcal/100g
    const meals = Math.floor(grams / 2); // 2 meals per day
    const recommendedBrands = brandsByBudget[budget as keyof typeof brandsByBudget];
    const note = breedNotes[breed as keyof typeof breedNotes] || '';

    const plan = {
      dailyCalories: calories,
      dailyGrams: grams,
      mealsPerDay: 2,
      gramsPerMeal: Math.round(grams / 2),
      brands: recommendedBrands,
      note
    };

    setResults(plan);
    setStep(99); // Final result step
  };

  const questions = [
    { num: 1, question: "What type of pet?", options: ['dog', 'cat'], state: petType, setter: setPetType },
    { num: 2, question: "Breed? (type most common)", state: breed, setter: setBreed, placeholder: 'Labrador, Boerboel, Persian...' },
    { num: 3, question: "Age in years?", state: age, setter: setAge, placeholder: '3' },
    { num: 4, question: "Weight in kg?", state: weight, setter: setWeight, placeholder: '25' },
    { num: 5, question: "Activity level?", options: ['low (couch potato)', 'medium', 'high (working dog)'], state: activity, setter: setActivity },
    { num: 6, question: "Health issues?", state: healthIssues, setter: setHealthIssues, placeholder: 'Diabetes, allergies, none...' },
    { num: 7, question: "Budget per month for food?", options: ['R200-500 (budget)', 'R500-1000 (mid)', 'R1000+ (premium)'], state: budget, setter: setBudget },
    { num: 8, question: "Daily treats? (g)", state: treats, setter: setTreats, placeholder: '20' }
  ];

  const nextStep = () => {
    if (step < 8) {
      setStep(step + 1);
    } else {
      generatePlan();
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-4">
            🥣 Nutrition Architect
          </h1>
          <p className="text-xl text-gray-600">Your pet's custom meal plan in 60 seconds</p>
        </div>

        {step < 99 ? (
          <div className="space-y-6">
            {/* Progress */}
            <div className="flex bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all" 
                   style={{ width: `${(step / 8) * 100}%` }} />
            </div>

            {/* Current Question */}
            <div>
              <div className="text-center mb-6">
                <span className="text-4xl font-bold text-orange-500">{step}/8</span>
                <h2 className="text-2xl font-bold mt-2 mb-4">{questions[step - 1].question}</h2>
              </div>

              {questions[step - 1].options ? (
                <div className="grid md:grid-cols-3 gap-3">
                  {questions[step - 1].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => questions[step - 1].setter!(option)}
                      className={`p-6 rounded-xl border-4 font-bold text-lg transition-all ${
                        questions[step - 1].state === option
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                          : 'bg-gray-50 border-gray-300 hover:border-orange-300 hover:shadow-md'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  placeholder={questions[step - 1].placeholder}
                  className="w-full p-6 border-2 border-gray-300 rounded-xl text-xl font-bold text-black text-center focus:border-orange-500 focus:outline-none"
                  value={questions[step - 1].state as string}
                  onChange={(e) => questions[step - 1].setter!(e.target.value)}
                />
              )}
            </div>

            {/* Navigation */}
            <div className="flex gap-4 pt-6">
              {step > 1 && (
                <button
                  onClick={prevStep}
                  className="flex-1 p-4 font-bold text-gray-500 border-2 border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  ← Back
                </button>
              )}
              <button
                onClick={nextStep}
                className={`flex-1 p-4 font-bold text-xl rounded-xl shadow-lg transition-all ${
                  step === 8
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-2xl'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                {step === 8 ? 'Generate My Plan!' : 'Next →'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8">🥗 Your Custom Meal Plan</h2>
            
            <div className="bg-gradient-to-r from-green-400 to-blue-500 p-8 rounded-2xl text-white mb-8 shadow-2xl">
              <h3 className="text-4xl font-bold mb-4">🐕 {breed} ({petType})</h3>
              <p className="text-xl mb-2">Age: {age} yrs | Weight: {weight}kg</p>
              {results?.note && <p className="text-lg mb-6 italic">💡 {results.note}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-orange-50 p-6 rounded-xl">
                <h4 className="text-2xl font-bold text-orange-700 mb-4">📊 Daily Needs</h4>
                <div className="space-y-3 text-lg">
                  <div><span className="font-bold">Calories:</span> {results?.dailyCalories} kcal</div>
                  <div><span className="font-bold">Total Food:</span> {results?.dailyGrams}g</div>
                  <div><span className="font-bold">Meals:</span> {results?.mealsPerDay} × {results?.gramsPerMeal}g</div>
                  {parseInt(treats) > 0 && (
                    <div><span className="font-bold">Treats:</span> {treats}g (reduce main meals by 10%)</div>
                  )}
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-xl">
                <h4 className="text-2xl font-bold text-green-700 mb-4">🥬 Recommended Brands ({budget})</h4>
                <ul className="space-y-2">
                  {results?.brands.map((brand: string, idx: number) => (
                    <li key={idx} className="bg-white p-3 rounded-lg shadow-sm">
                      {brand}
                      <span className="ml-2 text-sm text-gray-500">(Checkers, Pick n Pay)</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl mb-8">
              <h4 className="text-xl font-bold text-blue-800 mb-4">💡 Tips for {breed}</h4>
              <ul className="space-y-2 text-sm">
                <li>• Feed at the same times daily</li>
                <li>• Fresh water always available</li>
                {healthIssues && <li>• Special needs: {healthIssues}</li>}
                <li>• Treats should be &lt;10% of daily calories</li>
                <li>• Weigh monthly and adjust portions</li>
              </ul>
            </div>

            <button
              onClick={() => { setStep(1); setResults(null); }}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 px-8 rounded-xl text-xl hover:shadow-2xl transition-all"
            >
              🔄 Generate New Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}