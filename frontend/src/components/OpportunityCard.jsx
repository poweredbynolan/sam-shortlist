import { BookmarkIcon, BuildingOfficeIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { formatDistance } from 'date-fns';
import { sanitizeHtml, encodeHTML } from '../utils/security';

export default function OpportunityCard({ opportunity }) {
  const {
    title,
    agency,
    postedDate,
    dueDate,
    description,
    contractType,
    setAsideType,
    estimatedValue,
  } = opportunity;

  const formatDate = (dateString) => {
    try {
      return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
    } catch (e) {
      console.error('Invalid date:', e);
      return 'Date unavailable';
    }
  };

  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <div className="px-4 py-6 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold leading-7 text-gray-900 sm:truncate">
              {encodeHTML(title)}
            </h2>
            <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <BuildingOfficeIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                {encodeHTML(agency)}
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <ClockIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                Posted {formatDate(postedDate)}
              </div>
              {dueDate && (
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <ClockIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                  Due {formatDate(dueDate)}
                </div>
              )}
              {estimatedValue && (
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <CurrencyDollarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                  Estimated value: ${estimatedValue.toLocaleString()}
                </div>
              )}
            </div>
          </div>
          <div className="mt-0 flex flex-none items-center">
            <button
              type="button"
              className="rounded-full bg-white p-1.5 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <span className="sr-only">Bookmark opportunity</span>
              <BookmarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex space-x-3">
            {contractType && (
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                {encodeHTML(contractType)}
              </span>
            )}
            {setAsideType && (
              <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                {encodeHTML(setAsideType)}
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-700 line-clamp-3" 
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }} 
        />
      </div>
      <div className="flex border-t border-gray-900/5 px-4 py-4 sm:px-6">
        <a
          href="#"
          className="text-sm font-semibold leading-6 text-primary hover:text-primary/80"
        >
          View full details <span aria-hidden="true">&rarr;</span>
        </a>
      </div>
    </div>
  );
}
