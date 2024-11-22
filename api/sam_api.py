"""SAM.gov API Client for Contract Opportunities"""

import logging
from typing import Dict, List, Optional
import requests
from datetime import datetime, timedelta
import time
from functools import wraps
import pytz
from .sam_schedule import get_cache_ttl, is_bulk_update_time, get_next_update_time

logger = logging.getLogger(__name__)

def rate_limit(calls: int, period: int):
    """Rate limiting decorator
    
    Args:
        calls (int): Number of calls allowed in the period
        period (int): Time period in seconds
    """
    def decorator(func):
        # Store last request timestamps
        timestamps = []
        
        @wraps(func)
        def wrapper(*args, **kwargs):
            now = time.time()
            # Remove timestamps outside the window
            while timestamps and now - timestamps[0] > period:
                timestamps.pop(0)
            
            if len(timestamps) >= calls:
                sleep_time = timestamps[0] + period - now
                if sleep_time > 0:
                    logger.warning(f"Rate limit reached. Waiting {sleep_time:.2f} seconds")
                    time.sleep(sleep_time)
                    timestamps.pop(0)
            
            timestamps.append(now)
            return func(*args, **kwargs)
        return wrapper
    return decorator

class SAMAPIClient:
    """Client for interacting with the SAM.gov Contract Opportunities API.
    
    Rate Limits (System Account):
        - 100,000 requests per day
        - 60 requests per minute
    """
    
    def __init__(self, api_key: str):
        """Initialize the SAM API client with authentication."""
        self.api_key = api_key
        self.base_url = "https://api.sam.gov/opportunities/v2"
        self.desc_url = "https://api.sam.gov/opportunities/v1"
        self.resources_url = "https://api.sam.gov/opportunities/v3"
        self._cache = {}
        self._last_update = None
        self._next_update = get_next_update_time()
        logger.info("SAM API client initialized with System Account limits")
    
    def _build_headers(self) -> Dict[str, str]:
        """Build request headers including authentication."""
        return {
            "accept": "application/json",
            "Content-Type": "application/json",
            "X-Api-Key": self.api_key
        }

    def _format_date(self, date_str: Optional[str] = None) -> str:
        """
        Format date string to MM/dd/yyyy format required by SAM.gov API.
        If no date provided, returns current date.
        """
        if date_str:
            # Try to parse the input date string
            try:
                date = datetime.strptime(date_str, "%Y-%m-%d")
            except ValueError:
                try:
                    date = datetime.strptime(date_str, "%m/%d/%Y")
                except ValueError:
                    raise ValueError("Invalid date format. Expected YYYY-MM-DD or MM/dd/yyyy")
        else:
            date = datetime.now()
        
        return date.strftime("%m/%d/%Y")
    
    @rate_limit(calls=60, period=60)  # 60 calls per minute
    def search_opportunities(
        self,
        keyword: Optional[str] = None,
        naics_code: Optional[str] = None,
        set_aside: Optional[str] = None,
        status: Optional[str] = None,
        page: int = 1,
        limit: int = 10,
        posted_from: Optional[str] = None,
        posted_to: Optional[str] = None,
        organization_id: Optional[str] = None,
        organization_name: Optional[str] = None,
        place_of_performance_state: Optional[str] = None,
        place_of_performance_zipcode: Optional[str] = None
    ) -> Dict:
        """
        Search contract opportunities with optional filters and caching based on SAM.gov's update schedule.
        
        Args:
            keyword: Search term
            naics_code: NAICS code to filter by
            set_aside: Set-aside type (e.g., 'SBA', 'WOSB')
            status: Opportunity status
            page: Page number for pagination
            limit: Number of results per page
            posted_from: Start date (YYYY-MM-DD or MM/dd/yyyy)
            posted_to: End date (YYYY-MM-DD or MM/dd/yyyy)
            organization_id: Filter by organization ID
            organization_name: Filter by organization name
            place_of_performance_state: Filter by state code
            place_of_performance_zipcode: Filter by ZIP code
            
        Returns:
            Dict containing opportunities and metadata
        """
        cache_key = f"search:{keyword}:{naics_code}:{set_aside}:{status}:{page}:{limit}:{posted_from}:{posted_to}:{organization_id}:{organization_name}:{place_of_performance_state}:{place_of_performance_zipcode}"
        current_time = time.time()
        
        # Check if we need to refresh cache
        if (cache_key not in self._cache or 
            current_time - self._cache[cache_key]['timestamp'] > get_cache_ttl() or
            datetime.now(pytz.timezone('US/Eastern')) >= self._next_update):
            
            # Update next update time if we've passed it
            if datetime.now(pytz.timezone('US/Eastern')) >= self._next_update:
                self._next_update = get_next_update_time()
            
            # Make API call and cache results
            try:
                # Format dates
                if not posted_from or not posted_to:
                    end_date = datetime.now()
                    start_date = end_date - timedelta(days=90)
                    posted_from = start_date.strftime("%m/%d/%Y")
                    posted_to = end_date.strftime("%m/%d/%Y")
                else:
                    posted_from = self._format_date(posted_from)
                    posted_to = self._format_date(posted_to)
                
                params = {
                    "limit": str(limit),
                    "offset": str((page - 1) * limit),
                    "postedFrom": posted_from,
                    "postedTo": posted_to,
                    "active": "true"
                }
                
                # Add optional filters
                if keyword:
                    params["q"] = keyword
                if naics_code:
                    params["naicsCodes"] = naics_code
                if set_aside:
                    params["setAsides"] = set_aside
                if status:
                    params["type"] = status
                if organization_id:
                    params["organizationId"] = organization_id
                if organization_name:
                    params["organizationName"] = organization_name
                if place_of_performance_state:
                    params["placeOfPerformanceState"] = place_of_performance_state
                if place_of_performance_zipcode:
                    params["placeOfPerformanceZipcode"] = place_of_performance_zipcode
                
                logger.info(f"Searching opportunities with params: {params}")
                
                response = requests.get(
                    f"{self.base_url}/search",
                    headers=self._build_headers(),
                    params=params,
                    timeout=10
                )
                
                if response.status_code == 400:
                    error_msg = response.json().get("errorMessage", "Unknown error")
                    logger.error(f"SAM.gov API error: {error_msg}")
                    raise ValueError(error_msg)
                
                response.raise_for_status()
                data = response.json()
                
                # Updated response parsing based on actual SAM.gov API response structure
                opportunities = data.get("opportunitiesData", [])
                if isinstance(opportunities, dict):
                    opportunities = [opportunities]
                
                self._cache[cache_key] = {
                    'data': {
                        "opportunities": opportunities,
                        "metadata": {
                            "total": data.get("totalRecords", 0),
                            "page": page,
                            "limit": limit
                        }
                    },
                    'timestamp': current_time
                }
            except requests.exceptions.RequestException as e:
                logger.error(f"Error searching opportunities: {str(e)}")
                raise
            except ValueError as e:
                logger.error(f"Invalid request: {str(e)}")
                raise
        
        return self._cache[cache_key]['data']
    
    @rate_limit(calls=60, period=60)  # 60 calls per minute
    def get_opportunity(self, notice_id: str) -> Dict:
        """
        Get detailed information about a specific opportunity.
        
        Args:
            notice_id: The unique identifier of the opportunity
            
        Returns:
            Dict containing opportunity details
        """
        try:
            logger.info(f"Getting opportunity details for notice ID: {notice_id}")
            
            # Updated URL to use search endpoint with notice ID
            params = {
                "noticeid": notice_id,
                "limit": "1"
            }
            
            response = requests.get(
                f"{self.base_url}/search",
                headers=self._build_headers(),
                params=params,
                timeout=10
            )
            
            if response.status_code == 400:
                error_msg = response.json().get("errorMessage", "Unknown error")
                logger.error(f"SAM.gov API error: {error_msg}")
                raise ValueError(error_msg)
            
            response.raise_for_status()
            data = response.json()
            
            # Extract the first (and should be only) opportunity
            opportunities = data.get("opportunitiesData", [])
            if not opportunities:
                raise ValueError(f"Opportunity {notice_id} not found")
            
            return opportunities[0]
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error getting opportunity details: {str(e)}")
            raise
        except ValueError as e:
            logger.error(f"Invalid request: {str(e)}")
            raise

    @rate_limit(calls=60, period=60)  # 60 calls per minute
    def get_opportunity_description(self, notice_id: str) -> str:
        """
        Get the full description text of an opportunity.
        
        Args:
            notice_id: The unique identifier of the opportunity
            
        Returns:
            String containing the full description
        """
        try:
            logger.info(f"Getting description for notice ID: {notice_id}")
            
            response = requests.get(
                f"{self.desc_url}/noticedesc",
                headers=self._build_headers(),
                params={"noticeid": notice_id},
                timeout=10
            )
            
            if response.status_code == 400:
                error_msg = response.json().get("errorMessage", "Unknown error")
                logger.error(f"SAM.gov API error: {error_msg}")
                raise ValueError(error_msg)
            
            response.raise_for_status()
            data = response.json()
            
            return data.get("description", "")
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error getting opportunity description: {str(e)}")
            raise
        except ValueError as e:
            logger.error(f"Invalid request: {str(e)}")
            raise

    @rate_limit(calls=60, period=60)  # 60 calls per minute
    def get_resource_file(self, resource_id: str) -> bytes:
        """
        Download a resource file associated with an opportunity.
        
        Args:
            resource_id: The unique identifier of the resource file
            
        Returns:
            Bytes containing the file content
        """
        try:
            logger.info(f"Downloading resource file: {resource_id}")
            
            response = requests.get(
                f"{self.resources_url}/resources/files/{resource_id}/download",
                headers=self._build_headers(),
                timeout=10
            )
            
            if response.status_code == 400:
                error_msg = response.json().get("errorMessage", "Unknown error")
                logger.error(f"SAM.gov API error: {error_msg}")
                raise ValueError(error_msg)
            
            response.raise_for_status()
            return response.content
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error downloading resource file: {str(e)}")
            raise
        except ValueError as e:
            logger.error(f"Invalid request: {str(e)}")
            raise

    @rate_limit(calls=60, period=60)  # 60 calls per minute
    def get_organizations(self) -> List[Dict]:
        """
        Get a list of organizations that post opportunities.
        
        Returns:
            List of organization dictionaries
        """
        try:
            logger.info("Getting organizations list")
            
            # Calculate date range (last 90 days)
            end_date = datetime.now()
            start_date = end_date - timedelta(days=90)
            
            # Use the search endpoint with specific parameters to get organizations
            params = {
                "limit": "100",
                "organizationHierarchy": "true",
                "postedFrom": start_date.strftime("%m/%d/%Y"),
                "postedTo": end_date.strftime("%m/%d/%Y")
            }
            
            response = requests.get(
                f"{self.base_url}/search",
                headers=self._build_headers(),
                params=params,
                timeout=10
            )
            
            if response.status_code == 400:
                error_msg = response.json().get("errorMessage", "Unknown error")
                logger.error(f"SAM.gov API error: {error_msg}")
                raise ValueError(error_msg)
            
            response.raise_for_status()
            data = response.json()
            
            # Extract unique organizations from the search results
            opportunities = data.get("opportunitiesData", [])
            organizations = {}
            for opp in opportunities:
                org_id = opp.get("organizationId")  
                if org_id and org_id not in organizations:
                    organizations[org_id] = {
                        "id": org_id,
                        "name": opp.get("organizationName"),  
                        "type": opp.get("organizationType")
                    }
            
            return list(organizations.values())
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error getting organizations: {str(e)}")
            raise
        except ValueError as e:
            logger.error(f"Invalid request: {str(e)}")
            raise

    @rate_limit(calls=60, period=60)  # 60 calls per minute
    def get_setasides(self) -> List[Dict]:
        """
        Get a list of valid set-aside types and codes.
        
        Returns:
            List of set-aside dictionaries
        """
        try:
            logger.info("Getting set-aside types")
            
            # Calculate date range (last 90 days)
            end_date = datetime.now()
            start_date = end_date - timedelta(days=90)
            
            # Use the search endpoint with specific parameters to get set-asides
            params = {
                "limit": "100",
                "postedFrom": start_date.strftime("%m/%d/%Y"),
                "postedTo": end_date.strftime("%m/%d/%Y")
            }
            
            response = requests.get(
                f"{self.base_url}/search",
                headers=self._build_headers(),
                params=params,
                timeout=10
            )
            
            if response.status_code == 400:
                error_msg = response.json().get("errorMessage", "Unknown error")
                logger.error(f"SAM.gov API error: {error_msg}")
                raise ValueError(error_msg)
            
            response.raise_for_status()
            data = response.json()
            
            # Extract unique set-asides from the search results
            opportunities = data.get("opportunitiesData", [])
            setasides = {}
            for opp in opportunities:
                setaside = opp.get("typeOfSetAside")
                description = opp.get("typeOfSetAsideDescription")
                if setaside and setaside not in setasides:
                    setasides[setaside] = {
                        "code": setaside,
                        "description": description or setaside  
                    }
            
            return list(setasides.values())
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error getting set-aside types: {str(e)}")
            raise
        except ValueError as e:
            logger.error(f"Invalid request: {str(e)}")
            raise
