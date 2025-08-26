from fastapi import APIRouter

router = APIRouter()

@router.get("/cors-test")
def cors_test():
    """Test endpoint to verify CORS is working"""
    return {"message": "CORS is working!", "status": "success"}
