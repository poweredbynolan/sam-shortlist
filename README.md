# SAM Shortlist

A FastAPI backend for searching and retrieving federal contract opportunities from SAM.gov.

## Features

- Search contract opportunities with filters:
  - Keyword search
  - NAICS code filtering
  - Set-aside type filtering
  - Status filtering
  - Pagination support
- Retrieve detailed opportunity information
- Comprehensive error handling and logging
- CORS support for frontend integration

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sam-shortlist.git
cd sam-shortlist
```

2. Create a virtual environment and install dependencies:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Create a `.env` file with your SAM.gov API key:
```bash
SAM_API_KEY=your_api_key_here
```

4. Start the server:
```bash
uvicorn api.main:app --reload --port 3002
```

The API will be available at `http://localhost:3002`.

## API Endpoints

### Search Opportunities
```
GET /api/opportunities
```

Query Parameters:
- `keyword` (optional): Search term
- `naics_code` (optional): NAICS code filter
- `set_aside` (optional): Set-aside type (e.g., 'SBA', 'WOSB')
- `status` (optional): Opportunity status
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Results per page

### Get Opportunity Details
```
GET /api/opportunities/{notice_id}
```

Path Parameters:
- `notice_id`: Unique identifier of the opportunity

## Development

The project uses:
- FastAPI for the web framework
- python-dotenv for environment management
- requests for HTTP client
- uvicorn for ASGI server

## License

MIT License
