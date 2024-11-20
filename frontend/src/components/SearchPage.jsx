import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  MagnifyingGlassIcon, 
  BookmarkIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { searchOpportunities } from '../services/api';

export default function SearchPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 10
  });
  const { user, saveContract, unsaveContract, isContractSaved } = useAuth();

  useEffect(() => {
    fetchOpportunities();
  }, [pagination.page]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const result = await searchOpportunities({
        query: searchQuery,
        page: pagination.page,
        pageSize: pagination.pageSize
      });
      
      setOpportunities(result.opportunities);
      setPagination(prev => ({
        ...prev,
        total: result.total
      }));
    } catch (err) {
      setError(err.message || 'Failed to fetch opportunities');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    await fetchOpportunities();
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const toggleSave = (contract) => {
    if (isContractSaved(contract.id)) {
      unsaveContract(contract.id);
    } else {
      saveContract(contract);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-[80vh] bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Search Contracts</h1>
            <p className="mt-2 text-sm text-gray-700">
              Search through available government contract opportunities.
            </p>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mt-6">
          <div className="flex gap-x-4">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">
                Search contracts
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#2557a7] sm:text-sm sm:leading-6"
                  placeholder="Search by keyword, agency, or description"
                />
              </div>
            </div>
            <button
              type="submit"
              className="rounded-md bg-[#2557a7] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1c4587] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2557a7]"
            >
              Search
            </button>
          </div>
        </form>

        {/* Results */}
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2557a7] mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading opportunities...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600">{error}</p>
                </div>
              ) : opportunities.length > 0 ? (
                <>
                  <div className="bg-white p-4 border-b border-gray-200 text-sm text-gray-600 flex justify-between items-center rounded-t-lg">
                    <span>{pagination.total.toLocaleString()} contract opportunities</span>
                    <div className="flex items-center space-x-2">
                      <span>Page {pagination.page}</span>
                      <button 
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button 
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page * pagination.pageSize >= pagination.total}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5">
                    <div className="min-w-full divide-y divide-gray-300">
                      {opportunities.map((opportunity) => (
                        <div
                          key={opportunity.id}
                          className="bg-white px-4 py-5 sm:px-6 hover:bg-gray-50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">
                                  {opportunity.title}
                                </h3>
                                {user && (
                                  <button
                                    onClick={() => toggleSave(opportunity)}
                                    className="ml-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                                  >
                                    <span className="sr-only">
                                      {isContractSaved(opportunity.id) ? 'Remove from saved' : 'Save opportunity'}
                                    </span>
                                    {isContractSaved(opportunity.id) ? (
                                      <BookmarkSolidIcon className="h-6 w-6 text-[#2557a7]" aria-hidden="true" />
                                    ) : (
                                      <BookmarkIcon className="h-6 w-6" aria-hidden="true" />
                                    )}
                                  </button>
                                )}
                              </div>
                              <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                  <BuildingOfficeIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                  {opportunity.agency}
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                  <CurrencyDollarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                  {formatCurrency(opportunity.estimatedValue)}
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                  <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                  Due {new Date(opportunity.dueDate).toLocaleDateString()}
                                </div>
                              </div>
                              <p className="mt-2 text-sm text-gray-500">{opportunity.description}</p>
                              <div className="mt-4 flex items-center space-x-4">
                                <button className="text-sm font-medium text-[#2557a7] hover:text-[#1c4587]">
                                  View Details
                                </button>
                                <span className="text-sm text-gray-500">
                                  Posted {new Date(opportunity.postedDate).toLocaleDateString()}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {opportunity.solicitation}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold text-gray-800">No opportunities found</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Try adjusting your search criteria
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
