// API Configuration
const API_BASE_URL = 'http://localhost:8001/api';

// State Management
let currentPage = 1;
let currentPageSize = 10;
let totalResults = 0;
let currentSearchParams = {
    q: '',
    naics_codes: '',
    set_asides: '',
    notice_type: '',
    organization_id: '',
    state: '',
    zipcode: ''
};

// DOM Elements
const keywordInput = document.getElementById('keyword-search');
const naicsInput = document.getElementById('naics-search');
const searchButton = document.getElementById('search-btn');
const statusFilter = document.getElementById('status-filter');
const setAsideFilter = document.getElementById('set-aside-filter');
const organizationFilter = document.getElementById('organization-filter');
const pageSizeSelect = document.getElementById('page-size');
const opportunitiesList = document.getElementById('opportunities-list');
const loadingSpinner = document.getElementById('loading-spinner');
const showingStart = document.getElementById('showing-start');
const showingEnd = document.getElementById('showing-end');
const totalResultsSpan = document.getElementById('total-results');
const pagination = document.getElementById('pagination');

// Event Listeners
searchButton.addEventListener('click', () => {
    currentPage = 1;
    searchOpportunities();
});

keywordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        currentPage = 1;
        searchOpportunities();
    }
});

naicsInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        currentPage = 1;
        searchOpportunities();
    }
});

statusFilter.addEventListener('change', () => {
    currentPage = 1;
    searchOpportunities();
});

setAsideFilter.addEventListener('change', () => {
    currentPage = 1;
    searchOpportunities();
});

organizationFilter?.addEventListener('change', () => {
    currentPage = 1;
    searchOpportunities();
});

pageSizeSelect.addEventListener('change', (e) => {
    currentPageSize = parseInt(e.target.value);
    currentPage = 1;
    searchOpportunities();
});

// API Functions
async function searchOpportunities() {
    showLoading(true);
    
    currentSearchParams = {
        q: keywordInput.value,
        naics_codes: naicsInput.value,
        set_asides: setAsideFilter.value,
        notice_type: statusFilter.value,
        organization_id: organizationFilter?.value,
        page: currentPage,
        limit: currentPageSize
    };

    try {
        const queryParams = new URLSearchParams(
            Object.entries(currentSearchParams)
                .filter(([_, value]) => value !== undefined && value !== '')
        );

        const response = await fetch(`${API_BASE_URL}/opportunities?${queryParams}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to fetch opportunities');
        }

        const data = await response.json();
        displayOpportunities(data.opportunities || []);
        updatePagination(data.metadata || { total: 0, page: 1, limit: currentPageSize });
        updateResultsCount(data.metadata || { total: 0, page: 1, limit: currentPageSize });

    } catch (error) {
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

async function loadOrganizations() {
    try {
        const response = await fetch(`${API_BASE_URL}/organizations`);
        if (!response.ok) {
            throw new Error('Failed to fetch organizations');
        }

        const organizations = await response.json();
        const select = document.getElementById('organization-filter');
        if (select) {
            select.innerHTML = `
                <option value="">All Organizations</option>
                ${organizations.map(org => `
                    <option value="${org.id}">${org.name}</option>
                `).join('')}
            `;
        }
    } catch (error) {
        console.error('Error loading organizations:', error);
    }
}

async function loadSetAsides() {
    try {
        const response = await fetch(`${API_BASE_URL}/setasides`);
        if (!response.ok) {
            throw new Error('Failed to fetch set-aside types');
        }

        const setAsides = await response.json();
        const select = document.getElementById('set-aside-filter');
        if (select) {
            select.innerHTML = `
                <option value="">All Set-Aside Types</option>
                ${setAsides.map(type => `
                    <option value="${type.code}">${type.description}</option>
                `).join('')}
            `;
        }
    } catch (error) {
        console.error('Error loading set-aside types:', error);
    }
}

// UI Functions
function displayOpportunities(opportunities) {
    if (!opportunities.length) {
        opportunitiesList.innerHTML = `
            <div class="text-center py-12">
                <h3 class="text-lg font-medium text-gray-900">No opportunities found</h3>
                <p class="mt-2 text-sm text-gray-500">Try adjusting your search criteria</p>
            </div>
        `;
        return;
    }

    opportunitiesList.innerHTML = opportunities.map(opp => `
        <div class="bg-white overflow-hidden shadow rounded-lg mb-4">
            <div class="px-4 py-5 sm:p-6">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h3 class="text-lg font-medium text-gray-900">${opp.title || 'No Title'}</h3>
                        <p class="mt-1 text-sm text-gray-500">${opp.organizationName || 'Unknown Organization'}</p>
                    </div>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(opp.noticeType)}">
                        ${formatNoticeType(opp.noticeType)}
                    </span>
                </div>
                
                <div class="mt-4">
                    <p class="text-sm text-gray-500">${truncateText(opp.description || 'No description available', 200)}</p>
                </div>
                
                <div class="mt-4 flex flex-wrap gap-2">
                    ${opp.naicsCode ? `
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            NAICS: ${opp.naicsCode}
                        </span>
                    ` : ''}
                    ${opp.typeOfSetAside ? `
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ${opp.typeOfSetAside}
                        </span>
                    ` : ''}
                </div>
                
                <div class="mt-4 flex justify-between items-center">
                    <div class="text-sm text-gray-500">
                        Posted: ${new Date(opp.postedDate).toLocaleDateString()}
                        ${opp.responseDeadLine ? ` | Due: ${new Date(opp.responseDeadLine).toLocaleDateString()}` : ''}
                    </div>
                    <a href="#" 
                       class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-celadon hover:bg-prussian focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-celadon"
                       onclick="showOpportunityDetails('${opp.id}')">
                        View Details
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

function getStatusBadgeColor(noticeType) {
    switch (noticeType?.toLowerCase()) {
        case 'p':
            return 'bg-green-100 text-green-800';  // Presolicitation
        case 'o':
            return 'bg-blue-100 text-blue-800';    // Solicitation
        case 'k':
            return 'bg-purple-100 text-purple-800'; // Combined Synopsis/Solicitation
        case 'a':
            return 'bg-yellow-100 text-yellow-800'; // Award Notice
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function formatNoticeType(noticeType) {
    const types = {
        'p': 'Presolicitation',
        'o': 'Solicitation',
        'k': 'Combined Synopsis',
        'a': 'Award Notice'
    };
    return types[noticeType?.toLowerCase()] || noticeType || 'Unknown';
}

function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function updatePagination(metadata) {
    const totalPages = Math.ceil(metadata.total / metadata.limit);
    showingStart.textContent = ((metadata.page - 1) * metadata.limit) + 1;
    showingEnd.textContent = Math.min(metadata.page * metadata.limit, metadata.total);
    totalResultsSpan.textContent = metadata.total;
    
    let paginationHtml = '';
    
    if (totalPages > 1) {
        paginationHtml = `
            <button class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    onclick="changePage(${currentPage - 1})"
                    ${currentPage === 1 ? 'disabled' : ''}>
                Previous
            </button>
        `;
        
        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                paginationHtml += `
                    <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-celadon text-sm font-medium text-white">
                        ${i}
                    </button>
                `;
            } else {
                paginationHtml += `
                    <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                            onclick="changePage(${i})">
                        ${i}
                    </button>
                `;
            }
        }
        
        paginationHtml += `
            <button class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    onclick="changePage(${currentPage + 1})"
                    ${currentPage === totalPages ? 'disabled' : ''}>
                Next
            </button>
        `;
    }
    
    pagination.innerHTML = paginationHtml;
}

function changePage(page) {
    if (page < 1) return;
    currentPage = page;
    searchOpportunities();
}

function showLoading(show) {
    loadingSpinner.style.display = show ? 'block' : 'none';
    opportunitiesList.style.opacity = show ? '0.5' : '1';
}

function showError(message) {
    opportunitiesList.innerHTML = `
        <div class="text-center py-12">
            <h3 class="text-lg font-medium text-red-600">Error</h3>
            <p class="mt-2 text-sm text-gray-500">${message}</p>
        </div>
    `;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([
        loadOrganizations(),
        loadSetAsides()
    ]);
    searchOpportunities();
});
