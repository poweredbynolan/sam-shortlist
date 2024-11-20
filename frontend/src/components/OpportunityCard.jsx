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
      return 'Invalid date';
    }
  };

  const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(amount);
    } catch (e) {
      console.error('Invalid amount:', e);
      return 'Amount not available';
    }
  };

  // Sanitize all text content
  const sanitizedTitle = encodeHTML(title);
  const sanitizedAgency = encodeHTML(agency);
  const sanitizedDescription = sanitizeHtml(description);
  const sanitizedContractType = encodeHTML(contractType);
  const sanitizedSetAsideType = encodeHTML(setAsideType);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300 group">
      <div className="flex justify-between items-start">
        <div className="flex-grow pr-4">
          <h2 
            className="text-lg font-bold text-[#2557a7] group-hover:text-[#1c4587] transition-colors"
            dangerouslySetInnerHTML={{ __html: sanitizedTitle }}
          />
          <div className="mt-1 flex items-center text-sm text-gray-600 space-x-2">
            <BuildingOfficeIcon className="h-4 w-4 text-gray-500" />
            <span dangerouslySetInnerHTML={{ __html: sanitizedAgency }} />
            <span className="text-xs">•</span>
            <ClockIcon className="h-4 w-4 text-gray-500" />
            <span>Posted {formatDate(postedDate)}</span>
          </div>
          
          <div 
            className="mt-2 text-sm text-gray-700 line-clamp-2"
            dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
          />
          
          <div className="mt-3 flex items-center space-x-2 text-xs">
            <span 
              className="bg-blue-50 text-blue-800 px-2 py-1 rounded"
              dangerouslySetInnerHTML={{ __html: sanitizedContractType }}
            />
            <span 
              className="bg-green-50 text-green-800 px-2 py-1 rounded"
              dangerouslySetInnerHTML={{ __html: sanitizedSetAsideType }}
            />
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <button 
            className="text-gray-500 hover:text-[#2557a7] transition-colors"
            aria-label="Bookmark opportunity"
          >
            <BookmarkIcon className="h-6 w-6" />
          </button>
          
          <div className="text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <CurrencyDollarIcon className="h-4 w-4 text-gray-500" />
              <span>{formatCurrency(estimatedValue)}</span>
            </div>
            <div className="text-right mt-1">
              <span>Due {formatDate(dueDate)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
