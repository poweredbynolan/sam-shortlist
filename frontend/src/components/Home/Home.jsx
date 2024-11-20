import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  BookmarkIcon,
  BellIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { getPaginatedOpportunities } from '../../data/mockOpportunities';
import OpportunityCard from '../OpportunityCard';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
  const { user, savedContracts } = useAuth();
  const [recentOpportunities, setRecentOpportunities] = useState([]);
  const [savedSearches, setSavedSearches] = useState([
    { id: 1, query: 'IT Services in California', results: 156 },
    { id: 2, query: 'Construction Management', results: 89 },
    { id: 3, query: 'Healthcare Equipment', results: 234 },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentOpportunities = async () => {
      try {
        const result = getPaginatedOpportunities(1, 5);
        setRecentOpportunities(result.opportunities);
      } catch (error) {
        console.error('Failed to fetch opportunities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOpportunities();
  }, []);

  const stats = [
    { id: 1, name: 'Saved Opportunities', value: savedContracts.length.toString(), icon: BookmarkIcon },
    { id: 2, name: 'Active Alerts', value: '12', icon: BellIcon },
    { id: 3, name: 'Submitted Bids', value: '8', icon: DocumentTextIcon },
    { id: 4, name: 'Win Rate', value: '24%', icon: ChartBarIcon },
  ];

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-2 text-lg font-medium text-gray-900">Sign in to view your dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">
            Create an account or sign in to track contract opportunities.
          </p>
          <div className="mt-6">
            <Link
              to="/signin"
              className="inline-flex items-center rounded-md bg-[#2557a7] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1c4587] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2557a7]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-10">
        {/* Welcome Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {user.name}!</h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your contract opportunities
          </p>
        </div>

        {/* Stats Section */}
        <div className="mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.id}
                  className="relative bg-white pt-5 px-4 pb-6 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
                >
                  <dt>
                    <div className="absolute bg-[#2557a7] rounded-md p-3">
                      <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <p className="ml-16 text-sm font-medium text-gray-500 truncate">{stat.name}</p>
                  </dt>
                  <dd className="ml-16 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Quick Search */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center space-x-2 text-gray-900">
              <MagnifyingGlassIcon className="h-5 w-5" />
              <h2 className="text-lg font-medium">Quick Search</h2>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {savedSearches.map((search) => (
                <Link
                  key={search.id}
                  to={`/search?q=${encodeURIComponent(search.query)}`}
                  className="group block rounded-lg border border-gray-200 p-4 hover:border-[#2557a7] hover:shadow-sm transition-all duration-200"
                >
                  <h3 className="font-medium text-gray-900 group-hover:text-[#2557a7]">
                    {search.query}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{search.results} opportunities</p>
                </Link>
              ))}
              <Link
                to="/search"
                className="block rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-[#2557a7] hover:shadow-sm transition-all duration-200"
              >
                <MagnifyingGlassIcon className="mx-auto h-6 w-6 text-gray-400" />
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  New Search
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Opportunities */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-gray-900">
                <DocumentTextIcon className="h-5 w-5" />
                <h2 className="text-lg font-medium">Recent Opportunities</h2>
              </div>
              <Link
                to="/search"
                className="text-sm font-medium text-[#2557a7] hover:text-[#1c4587]"
              >
                View all
              </Link>
            </div>
            <div className="mt-4 space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2557a7] mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading opportunities...</p>
                </div>
              ) : recentOpportunities.length > 0 ? (
                recentOpportunities.map((opportunity) => (
                  <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No recent opportunities found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="bg-gradient-to-r from-[#2557a7] to-[#1c4587] rounded-lg shadow-sm">
            <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                <span className="block">Ready to win more contracts?</span>
              </h2>
              <p className="mt-4 text-lg leading-6 text-blue-100">
                Complete your profile and set up alerts to never miss an opportunity.
              </p>
              <Link
                to="/profile/setup"
                className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-[#2557a7] bg-white hover:bg-blue-50 sm:w-auto"
              >
                Complete Setup
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
