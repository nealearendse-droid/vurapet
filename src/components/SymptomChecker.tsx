return (
  <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
    <div className="text-center mb-6">
      <h1 className="text-3xl font-bold text-orange-600 mb-2">🍖 Pet Food Safety Checker</h1>
      <p className="text-gray-700">Can your pet eat that? Search any food to find out instantly!</p>
      <p className="text-sm text-gray-500 mt-1">🇿🇦 Includes South African foods &amp; brands</p>
    </div>

    {/* Search - FIXED VISIBILITY */}
    <div className="mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type any food (e.g. biltong, chocolate, rice...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 p-3 border-2 border-orange-300 rounded-lg text-black bg-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
        />
        <button
          onClick={() => handleSearch()}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 rounded-lg transition"
        >
          Search
        </button>
      </div>

      {/* Pet Type Buttons - FIXED VISIBILITY */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setSelectedType('dog')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
            selectedType === 'dog' 
              ? 'bg-orange-600 text-white' 
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          🐕 Dog
        </button>
        <button
          onClick={() => setSelectedType('cat')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
            selectedType === 'cat' 
              ? 'bg-orange-600 text-white' 
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          🐈 Cat
        </button>
        <button
          onClick={() => setSelectedType('both')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
            selectedType === 'both' 
              ? 'bg-orange-600 text-white' 
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          🐾 Both
        </button>
      </div>
    </div>

    {/* Quick Search Buttons - FIXED VISIBILITY */}
    <div className="bg-gray-50 rounded-xl p-4 mb-6">
      <h3 className="font-bold text-gray-800 mb-3">🔥 Most Searched:</h3>
      <div className="flex flex-wrap gap-2">
        {['Chocolate', 'Grapes', 'Chicken', 'Rice', 'Bones', 'Peanut Butter', 'Banana', 'Avocado', 'Biltong', 'Boerewors', 'Pap', 'Eggs'].map(food => (
          <button
            key={food}
            onClick={() => {
              setSearchTerm(food);
              setTimeout(() => handleSearch(food), 10);
            }}
            className="px-3 py-2 bg-gray-200 hover:bg-orange-200 text-gray-800 rounded-lg text-sm transition"
          >
            {food}
          </button>
        ))}
      </div>
    </div>

    {/* SA Foods - FIXED VISIBILITY */}
    <div className="bg-green-50 rounded-xl p-4 mb-6">
      <h3 className="font-bold text-green-800 mb-3">🇿🇦 South African Foods:</h3>
      <div className="flex flex-wrap gap-2">
        {['Biltong', 'Droewors', 'Boerewors', 'Pap', 'Vetkoek', 'Chakalaka', 'Bunny Chow', 'Bobotie', 'Braai Meat', 'Rusks', 'Mielies', 'Samp', 'Gatsby', 'Koeksisters', 'Melktert', 'Rooibos'].map(food => (
          <button
            key={food}
            onClick={() => {
              setSearchTerm(food);
              setTimeout(() => handleSearch(food), 10);
            }}
            className="px-3 py-2 bg-green-200 hover:bg-green-300 text-green-900 rounded-lg text-sm transition"
          >
            {food}
          </button>
        ))}
      </div>
    </div>

    {/* SA Brands - FIXED VISIBILITY */}
    <div className="bg-blue-50 rounded-xl p-4 mb-6">
      <h3 className="font-bold text-blue-800 mb-3">🛒 SA Pet Food Brands:</h3>
      <div className="flex flex-wrap gap-2">
        {['Montego', 'Bobtail', 'Husky', 'Jock', 'Canine Cuisine'].map(food => (
          <button
            key={food}
            onClick={() => {
              setSearchTerm(food);
              setTimeout(() => handleSearch(food), 10);
            }}
            className="px-3 py-2 bg-blue-200 hover:bg-blue-300 text-blue-900 rounded-lg text-sm transition"
          >
            {food}
          </button>
        ))}
      </div>
    </div>

    {/* Results Section - FIXED VISIBILITY */}
    {hasSearched && (
      <div className="space-y-4 mb-8">
        {results.length === 0 ? (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
            <p className="text-xl text-gray-800 mb-2">🤔 Not found</p>
            <p className="text-gray-700">We don't have information for "{searchTerm}" yet.</p>
            <p className="text-gray-500 text-sm mt-2">When in doubt, always consult your vet before feeding your pet something new!</p>
          </div>
        ) : (
          results.map((food, index) => (
            <div key={index} className={`p-5 rounded-xl border-2 shadow-sm ${getStatusColor(food.safe)}`}>
              <div className="flex justify-between items-center mb-2">
                <h3 className={`font-bold text-xl ${getStatusText(food.safe)}`}>{food.name}</h3>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                  food.safe === 'yes' ? 'bg-green-200 text-green-800' :
                  food.safe === 'no' ? 'bg-red-200 text-red-800' :
                  'bg-yellow-200 text-yellow-800'
                }`}>{getStatusBadge(food.safe)}</span>
              </div>
              <div className="flex gap-4 mb-3 text-sm">
                {(selectedType === 'dog' || selectedType === 'both') && <span className="text-gray-700">🐕 {food.dog}</span>}
                {(selectedType === 'cat' || selectedType === 'both') && <span className="text-gray-700">🐈 {food.cat}</span>}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{food.details}</p>
            </div>
          ))
        )}
      </div>
    )}

    {/* Emergency Banner - FIXED VISIBILITY */}
    <div className="bg-red-600 text-white rounded-xl p-6 text-center">
      <h3 className="font-bold text-lg mb-2">🚨 Pet Ate Something Toxic?</h3>
      <p className="mb-3 text-white">Contact your vet IMMEDIATELY or call the emergency line</p>
      <p className="text-2xl font-bold text-white">📞 Your Vet's Number</p>
      <p className="text-sm mt-2 text-red-100">Time is critical — do not wait for symptoms to appear</p>
    </div>
  </div>
);