'use client';

import { useState } from 'react';

type FoodItem = {
  name: string;
  safe: 'yes' | 'no' | 'caution';
  dog: string;
  cat: string;
  details: string;
};

const foodDatabase: FoodItem[] = [
  { name: 'Chocolate', safe: 'no', dog: '❌ TOXIC', cat: '❌ TOXIC', details: '🚨 VERY DANGEROUS! Contains theobromine which pets cannot metabolize.' },
  { name: 'Grapes', safe: 'no', dog: '❌ TOXIC', cat: '❌ TOXIC', details: '🚨 EXTREMELY DANGEROUS! Even one grape can cause kidney failure.' },
  { name: 'Chicken', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Cooked, boneless chicken is excellent lean protein.' },
  { name: 'Rice', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Plain cooked white rice is great for upset stomachs.' },
  { name: 'Peanut Butter', safe: 'caution', dog: '⚠️ Check label!', cat: '⚠️ Check label!', details: 'Must have NO xylitol (artificial sweetener) which is extremely toxic.' },
  { name: 'Banana', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Bananas are safe in moderation. High in potassium.' },
  { name: 'Avocado', safe: 'no', dog: '❌ Avoid', cat: '❌ Avoid', details: 'Contains persin, which is toxic to dogs and cats.' },
  { name: 'Milk', safe: 'caution', dog: '⚠️ Most are intolerant', cat: '⚠️ Most are intolerant', details: 'Most adult pets are lactose intolerant. Can cause diarrhea.' },
  { name: 'Biltong', safe: 'no', dog: '❌ Avoid', cat: '❌ Avoid', details: 'Too salty and contains spices that irritate pet stomachs.' },
  { name: 'Boerewors', safe: 'no', dog: '❌ Avoid', cat: '❌ Avoid', details: 'Contains too much fat, salt, and spices. Often has onion/garlic.' },
  { name: 'Pap', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Plain pap without salt or butter is safe in small amounts.' },
  { name: 'Eggs', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Cooked eggs are great protein. Never feed raw.' },
  { name: 'Cheese', safe: 'caution', dog: '⚠️ Small amounts', cat: '⚠️ Small amounts', details: 'Small pieces of plain cheese are okay as treats.' },
  { name: 'Carrots', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Great low-calorie treat. Raw carrots clean teeth.' },
  { name: 'Apple', safe: 'yes', dog: '✅ Safe', cat: '✅ Safe', details: 'Remove seeds and core. Seeds contain cyanide.' },
  { name: 'Onions', safe: 'no', dog: '❌ TOXIC', cat: '❌ TOXIC', details: 'VERY DANGEROUS! Damages red blood cells causing anemia.' },
  { name: 'Garlic', safe: 'no', dog: '❌ TOXIC', cat: '❌ TOXIC', details: '5x more toxic than onions. All forms are dangerous.' },
];

export default function SafeFoodPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedType, setSelectedType] = useState<'dog' | 'cat' | 'both'>('both');

  const handleSearch = () => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return;
    
    const filtered = foodDatabase.filter(food =>
      food.name.toLowerCase().includes(query)
    );
    setResults(filtered);
    setHasSearched(true);
  };

  const popularFoods = ['Chocolate', 'Grapes', 'Chicken', 'Rice', 'Peanut Butter', 'Banana', 'Avocado', 'Milk', 'Biltong', 'Boerewors', 'Pap', 'Eggs'];
  const saFoods = ['Biltong', 'Boerewors', 'Pap', 'Vetkoek', 'Braai Meat', 'Rusks', 'Mielies'];
  const saBrands = ['Montego', 'Bobtail', 'Husky', 'Jock', 'Canine Cuisine'];

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-orange-600 mb-2">🍖 Pet Food Safety Checker</h1>
          <p className="text-gray-700">Can your pet eat that? Search any food to find out instantly!</p>
          <p className="text-sm text-gray-500 mt-1">🇿🇦 Includes South African foods &amp; brands</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Type any food (e.g. biltong, chocolate, rice...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 p-3 border-2 border-orange-300 rounded-lg text-black bg-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
            />
            <button
              onClick={handleSearch}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 rounded-lg transition"
            >
              Search
            </button>
          </div>

          {/* Pet Type Buttons - WITH TEXT COLOR */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedType('dog')}
              className={`flex-1 py-2 rounded-lg font-bold transition ${
                selectedType === 'dog' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
              }`}
            >
              🐕 Dog
            </button>
            <button
              onClick={() => setSelectedType('cat')}
              className={`flex-1 py-2 rounded-lg font-bold transition ${
                selectedType === 'cat' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
              }`}
            >
              🐈 Cat
            </button>
            <button
              onClick={() => setSelectedType('both')}
              className={`flex-1 py-2 rounded-lg font-bold transition ${
                selectedType === 'both' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
              }`}
            >
              🐾 Both
            </button>
          </div>
        </div>

        {/* Most Searched - WITH TEXT COLOR */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-gray-800 text-lg mb-3">Most Searched:</h3>
          <div className="flex flex-wrap gap-2">
            {popularFoods.map(food => (
              <button
                key={food}
                onClick={() => {
                  setSearchTerm(food);
                  setTimeout(() => handleSearch(), 10);
                }}
                className="px-3 py-2 bg-gray-200 hover:bg-orange-200 text-gray-800 rounded-lg text-sm font-medium transition"
              >
                {food}
              </button>
            ))}
          </div>
        </div>

        {/* SA Foods - WITH TEXT COLOR */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-green-700 text-lg mb-3">South African Foods:</h3>
          <div className="flex flex-wrap gap-2">
            {saFoods.map(food => (
              <button
                key={food}
                onClick={() => {
                  setSearchTerm(food);
                  setTimeout(() => handleSearch(), 10);
                }}
                className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-sm font-medium transition"
              >
                {food}
              </button>
            ))}
          </div>
        </div>

        {/* SA Brands - WITH TEXT COLOR */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="font-bold text-blue-700 text-lg mb-3">SA Pet Food Brands:</h3>
          <div className="flex flex-wrap gap-2">
            {saBrands.map(brand => (
              <button
                key={brand}
                onClick={() => {
                  setSearchTerm(brand);
                  setTimeout(() => handleSearch(), 10);
                }}
                className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-medium transition"
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {hasSearched && (
          <div className="space-y-4 mb-6">
            {results.length === 0 ? (
              <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-6 text-center">
                <p className="text-xl text-yellow-800 mb-2">Not found</p>
                <p className="text-yellow-700">We don't have information for "{searchTerm}" yet.</p>
                <p className="text-yellow-600 text-sm mt-2">When in doubt, consult your veterinarian!</p>
              </div>
            ) : (
              results.map((food, idx) => {
                let bgColor = '';
                let borderColor = '';
                let textColor = '';
                let badgeColor = '';
                if (food.safe === 'yes') {
                  bgColor = 'bg-green-100';
                  borderColor = 'border-green-400';
                  textColor = 'text-green-800';
                  badgeColor = 'bg-green-500 text-white';
                } else if (food.safe === 'no') {
                  bgColor = 'bg-red-100';
                  borderColor = 'border-red-400';
                  textColor = 'text-red-800';
                  badgeColor = 'bg-red-500 text-white';
                } else {
                  bgColor = 'bg-yellow-100';
                  borderColor = 'border-yellow-400';
                  textColor = 'text-yellow-800';
                  badgeColor = 'bg-yellow-500 text-white';
                }
                return (
                  <div key={idx} className={`p-5 rounded-xl border-2 ${bgColor} ${borderColor}`}>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className={`font-bold text-xl ${textColor}`}>{food.name}</h3>
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${badgeColor}`}>
                        {food.safe === 'yes' ? '✅ SAFE' : food.safe === 'no' ? '❌ DANGEROUS' : '⚠️ CAUTION'}
                      </span>
                    </div>
                    <div className="flex gap-4 mb-3 text-sm text-gray-700">
                      {(selectedType === 'dog' || selectedType === 'both') && <span>🐕 {food.dog}</span>}
                      {(selectedType === 'cat' || selectedType === 'both') && <span>🐈 {food.cat}</span>}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{food.details}</p>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Emergency Banner */}
        <div className="bg-red-600 rounded-xl p-6 text-center">
          <h3 className="font-bold text-lg text-white mb-2">🚨 Pet Ate Something Toxic?</h3>
          <p className="mb-3 text-white">Contact your vet IMMEDIATELY</p>
          <p className="text-2xl font-bold text-white">📞 Your Vet's Number</p>
          <p className="text-sm mt-2 text-red-100">Time is critical — do not wait for symptoms</p>
        </div>
      </div>
    </div>
  );
}