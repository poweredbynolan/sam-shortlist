"""FastAPI backend for SAM.gov Contract Opportunities"""

import os
import logging
from typing import Optional
from fastapi import FastAPI, HTTPException, Query, Response
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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

def get_sam_client() -> SAMAPIClient:
    """Get an authenticated SAM.gov API client."""
    api_key = os.getenv("SAM_API_KEY")
    if not api_key:
        raise ValueError("SAM_API_KEY environment variable not set")
    return SAMAPIClient(api_key)

@app.get("/")
async def root():
    """Root endpoint serving the frontend."""
    return FileResponse("index.html")

@app.get("/api/opportunities")
async def search_opportunities(
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
    """
    Search contract opportunities with optional filters.
    """
    try:
        client = get_sam_client()
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
async def get_opportunity(notice_id: str):
    """
    Get detailed information about a specific opportunity.
    """
    try:
        client = get_sam_client()
        return client.get_opportunity(notice_id)
    except ValueError as e:
        logger.error(f"Invalid request: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching opportunity {notice_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/opportunities/{notice_id}/description")
async def get_opportunity_description(notice_id: str):
    """
    Get the full description text of an opportunity.
    """
    try:
        client = get_sam_client()
        return {"description": client.get_opportunity_description(notice_id)}
    except ValueError as e:
        logger.error(f"Invalid request: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching description for {notice_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/opportunities/resources/{resource_id}")
async def get_resource_file(resource_id: str):
    """
    Download a resource file associated with an opportunity.
    """
    try:
        client = get_sam_client()
        content = client.get_resource_file(resource_id)
        return Response(content=content)
    except ValueError as e:
        logger.error(f"Invalid request: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error downloading resource {resource_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/organizations")
async def get_organizations():
    """
    Get a list of organizations that post opportunities.
    """
    try:
        client = get_sam_client()
        return client.get_organizations()
    except ValueError as e:
        logger.error(f"Invalid request: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching organizations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/setasides")
async def get_setasides():
    """
    Get a list of valid set-aside types and codes.
    """
    try:
        client = get_sam_client()
        return client.get_setasides()
    except ValueError as e:
        logger.error(f"Invalid request: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching set-aside types: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
