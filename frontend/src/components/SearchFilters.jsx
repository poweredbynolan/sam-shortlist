import { Fragment, useState, useEffect } from 'react';
import { Dialog, Disclosure, Menu, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon, FunnelIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/20/solid';
import { getOrganizations, getSetAsides } from '../services/api';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function SearchFilters({ filters, setFilters }) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [setAsides, setSetAsides] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [orgsData, setAsidesData] = await Promise.all([
        getOrganizations(),
        getSetAsides(),
      ]);
      setOrganizations(orgsData);
      setSetAsides(setAsidesData);
    };
    fetchData();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filterSections = [
    {
      id: 'datePosted',
      name: 'Date Posted',
      options: [
        { value: '24h', label: 'Last 24 hours' },
        { value: '3d', label: 'Last 3 days' },
        { value: '7d', label: 'Last 7 days' },
        { value: '14d', label: 'Last 14 days' },
        { value: '30d', label: 'Last 30 days' },
      ],
    },
    {
      id: 'contractType',
      name: 'Contract Type',
      options: [
        { value: 'p', label: 'Pre-solicitation' },
        { value: 'o', label: 'Solicitation' },
        { value: 'k', label: 'Combined Synopsis/Solicitation' },
        { value: 'a', label: 'Award Notice' },
      ],
    },
    {
      id: 'setAside',
      name: 'Set-Aside Type',
      options: setAsides.map(type => ({ value: type, label: type })),
    },
    {
      id: 'agency',
      name: 'Agency',
      options: organizations.map(org => ({ value: org, label: org })),
    },
  ];

  return (
    <div className="bg-white">
      {/* Mobile filter dialog */}
      <Transition.Root show={mobileFiltersOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40 sm:hidden" onClose={setMobileFiltersOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-6 shadow-xl">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                <button
                  type="button"
                  className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-50"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-4 border-t border-gray-200">
                {filterSections.map((section) => (
                  <Disclosure as="div" key={section.name} className="border-t border-gray-200 px-4 py-6">
                    {({ open }) => (
                      <>
                        <h3 className="-mx-2 -my-3 flow-root">
                          <Disclosure.Button className="flex w-full items-center justify-between bg-white px-2 py-3 text-sm text-gray-400">
                            <span className="font-medium text-gray-900">{section.name}</span>
                            <span className="ml-6 flex items-center">
                              <ChevronDownIcon
                                className={classNames(open ? '-rotate-180' : 'rotate-0', 'h-5 w-5 transform')}
                                aria-hidden="true"
                              />
                            </span>
                          </Disclosure.Button>
                        </h3>
                        <Disclosure.Panel className="pt-6">
                          <div className="space-y-6">
                            {section.options.map((option, optionIdx) => (
                              <div key={option.value} className="flex items-center">
                                <input
                                  id={`filter-mobile-${section.id}-${optionIdx}`}
                                  name={`${section.id}[]`}
                                  defaultValue={option.value}
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label
                                  htmlFor={`filter-mobile-${section.id}-${optionIdx}`}
                                  className="ml-3 text-sm text-gray-500"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                ))}
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Filters */}
      <div className="border rounded-lg bg-white shadow-sm">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Filters</h2>
            <button
              type="button"
              className="inline-flex items-center text-sm text-primary hover:text-primary-dark"
            >
              <AdjustmentsHorizontalIcon className="mr-1.5 h-5 w-5" />
              Clear all
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filterSections.map((section) => (
            <Disclosure as="div" key={section.name} className="px-4 py-6">
              {({ open }) => (
                <>
                  <h3 className="-my-3 flow-root">
                    <Disclosure.Button className="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                      <span className="font-medium text-gray-900">{section.name}</span>
                      <span className="ml-6 flex items-center">
                        <ChevronDownIcon
                          className={classNames(open ? '-rotate-180' : 'rotate-0', 'h-5 w-5 transform')}
                          aria-hidden="true"
                        />
                      </span>
                    </Disclosure.Button>
                  </h3>
                  <Disclosure.Panel className="pt-6">
                    <div className="space-y-4">
                      {section.options.map((option, optionIdx) => (
                        <div key={option.value} className="flex items-center">
                          <input
                            id={`filter-${section.id}-${optionIdx}`}
                            name={`${section.id}[]`}
                            defaultValue={option.value}
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <label
                            htmlFor={`filter-${section.id}-${optionIdx}`}
                            className="ml-3 text-sm text-gray-600"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </Disclosure.Panel>
                </>
              )}
            </Disclosure>
          ))}
        </div>
      </div>
    </div>
  );
}
