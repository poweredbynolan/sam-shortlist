import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  BookmarkIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  UserIcon,
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

  const handleSaveContract = async (contract) => {
    if (!user) {
      // Show sign-in prompt
      return;
    }
    if (isContractSaved(contract.id)) {
      await unsaveContract(contract.id);
    } else {
      await saveContract(contract);
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
          <h1 className="text-lg font-medium leading-6 text-gray-900">
            Search Contract Opportunities
          </h1>
          {!user && (
            <Link
              to="/signin"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <UserIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Sign in to save contracts
            </Link>
          )}
        </div>

        {/* Search Form */}
        <div className="mt-4">
          <form onSubmit={handleSearch} className="flex gap-x-4">
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
                  className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  placeholder="Search contract opportunities..."
                />
              </div>
            </div>
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Search
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              {loading ? (
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                </div>
              ) : error ? (
                <div className="text-center text-red-600">{error}</div>
              ) : opportunities.length === 0 ? (
                <div className="text-center text-gray-500">No opportunities found</div>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                  <div className="min-w-full divide-y divide-gray-300">
                    {opportunities.map((contract) => (
                      <div
                        key={contract.id}
                        className="bg-white px-4 py-5 sm:px-6 hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <Link
                                to={`/opportunity/${contract.id}`}
                                className="text-lg font-medium leading-6 text-gray-900 hover:text-primary"
                              >
                                {contract.title}
                              </Link>
                              <button
                                onClick={() => handleSaveContract(contract)}
                                className={`ml-2 rounded-full p-1 ${
                                  !user
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : isContractSaved(contract.id)
                                    ? 'text-primary hover:bg-gray-100'
                                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-500'
                                }`}
                                disabled={!user}
                                title={!user ? 'Sign in to save contracts' : ''}
                              >
                                {isContractSaved(contract.id) ? (
                                  <BookmarkSolidIcon className="h-6 w-6" aria-hidden="true" />
                                ) : (
                                  <BookmarkIcon className="h-6 w-6" aria-hidden="true" />
                                )}
                              </button>
                            </div>
                            <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                              <div className="mt-2 flex items-center text-sm text-gray-500">
                                <BuildingOfficeIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                {contract.agency}
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500">
                                <CurrencyDollarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                {formatCurrency(contract.estimatedValue)}
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500">
                                <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                Due {new Date(contract.dueDate).toLocaleDateString()}
                              </div>
                            </div>
                            <p className="mt-2 text-sm text-gray-500">{contract.description}</p>
                            <div className="mt-4 flex items-center space-x-4">
                              <button className="text-sm font-medium text-primary hover:text-primary-dark">
                                View Details
                              </button>
                              <span className="text-sm text-gray-500">
                                Posted {new Date(contract.postedDate).toLocaleDateString()}
                              </span>
                              <span className="text-sm text-gray-500">
                                {contract.solicitation}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
