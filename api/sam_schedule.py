"""
SAM.gov API Schedule Information and Utilities

SAM.gov Updates Schedule:
- New opportunities are posted throughout the business day
- Main bulk update: 9:00 PM - 5:00 AM Eastern Time
- Complete data refresh occurs during overnight hours
"""

from datetime import datetime, time
import pytz

def is_bulk_update_time():
    """
    Check if current time is during SAM.gov's bulk update window (9 PM - 5 AM ET)
    """
    eastern = pytz.timezone('US/Eastern')
    now = datetime.now(eastern)
    current_time = now.time()
    
    # Define update window
    update_start = time(21, 0)  # 9 PM ET
    update_end = time(5, 0)    # 5 AM ET
    
    # Check if current time is in update window
    # Note: Special handling for overnight window
    if update_start <= current_time or current_time <= update_end:
        return True
    return False

def get_next_update_time():
    """
    Get the next scheduled bulk update time in Eastern Time
    """
    eastern = pytz.timezone('US/Eastern')
    now = datetime.now(eastern)
    update_time = time(21, 0)  # 9 PM ET
    
    next_update = datetime.combine(now.date(), update_time)
    if now.time() >= update_time:
        # If we're past today's update time, get tomorrow's
        next_update = next_update.replace(day=next_update.day + 1)
    
    return next_update.astimezone(eastern)

def get_cache_ttl():
    """
    Get appropriate cache TTL based on time of day
    During business hours: 5 minutes
    During update hours: 1 hour
    """
    if is_bulk_update_time():
        return 3600  # 1 hour during update window
    return 300      # 5 minutes during business hours
