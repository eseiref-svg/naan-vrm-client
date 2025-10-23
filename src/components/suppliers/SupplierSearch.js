import React from 'react';

// The component receives state and handler functions as props from its parent
function SupplierSearch({ query, setQuery, criteria, setCriteria, onSearch }) {
  
  // Update placeholder text based on selected criteria
  const getPlaceholder = () => {
    if (criteria === 'name') {
      return 'הקלד שם ספק...';
    }
    if (criteria === 'tag') {
      return 'הקלד תג... (למשל: food, travel)';
    }
    return 'הקלד ערך לחיפוש...';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mx-auto max-w-4xl">
      <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b">חיפוש ספקים</h3>
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        {/* Dropdown for selecting search criteria */}
        <select 
          value={criteria} 
          onChange={(e) => setCriteria(e.target.value)} 
          className="border border-gray-300 rounded-md p-2 h-full"
        >
          <option value="name">לפי שם</option>
          <option value="tag">לפי תג</option>
        </select>

        {/* Text input for the search query */}
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border border-gray-300 rounded-md p-2 w-full h-full flex-grow" 
          placeholder={getPlaceholder()}
          // Allows pressing Enter to trigger search
          onKeyDown={(e) => e.key === 'Enter' && onSearch()} 
        />

        {/* Search button */}
        <button 
          onClick={onSearch} 
          className="bg-blue-500 text-white hover:bg-blue-600 font-bold py-2 px-5 rounded-md whitespace-nowrap sm:w-auto w-full"
        >
          חיפוש
        </button>
      </div>
    </div>
  );
}

export default SupplierSearch;
