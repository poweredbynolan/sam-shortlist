// Mock data generation without external dependencies
function generateRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - generateRandomNumber(0, daysAgo));
  return date.toISOString();
}

const AGENCIES = [
  'Department of Defense',
  'Department of Homeland Security',
  'Department of Energy',
  'National Aeronautics and Space Administration (NASA)',
  'Department of Health and Human Services',
  'Environmental Protection Agency',
  'Department of Transportation',
  'Department of Agriculture',
  'Department of the Interior',
  'Department of Commerce',
  'Department of Education',
  'Department of Veterans Affairs',
  'General Services Administration',
  'Small Business Administration',
  'National Science Foundation',
  'Department of Justice',
  'Department of State',
  'Department of the Treasury'
];

const CONTRACT_TYPES = [
  'Fixed Price',
  'Time & Materials',
  'Cost Plus Fixed Fee',
  'Cost Reimbursement',
  'Indefinite Delivery/Indefinite Quantity (IDIQ)',
  'Firm Fixed Price',
  'Performance-Based Contract'
];

const SET_ASIDE_TYPES = [
  'Small Business',
  'Veteran-Owned',
  'Service-Disabled Veteran-Owned',
  'Women-Owned Small Business',
  '8(a) Business Development',
  'HUBZone',
  'Historically Black Colleges and Universities (HBCU)',
  'Small Disadvantaged Business'
];

const NAICS_CODES = [
  '541330 - Engineering Services',
  '541511 - Custom Computer Programming Services',
  '541512 - Computer Systems Design Services',
  '541513 - Computer Facilities Management Services',
  '541519 - Other Computer Related Services',
  '541611 - Administrative Management and General Management Consulting Services',
  '541612 - Human Resources Consulting Services',
  '541614 - Process, Physical Distribution, and Logistics Consulting Services',
  '541618 - Other Management Consulting Services',
  '541690 - Other Scientific and Technical Consulting Services'
];

function generateOpportunity(id) {
  const postedDate = generateRandomDate(60);
  const dueDate = new Date(new Date(postedDate).setDate(new Date(postedDate).getDate() + generateRandomNumber(30, 90))).toISOString();

  return {
    id,
    title: `${generateRandomElement(['Strategic', 'Advanced', 'Innovative'])} ${generateRandomElement(['Contract', 'Opportunity', 'Project'])} for ${generateRandomElement(AGENCIES)}`,
    agency: generateRandomElement(AGENCIES),
    postedDate,
    dueDate,
    description: `Seeking qualified contractors for a comprehensive ${generateRandomElement(CONTRACT_TYPES)} project. This opportunity requires expertise in ${generateRandomElement(NAICS_CODES)} with a focus on delivering high-quality solutions.`,
    contractType: generateRandomElement(CONTRACT_TYPES),
    setAsideType: generateRandomElement(SET_ASIDE_TYPES),
    naicsCode: generateRandomElement(NAICS_CODES),
    location: `${generateRandomElement(['Washington', 'New York', 'Chicago', 'Los Angeles'])}, ${generateRandomElement(['DC', 'NY', 'IL', 'CA'])}`,
    estimatedValue: generateRandomNumber(10000, 10000000),
    solicitation: `SOL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
  };
}

export const mockOpportunities = Array.from(
  { length: 2332 }, 
  (_, index) => generateOpportunity(index + 1)
);

export function getPaginatedOpportunities(page = 1, pageSize = 25) {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    total: mockOpportunities.length,
    page,
    pageSize,
    opportunities: mockOpportunities.slice(startIndex, endIndex)
  };
}
