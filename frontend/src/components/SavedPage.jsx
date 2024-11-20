import { useState } from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  FolderIcon,
  StarIcon,
} from '@heroicons/react/20/solid';
import OpportunityCard from './OpportunityCard';
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

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

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
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-6">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Saved Opportunities
          </h1>
          
          <div className="flex items-center">
            <div className="isolate inline-flex rounded-md shadow-sm">
              <button
                type="button"
                className="relative inline-flex items-center rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
              >
                <FolderIcon className="mr-1.5 h-5 w-5 text-gray-400" />
                New Folder
              </button>
              <button
                type="button"
                className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
              >
                <StarIcon className="mr-1.5 h-5 w-5 text-gray-400" />
                Add to Favorites
              </button>
            </div>
          </div>
        </div>

        <section aria-labelledby="opportunities-heading" className="pb-24 pt-6">
          <h2 id="opportunities-heading" className="sr-only">
            Saved contract opportunities
          </h2>

          <div className="space-y-4">
            {savedContracts.map((contract) => (
              <div key={contract.id} className="bg-white px-4 py-5 sm:px-6 hover:bg-gray-50">
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

          {/* Pagination */}
          <div className="mt-8 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <a
                href="#"
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Previous
              </a>
              <a
                href="#"
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Next
              </a>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
                  <span className="font-medium">{savedContracts.length}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <a
                    href="#"
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 focus:outline-offset-0"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                  </a>
                  <a
                    href="#"
                    aria-current="page"
                    className="relative z-10 inline-flex items-center bg-primary px-4 py-2 text-sm font-semibold text-white focus:z-10"
                  >
                    1
                  </a>
                  <a
                    href="#"
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 focus:outline-offset-0"
                  >
                    2
                  </a>
                  <a
                    href="#"
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 focus:outline-offset-0"
                  >
                    3
                  </a>
                  <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                    ...
                  </span>
                  <a
                    href="#"
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 focus:outline-offset-0"
                  >
                    {Math.ceil(savedContracts.length / 10)}
                  </a>
                  <a
                    href="#"
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10 focus:outline-offset-0"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
