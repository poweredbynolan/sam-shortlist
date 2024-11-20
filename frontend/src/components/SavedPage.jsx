import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookmarkIcon, 
  CalendarIcon, 
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

export default function SavedPage() {
  const { user, savedContracts, unsaveContract } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <BookmarkIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-2 text-lg font-medium text-gray-900">Sign in to view saved contracts</h2>
          <p className="mt-1 text-sm text-gray-500">
            Create an account or sign in to save and track contract opportunities.
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

  if (savedContracts.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <BookmarkIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-2 text-lg font-medium text-gray-900">No saved contracts</h2>
          <p className="mt-1 text-sm text-gray-500">
            Start saving contracts to track opportunities that interest you.
          </p>
          <div className="mt-6">
            <Link
              to="/search"
              className="inline-flex items-center rounded-md bg-[#2557a7] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1c4587] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2557a7]"
            >
              Find Contracts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Saved Contracts</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all the contracts you've saved for tracking and future reference.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Link
              to="/search"
              className="block rounded-md bg-[#2557a7] px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-[#1c4587] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2557a7]"
            >
              Find More Contracts
            </Link>
          </div>
        </div>

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <div className="min-w-full divide-y divide-gray-300">
                  {savedContracts.map((contract) => (
                    <div
                      key={contract.id}
                      className="bg-white px-4 py-5 sm:px-6 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">
                              {contract.title}
                            </h3>
                            <button
                              onClick={() => unsaveContract(contract.id)}
                              className="ml-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                            >
                              <span className="sr-only">Remove from saved</span>
                              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                          <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <BuildingOfficeIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                              {contract.agency}
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <CurrencyDollarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                              {contract.amount}
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                              Due {new Date(contract.dueDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="mt-4">
                            <button
                              onClick={() => navigate(`/opportunities/${contract.id}`)}
                              className="text-sm font-medium text-[#2557a7] hover:text-[#1c4587]"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
