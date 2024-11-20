import { useState } from 'react';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ query, location });
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 py-4">
      <div className="max-w-5xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Job title, keywords, or company"
            />
          </div>
          
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPinIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="City, state, zip or 'remote'"
            />
          </div>
          
          <button
            type="submit"
            className="bg-[#2557a7] text-white px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-[#1c4587] transition-colors"
          >
            Find Contracts
          </button>
        </form>
        
        <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
          <span className="font-medium">Popular searches:</span>
          <div className="flex space-x-3">
            {['IT Services', 'Construction', 'Professional Services'].map((term) => (
              <button 
                key={term}
                onClick={() => {
                  setQuery(term);
                  onSearch({ query: term, location });
                }}
                className="text-[#2557a7] hover:underline"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
