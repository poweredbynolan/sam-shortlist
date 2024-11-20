import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DocumentPlusIcon } from '@heroicons/react/24/outline';

export default function PostContract() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubcontract, setIsSubcontract] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contractType: '',
    estimatedValue: '',
    dueDate: '',
    location: '',
    requirements: '',
    parentContractId: '', // Only for subcontracts
    setAsideType: '',
    naicsCode: '',
    documents: []
  });

  const contractTypes = [
    'Fixed Price',
    'Time & Materials',
    'Cost Plus Fixed Fee',
    'Cost Reimbursement',
    'Indefinite Delivery/Indefinite Quantity (IDIQ)',
    'Firm Fixed Price',
    'Performance-Based Contract'
  ];

  const setAsideTypes = [
    'Small Business',
    'Veteran-Owned',
    'Service-Disabled Veteran-Owned',
    'Women-Owned Small Business',
    '8(a) Business Development',
    'HUBZone',
    'Small Disadvantaged Business'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files]
    }));
  };

  const handleRemoveFile = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // TODO: Implement actual contract submission
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      navigate('/search'); // Redirect to search page after successful submission
    } catch (err) {
      setError(err.message || 'Failed to post contract');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center">
                <DocumentPlusIcon className="h-8 w-8 text-[#2557a7] mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Post {isSubcontract ? 'Subcontract' : 'Contract'} Opportunity
                </h2>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Fill out the form below to post a new {isSubcontract ? 'subcontract' : 'contract'} opportunity.
              </p>
            </div>

            {/* Contract Type Toggle */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setIsSubcontract(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    !isSubcontract
                      ? 'bg-[#2557a7] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Main Contract
                </button>
                <button
                  type="button"
                  onClick={() => setIsSubcontract(true)}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    isSubcontract
                      ? 'bg-[#2557a7] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Subcontract
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2557a7] focus:ring-[#2557a7] sm:text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2557a7] focus:ring-[#2557a7] sm:text-sm"
                />
              </div>

              {/* Contract Type */}
              <div>
                <label htmlFor="contractType" className="block text-sm font-medium text-gray-700">
                  Contract Type
                </label>
                <select
                  name="contractType"
                  id="contractType"
                  required
                  value={formData.contractType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2557a7] focus:ring-[#2557a7] sm:text-sm"
                >
                  <option value="">Select a contract type</option>
                  {contractTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Parent Contract ID (for subcontracts) */}
              {isSubcontract && (
                <div>
                  <label htmlFor="parentContractId" className="block text-sm font-medium text-gray-700">
                    Parent Contract ID
                  </label>
                  <input
                    type="text"
                    name="parentContractId"
                    id="parentContractId"
                    required
                    value={formData.parentContractId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2557a7] focus:ring-[#2557a7] sm:text-sm"
                  />
                </div>
              )}

              {/* Estimated Value */}
              <div>
                <label htmlFor="estimatedValue" className="block text-sm font-medium text-gray-700">
                  Estimated Value (USD)
                </label>
                <input
                  type="number"
                  name="estimatedValue"
                  id="estimatedValue"
                  required
                  min="0"
                  value={formData.estimatedValue}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2557a7] focus:ring-[#2557a7] sm:text-sm"
                />
              </div>

              {/* Due Date */}
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  id="dueDate"
                  required
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2557a7] focus:ring-[#2557a7] sm:text-sm"
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  id="location"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2557a7] focus:ring-[#2557a7] sm:text-sm"
                />
              </div>

              {/* Set-Aside Type */}
              <div>
                <label htmlFor="setAsideType" className="block text-sm font-medium text-gray-700">
                  Set-Aside Type
                </label>
                <select
                  name="setAsideType"
                  id="setAsideType"
                  value={formData.setAsideType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2557a7] focus:ring-[#2557a7] sm:text-sm"
                >
                  <option value="">Select a set-aside type</option>
                  {setAsideTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* NAICS Code */}
              <div>
                <label htmlFor="naicsCode" className="block text-sm font-medium text-gray-700">
                  NAICS Code
                </label>
                <input
                  type="text"
                  name="naicsCode"
                  id="naicsCode"
                  required
                  value={formData.naicsCode}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2557a7] focus:ring-[#2557a7] sm:text-sm"
                />
              </div>

              {/* Requirements */}
              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
                  Requirements
                </label>
                <textarea
                  name="requirements"
                  id="requirements"
                  rows={4}
                  value={formData.requirements}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2557a7] focus:ring-[#2557a7] sm:text-sm"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Supporting Documents
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-[#2557a7] hover:text-[#1c4587] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#2557a7]"
                      >
                        <span>Upload files</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB each</p>
                  </div>
                </div>
                {/* File List */}
                {formData.documents.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {formData.documents.map((file, index) => (
                      <li key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-5">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2557a7]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#2557a7] hover:bg-[#1c4587] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2557a7] disabled:opacity-50"
                  >
                    {loading ? 'Posting...' : 'Post Contract'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
