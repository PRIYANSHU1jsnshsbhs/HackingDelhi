from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url, tlsAllowInvalidCertificates=True)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# AI Verification Model
class AIVerification(BaseModel):
    incomeStatus: str
    confidence: int
    conflictDetected: bool

# Blockchain Receipt Model
class BlockchainReceipt(BaseModel):
    transactionHash: str
    timestamp: str
    status: str  # 'Anchored' or 'Pending'

# Citizen Data Model (Survey)
class CitizenDataCreate(BaseModel):
    id: str
    name: str
    age: str
    sex: str
    caste: str
    income: str
    voiceNote: Optional[str] = None
    photoBase64: Optional[str] = None
    aiVerification: AIVerification
    blockchainReceipt: BlockchainReceipt
    createdAt: str

class CitizenData(CitizenDataCreate):
    synced: bool = True
    syncedAt: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.model_dump())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Citizen Survey Endpoints
@api_router.post("/surveys", response_model=CitizenData)
async def create_citizen_survey(input: CitizenDataCreate):
    """Submit a new citizen survey from mobile app"""
    survey_dict = input.model_dump()
    survey_obj = CitizenData(**survey_dict)
    
    # Check if survey with this id already exists
    existing = await db.citizen_surveys.find_one({"id": survey_obj.id})
    if existing:
        raise HTTPException(status_code=400, detail="Survey with this ID already exists")
    
    await db.citizen_surveys.insert_one(survey_obj.model_dump())
    logger.info(f"New citizen survey submitted: {survey_obj.id} for {survey_obj.name}")
    return survey_obj

@api_router.post("/surveys/bulk", response_model=List[CitizenData])
async def create_citizen_surveys_bulk(surveys: List[CitizenDataCreate]):
    """Submit multiple citizen surveys at once (for offline sync)"""
    results = []
    for survey_input in surveys:
        survey_dict = survey_input.model_dump()
        survey_obj = CitizenData(**survey_dict)
        
        # Skip if already exists
        existing = await db.citizen_surveys.find_one({"id": survey_obj.id})
        if existing:
            results.append(CitizenData(**existing))
            continue
            
        await db.citizen_surveys.insert_one(survey_obj.model_dump())
        results.append(survey_obj)
        logger.info(f"Bulk sync - survey submitted: {survey_obj.id} for {survey_obj.name}")
    
    return results

@api_router.get("/surveys", response_model=List[CitizenData])
async def get_citizen_surveys():
    """Get all citizen surveys"""
    surveys = await db.citizen_surveys.find().to_list(1000)
    return [CitizenData(**survey) for survey in surveys]

@api_router.get("/surveys/{survey_id}", response_model=CitizenData)
async def get_citizen_survey(survey_id: str):
    """Get a specific citizen survey by ID"""
    survey = await db.citizen_surveys.find_one({"id": survey_id})
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    return CitizenData(**survey)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
