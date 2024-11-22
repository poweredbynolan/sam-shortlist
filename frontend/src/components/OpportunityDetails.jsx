import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BookmarkIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  LinkIcon,
  MapPinIcon,
  TagIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { getOpportunity } from '../services/api';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function OpportunityDetails() {
  const { id } = useParams();
  const { user, saveContract, unsaveContract, isContractSaved } = useAuth();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOpportunityDetails();
  }, [id]);

  const fetchOpportunityDetails = async () => {
    try {
      setLoading(true);
      const data = await getOpportunity(id);
      setOpportunity(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch opportunity details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContract = async () => {
    if (!user) return;
    
    if (isContractSaved(opportunity.id)) {
      await unsaveContract(opportunity.id);
    } else {
      await saveContract(opportunity);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!opportunity) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between md:space-x-5">
          <div className="flex items-start space-x-5">
            <div className="pt-1.5">
              <h1 className="text-2xl font-bold text-gray-900">{opportunity.title}</h1>
              <div className="flex items-center space-x-2">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-500">{opportunity.agency}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-3 sm:space-y-0 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
            {user ? (
              <button
                type="button"
                onClick={handleSaveContract}
                className={classNames(
                  isContractSaved(opportunity.id)
                    ? 'bg-primary text-white hover:bg-primary-dark'
                    : 'bg-white text-gray-700 hover:bg-gray-50',
                  'inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-300'
                )}
              >
                {isContractSaved(opportunity.id) ? (
                  <BookmarkSolidIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                ) : (
                  <BookmarkIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                )}
                {isContractSaved(opportunity.id) ? 'Saved' : 'Save Contract'}
              </button>
            ) : (
              <Link
                to="/signin"
                className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
              >
                <UserGroupIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                Sign in to save
              </Link>
            )}
          </div>
        </div>

        {/* Contract Details */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Description */}
              <section aria-labelledby="description-title">
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h2 id="description-title" className="text-lg font-medium leading-6 text-gray-900">
                      Description
                    </h2>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <div className="prose prose-sm max-w-none text-gray-500">
                      {opportunity.description}
                    </div>
                  </div>
                </div>
              </section>

              {/* Documents */}
              {opportunity.documents && opportunity.documents.length > 0 && (
                <section aria-labelledby="documents-title">
                  <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h2 id="documents-title" className="text-lg font-medium leading-6 text-gray-900">
                        Documents
                      </h2>
                    </div>
                    <div className="border-t border-gray-200">
                      <ul role="list" className="divide-y divide-gray-200">
                        {opportunity.documents.map((document) => (
                          <li key={document.id}>
                            <a
                              href={document.url}
                              className="block hover:bg-gray-50"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" aria-hidden="true" />
                                    <p className="truncate text-sm font-medium text-primary">
                                      {document.name}
                                    </p>
                                  </div>
                                  <div className="ml-2 flex flex-shrink-0">
                                    <LinkIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                  </div>
                                </div>
                              </div>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:col-span-1">
            {/* Contract Details Card */}
            <section aria-labelledby="contract-details-title">
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h2 id="contract-details-title" className="text-lg font-medium leading-6 text-gray-900">
                    Contract Details
                  </h2>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <dl className="space-y-4">
                    <div>
                      <dt className="flex items-center text-sm font-medium text-gray-500">
                        <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-2" aria-hidden="true" />
                        Estimated Value
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {formatCurrency(opportunity.estimatedValue)}
                      </dd>
                    </div>
                    <div>
                      <dt className="flex items-center text-sm font-medium text-gray-500">
                        <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" aria-hidden="true" />
                        Due Date
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(opportunity.dueDate).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="flex items-center text-sm font-medium text-gray-500">
                        <TagIcon className="h-5 w-5 text-gray-400 mr-2" aria-hidden="true" />
                        Set-Aside
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {opportunity.setAsideType || 'None'}
                      </dd>
                    </div>
                    <div>
                      <dt className="flex items-center text-sm font-medium text-gray-500">
                        <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" aria-hidden="true" />
                        Place of Performance
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {opportunity.placeOfPerformance || 'Not specified'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </section>

            {/* Additional Information */}
            <section aria-labelledby="additional-info-title">
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h2 id="additional-info-title" className="text-lg font-medium leading-6 text-gray-900">
                    Additional Information
                  </h2>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Solicitation Number</dt>
                      <dd className="mt-1 text-sm text-gray-900">{opportunity.solicitation}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">NAICS Code</dt>
                      <dd className="mt-1 text-sm text-gray-900">{opportunity.naicsCode || 'Not specified'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Posted Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(opportunity.postedDate).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
