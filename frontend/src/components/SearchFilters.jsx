import { Fragment, useState, useEffect } from 'react';
import { Dialog, Disclosure, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon, FunnelIcon } from '@heroicons/react/20/solid';
import { getOrganizations, getSetAsides } from '../services/api';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function SearchFilters({ filters, setFilters }) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [setAsides, setSetAsides] = useState([]);

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [orgsData, setAsidesData] = await Promise.all([
          getOrganizations(),
          getSetAsides()
        ]);
        setOrganizations(orgsData);
        setSetAsides(setAsidesData);
      } catch (error) {
        console.error('Error fetching filter data:', error);
      }
    };
    fetchFilterData();
  }, []);

  const filterSections = [
    {
      id: 'setAside',
      name: 'Set-Aside Type',
      options: setAsides.map(type => ({
        value: type.code,
        label: type.name,
        checked: filters.setAsides?.includes(type.code) || false
      }))
    },
    {
      id: 'organization',
      name: 'Organization',
      options: organizations.map(org => ({
        value: org.id,
        label: org.name,
        checked: filters.organizations?.includes(org.id) || false
      }))
    },
    {
      id: 'contractType',
      name: 'Contract Type',
      options: [
        { value: 'p', label: 'Pre-solicitation', checked: filters.noticeType?.includes('p') || false },
        { value: 'o', label: 'Solicitation', checked: filters.noticeType?.includes('o') || false },
        { value: 'k', label: 'Combined Synopsis', checked: filters.noticeType?.includes('k') || false }
      ]
    }
  ];

  const handleFilterChange = (sectionId, value, checked) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      switch (sectionId) {
        case 'setAside':
          newFilters.setAsides = checked
            ? [...(prev.setAsides || []), value]
            : (prev.setAsides || []).filter(v => v !== value);
          break;
        case 'organization':
          newFilters.organizations = checked
            ? [...(prev.organizations || []), value]
            : (prev.organizations || []).filter(v => v !== value);
          break;
        case 'contractType':
          newFilters.noticeType = checked
            ? [...(prev.noticeType || []), value]
            : (prev.noticeType || []).filter(v => v !== value);
          break;
      }
      
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  return (
    <div className="bg-white">
      {/* Mobile filter dialog */}
      <Transition.Root show={mobileFiltersOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40 lg:hidden" onClose={setMobileFiltersOpen}>
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
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl">
                <div className="flex items-center justify-between px-4">
                  <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                  <button
                    type="button"
                    className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Filters */}
                <form className="mt-4 border-t border-gray-200">
                  {filterSections.map((section) => (
                    <Disclosure as="div" key={section.id} className="border-t border-gray-200 px-4 py-6">
                      {({ open }) => (
                        <>
                          <h3 className="-mx-2 -my-3 flow-root">
                            <Disclosure.Button className="flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500">
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
                                    defaultChecked={option.checked}
                                    onChange={(e) => handleFilterChange(section.id, option.value, e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                  />
                                  <label
                                    htmlFor={`filter-mobile-${section.id}-${optionIdx}`}
                                    className="ml-3 min-w-0 flex-1 text-gray-500"
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
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop filter section */}
      <div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-6">
            <h1 className="text-base font-semibold leading-6 text-gray-900">Filters</h1>

            <div className="flex items-center">
              <button
                type="button"
                className="inline-flex items-center text-sm text-primary hover:text-primary/80"
                onClick={clearFilters}
              >
                Clear all
              </button>

              <button
                type="button"
                className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <span className="sr-only">Filters</span>
                <FunnelIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <section aria-labelledby="filters-heading" className="pb-6 pt-6">
            <h2 id="filters-heading" className="sr-only">
              Contract filters
            </h2>

            <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
              {/* Filters */}
              <form className="hidden lg:block">
                {filterSections.map((section) => (
                  <Disclosure as="div" key={section.id} className="border-b border-gray-200 py-6">
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
                                  defaultChecked={option.checked}
                                  onChange={(e) => handleFilterChange(section.id, option.value, e.target.checked)}
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
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
