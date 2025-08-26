from fastapi import APIRouter
from datetime import datetime
from logger import get_logs

router = APIRouter()

@router.get("/logs")
def get_logs_endpoint():
    """Get recent application logs for debugging"""
    logs_data = get_logs()
    logs_data["timestamp"] = datetime.now().isoformat()
    return logs_data
