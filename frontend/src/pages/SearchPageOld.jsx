import { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import SearchFilters from '../components/SearchFilters';
import OpportunityCard from '../components/OpportunityCard';
import LoadingSpinner from '../components/Layout/LoadingSpinner';
import { getPaginatedOpportunities } from '../data/mockOpportunities';
import { RateLimiter, sanitizeSearchQuery, validateOpportunity, secureStorage } from '../utils/security';

// Initialize rate limiter
const apiRateLimiter = new RateLimiter(100, 60000); // 100 requests per minute

export default function SearchPageOld() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 25
  });
  const [filters, setFilters] = useState({
    datePosted: '',
    contractType: '',
    setAsideType: '',
    agency: '',
  });

  // Load saved filters from secure storage
  useEffect(() => {
    const savedFilters = secureStorage.get('filters');
    if (savedFilters) {
      setFilters(savedFilters);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [pagination.page]);

  const fetchOpportunities = async () => {
    try {
      // Check rate limit
      if (!apiRateLimiter.checkLimit('user-1')) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      setLoading(true);
      const result = getPaginatedOpportunities(pagination.page, pagination.pageSize);
      
      // Validate opportunities before setting them
      const validatedOpportunities = result.opportunities.filter(opp => (
        validateOpportunity.title(opp.title) &&
        validateOpportunity.description(opp.description) &&
        validateOpportunity.amount(opp.estimatedValue) &&
        validateOpportunity.date(opp.postedDate) &&
        validateOpportunity.date(opp.dueDate)
      ));

      setOpportunities(validatedOpportunities);
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

  const handleSearch = async (searchQuery) => {
    try {
      // Check rate limit
      if (!apiRateLimiter.checkLimit('user-1')) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      setLoading(true);
      const sanitizedQuery = sanitizeSearchQuery(searchQuery);
      
      // TODO: Implement actual search logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save search query to secure storage
      secureStorage.set('lastSearch', sanitizedQuery);
    } catch (err) {
      setError(err.message || 'Search failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    // Validate and sanitize filter values
    const sanitizedFilters = {
      datePosted: sanitizeSearchQuery(newFilters.datePosted),
      contractType: sanitizeSearchQuery(newFilters.contractType),
      setAsideType: sanitizeSearchQuery(newFilters.setAsideType),
      agency: sanitizeSearchQuery(newFilters.agency),
    };

    setFilters(sanitizedFilters);
    // Save filters to secure storage
    secureStorage.set('filters', sanitizedFilters);
  };

  const handlePageChange = (newPage) => {
    if (typeof newPage !== 'number' || newPage < 1) {
      console.error('Invalid page number');
      return;
    }
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <main className="flex-1 w-full bg-[#f3f2f1]">
      <SearchBar onSearch={handleSearch} />
      
      <div className="max-w-6xl mx-auto px-4 py-6 lg:grid lg:grid-cols-12 lg:gap-6">
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-6">
            <SearchFilters filters={filters} onFilterChange={handleFilterChange} />
          </div>
        </aside>
        
        <div className="lg:col-span-9 space-y-4">
          {loading ? (
            <div className="bg-white p-6 rounded-lg shadow">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          ) : opportunities.length > 0 ? (
            <>
              <div className="bg-white p-4 border-b border-gray-200 text-sm text-gray-600 flex justify-between items-center">
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
              {opportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
              
              <div className="bg-white p-4 border-t border-gray-200 text-sm text-gray-600 flex justify-between items-center">
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
            </>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <h3 className="text-lg font-semibold text-gray-800">No opportunities found</h3>
              <p className="text-sm text-gray-600 mt-2">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
