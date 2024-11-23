"""FastAPI backend for SAM.gov Contract Opportunities"""

import os
import logging
from typing import Optional
from fastapi import FastAPI, HTTPException, Query, Response, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from datetime import datetime, timedelta

from .sam_api import SAMAPIClient

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="SAM.gov Contract Opportunities API",
    description="API for searching and retrieving federal contract opportunities from SAM.gov",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

app.mount("/static", StaticFiles(directory="static"), name="static")

async def get_api_key(authorization: str = Header(...)) -> str:
    """Extract API key from Authorization header."""
    if not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    return authorization.replace('Bearer ', '')

def get_sam_client(api_key: str = Depends(get_api_key)) -> SAMAPIClient:
    """Get an authenticated SAM.gov API client."""
    if not api_key:
        raise HTTPException(status_code=401, detail="API key is required")
    return SAMAPIClient(api_key)

@app.get("/")
async def root():
    """Root endpoint serving the frontend."""
    return FileResponse('index.html')

@app.get("/api/opportunities")
async def search_opportunities(
    client: SAMAPIClient = Depends(get_sam_client),
    q: Optional[str] = Query(None, description="Search term"),
    naics_codes: Optional[str] = Query(None, description="NAICS code filter (comma-separated)"),
    set_asides: Optional[str] = Query(None, description="Set-aside type (e.g., 'SBA', 'WOSB')"),
    notice_type: Optional[str] = Query(None, description="Notice type (e.g., 'p', 'o', 'k')"),
    page: int = Query(1, description="Page number"),
    limit: int = Query(10, description="Results per page", le=100),
    posted_from: Optional[str] = Query(None, description="Start date (YYYY-MM-DD or MM/dd/yyyy)"),
    posted_to: Optional[str] = Query(None, description="End date (YYYY-MM-DD or MM/dd/yyyy)"),
    organization_id: Optional[str] = Query(None, description="Filter by organization ID"),
    organization_name: Optional[str] = Query(None, description="Filter by organization name"),
    state: Optional[str] = Query(None, description="Filter by state code (e.g., 'CA')"),
    zipcode: Optional[str] = Query(None, description="Filter by ZIP code")
):
    """Search contract opportunities with optional filters."""
    try:
        return client.search_opportunities(
            keyword=q,
            naics_code=naics_codes,
            set_aside=set_asides,
            status=notice_type,
            page=page,
            limit=limit,
            posted_from=posted_from,
            posted_to=posted_to,
            organization_id=organization_id,
            organization_name=organization_name,
            place_of_performance_state=state,
            place_of_performance_zipcode=zipcode
        )
    except ValueError as e:
        logger.error(f"Invalid request: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error searching opportunities: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/opportunities/{notice_id}")
async def get_opportunity(notice_id: str, client: SAMAPIClient = Depends(get_sam_client)):
    """
    Get detailed information about a specific opportunity.
    """
    try:
        return client.get_opportunity(notice_id)
    except ValueError as e:
        logger.error(f"Invalid request: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching opportunity {notice_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/opportunities/{notice_id}/description")
async def get_opportunity_description(notice_id: str, client: SAMAPIClient = Depends(get_sam_client)):
    """
    Get the full description text of an opportunity.
    """
    try:
        return {"description": client.get_opportunity_description(notice_id)}
    except ValueError as e:
        logger.error(f"Invalid request: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching description for {notice_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/opportunities/resources/{resource_id}")
async def get_resource_file(resource_id: str, client: SAMAPIClient = Depends(get_sam_client)):
    """
    Download a resource file associated with an opportunity.
    """
    try:
        content = client.get_resource_file(resource_id)
        return Response(content=content)
    except ValueError as e:
        logger.error(f"Invalid request: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error downloading resource {resource_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/organizations")
async def get_organizations(client: SAMAPIClient = Depends(get_sam_client)):
    """
    Get a list of organizations that post opportunities.
    """
    try:
        return client.get_organizations()
    except ValueError as e:
        logger.error(f"Invalid request: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching organizations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/setasides")
async def get_setasides(client: SAMAPIClient = Depends(get_sam_client)):
    """
    Get a list of valid set-aside types and codes.
    """
    try:
        return client.get_setasides()
    except ValueError as e:
        logger.error(f"Invalid request: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching set-aside types: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
