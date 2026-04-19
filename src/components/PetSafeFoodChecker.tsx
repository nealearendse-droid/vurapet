'use client';

import { useState } from 'react';

const foodDatabase = [
  // 🟢 SAFE FOODS
  { name: 'Chicken', safe: true, info: '✅ Safe! Cooked boneless chicken is excellent.' },
  { name: 'Beef', safe: true, info: '✅ Safe! Lean beef in moderation.' },
  { name: 'Rice', safe: true, info: '✅ Safe! Plain white rice helps with upset stomachs.' },
  { name: 'Pasta', safe: true, info: '✅ Safe! Plain cooked pasta is okay in small amounts.' },
  { name: 'Eggs', safe: true, info: '✅ Safe! Cooked eggs are great protein.' },
  { name: 'Carrots', safe: true, info: '✅ Safe! Raw or cooked carrots are healthy treats.' },
  { name: 'Banana', safe: true, info: '✅ Safe! Good for digestion in small amounts.' },
  { name: 'Apple', safe: true, info: '✅ Safe! Remove seeds before feeding.' },
  { name: 'Yogurt', safe: true, info: '✅ Safe! Plain, unsweetened yogurt helps digestion.' },
  { name: 'Salmon', safe: true, info: '✅ Safe! Cooked salmon provides Omega-3.' },
  { name: 'Sweet Potato', safe: true, info: '✅ Safe! Cooked sweet potato is very nutritious.' },
  { name: 'Pap (Maize)', safe: true, info: '✅ Safe! Plain pap (no seasoning) is okay occasionally.' },
  
  // 🔴 UNSAFE / TOXIC FOODS
  { name: 'Chocolate', safe: false, info: '❌ DANGEROUS! Can cause heart problems and seizures.' },
  { name: 'Grapes', safe: false, info: '❌ DANGEROUS! Can cause kidney failure. Avoid completely.' },
  { name: 'Raisins', safe: false, info: '❌ DANGEROUS! Even more toxic than grapes.' },
  { name: 'Onions', safe: false, info: '❌ DANGEROUS! Damages red blood cells. Includes powder.' },
  { name: 'Garlic', safe: false, info: '❌ DANGEROUS! More concentrated than onions. Very harmful.' },
  { name: 'Avocado', safe: false, info: '❌ NOT RECOMMENDED! Contains persin toxin for dogs/cats.' },
  { name: 'Macadamia Nuts', safe: false, info: '❌ DANGEROUS! Causes weakness, vomiting, tremors.' },
  { name: 'Xylitol', safe: false, info: '❌ EXTREMELY DANGEROUS! Found in sugar-free gum/candy.' },
  { name: 'Alcohol', safe: false, info: '❌ EXTREMELY DANGEROUS! Never give alcohol to pets.' },
  { name: 'Coffee', safe: false, info: '❌ DANGEROUS! Caffeine can be fatal for pets.' },
  { name: 'Bones (Cooked)', safe: false, info: '❌ DANGEROUS! Splinter easily. Use raw bones only with vet approval.' },
  { name: 'Fish Bones', safe: false, info: '❌ DANGEROUS! Remove all bones before feeding fish.' },
  { name: 'Biltong', safe: false, info: '⚠️ AVOID! Too salty and spicy for regular feeding.' },
  { name: 'Boerewors', safe: false, info: '⚠️ AVOID! Too much salt and spices for pets.' },
  { name: 'Dog Biscuits', safe: true, info: '✅ Safe! But watch portion sizes.' },
  { name: 'Cat Food', safe: true, info: '⚠️ Note: Cat food has too much protein for dogs long-term.' },
];

export default function PetSafeFoodChecker() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'dog' | 'cat' | 'both'>('both');
  const [results, setResults] = useState<typeof foodDatabase>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    const filtered = foodDatabase.filter(food => 
      food.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setResults(filtered);
    setHasSearched(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-center mb-2">🍖 Food Safety Checker</h1>
      <p className="text-gray-600 text-center mb-6">
        Find out if it&apos;s safe to feed your pet!
      </p>

      {/* Search Box */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <input
          type="text"
          placeholder="Search food (e.g., chicken, chocolate, grapes)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full p-4 border-2 border-orange-300 rounded-lg mb-4 text-black"
        />
        
        {/* Pet Type Selector */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedType('dog')}
            className={`px-4 py-2 rounded-lg ${
              selectedType === 'dog' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            🐕 Dog
          </button>
          <button
            onClick={() => setSelectedType('cat')}
            className={`px-4 py-2 rounded-lg ${
              selectedType === 'cat' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            🐈 Cat
          </button>
          <button
            onClick={() => setSelectedType('both')}
            className={`px-4 py-2 rounded-lg ${
              selectedType === 'both' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            🐾 Both
          </button>
        </div>

        <button
          onClick={handleSearch}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition"
        >
          🔍 Check Food Safety
        </button>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-3">
          {results.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              ⚠️ No information found for &apos;{searchTerm}&apos;. When in doubt, consult your vet!
            </div>
          ) : (
            results.map((food, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  food.safe 
                    ? 'bg-green-50 border-green-300' 
                    : 'bg-red-50 border-red-300'
                }`}
              >
                <h3 className={`font-bold text-lg ${food.safe ? 'text-green-700' : 'text-red-700'}`}>
                  {food.name}
                </h3>
                <p className="text-gray-700 mt-1">{food.info}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Popular Searches */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-800 mb-2">Common Questions:</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {['Chocolate', 'Grapes', 'Onions', 'Banana', 'Apples', 'Rice'].map(fod => (
            <button
              key={fod}
              onClick={() => {
                setSearchTerm(fod);
                setTimeout(() => handleSearch(), 0);
              }}
              className="text-left p-2 hover:bg-blue-100 rounded"
            >
              {fod}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}