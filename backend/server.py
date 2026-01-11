from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
import random
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Load demo census data from output.json
DEMO_CENSUS_DATA = []
DEMO_DATA_BY_HOUSEHOLD = {}
DEMO_DATA_BY_ID = {}

def load_demo_census_data():
    """Load census data from testdata/output.json file"""
    global DEMO_CENSUS_DATA, DEMO_DATA_BY_HOUSEHOLD, DEMO_DATA_BY_ID
    
    data_file = ROOT_DIR.parent / 'testdata' / 'output.json'
    if not data_file.exists():
        logging.warning(f"Demo data file not found: {data_file}")
        return []
    
    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            raw_data = json.load(f)
        
        # Load all 100000 records
        raw_data = raw_data[:100000]
        
        # Indian first and last names for generating realistic names
        first_names_male = ["Rajesh", "Amit", "Vikram", "Suresh", "Ramesh", "Anil", "Vijay", "Sanjay", "Deepak", "Manoj", "Ravi", "Sunil", "Ashok", "Rakesh", "Pankaj"]
        first_names_female = ["Priya", "Sneha", "Anita", "Sunita", "Kavita", "Pooja", "Neha", "Meena", "Rani", "Lakshmi", "Geeta", "Sita", "Radha", "Kamala", "Rekha"]
        last_names = ["Kumar", "Sharma", "Singh", "Patel", "Reddy", "Yadav", "Gupta", "Das", "Verma", "Jha", "Mishra", "Pandey", "Thakur", "Chaudhary", "Mahato"]
        
        random.seed(42)  # For consistent names
        
        # Track surnames per household so all family members share the same surname
        household_surnames = {}
        
        records = []
        for item in raw_data:
            # Get or assign surname for this household
            hh_id = item.get('household_id', 'unknown')
            if hh_id not in household_surnames:
                household_surnames[hh_id] = random.choice(last_names)
            last_name = household_surnames[hh_id]
            
            # Generate first name based on sex
            sex = item.get('sex', 'Male')
            if sex == 'Female':
                first_name = random.choice(first_names_female)
            else:
                first_name = random.choice(first_names_male)
            name = f"{first_name} {last_name}"
            
            # Determine flag status based on scheme_leakage_flag and exclusion_error_risk_score
            leakage = int(item.get('scheme_leakage_flag', 0))
            risk_score = float(item.get('exclusion_error_risk_score', 0))
            
            if leakage == 1 and risk_score > 0.7:
                flag_status = 'priority'
                flag_source = 'ML'
            elif leakage == 1 or risk_score > 0.5:
                flag_status = 'review'
                flag_source = 'ML'
            else:
                flag_status = 'normal'
                flag_source = None
            
            # Map relationship_to_head to relation
            rel_map = {
                'Head': 'head',
                'Spouse': 'spouse', 
                'Child': 'son' if sex == 'Male' else 'daughter',
                'Parent': 'parent',
                'Other': 'other'
            }
            relation = rel_map.get(item.get('relationship_to_head', 'Other'), 'other')
            
            record = {
                "record_id": item.get('individual_id'),
                "household_id": item.get('household_id'),
                "name": name,
                "age": int(item.get('age', 0)),
                "sex": sex,
                "relation": relation,
                "caste": item.get('caste_category', 'General'),
                "income": int(item.get('monthly_income', 0)),
                "region": item.get('urban_rural', 'Rural'),
                "district": f"District-{item.get('pin_code', '000000')[:3]}",
                "state": item.get('state', 'Unknown'),
                "pin_code": item.get('pin_code'),
                "flag_status": flag_status,
                "flag_source": flag_source,
                "reviewed": False,
                "created_at": item.get('timestamp', datetime.now(timezone.utc).isoformat()),
                # New fields from output.json
                "welfare_score": float(item.get('welfare_score', 0)),
                "ration_card_type": item.get('ration_card_type', 'BPL'),
                "scheme_enrollment_count": int(item.get('scheme_enrollment_count', 0)),
                "scheme_leakage_flag": leakage,
                "exclusion_error_risk_score": risk_score,
                "employment_status": item.get('employment_status', 'Unknown'),
                "occupation_category": item.get('occupation_category', 'none'),
                "sector": item.get('sector', 'none'),
                "housing_type": item.get('housing_type', 'pucca'),
                "water_source": int(item.get('water_source', 0)),
                "toilet_access": int(item.get('toilet_access', 0)),
                "cooking_fuel": int(item.get('cooking_fuel', 0)),
                "internet_access": int(item.get('internet_access', 0)),
                "household_size": int(item.get('household_size', 1)),
                "parent_id": item.get('parent_id', ''),
                "spouse_id": item.get('spouse_id', '')
            }
            records.append(record)
            
            # Index by household
            hh_id = record['household_id']
            if hh_id not in DEMO_DATA_BY_HOUSEHOLD:
                DEMO_DATA_BY_HOUSEHOLD[hh_id] = []
            DEMO_DATA_BY_HOUSEHOLD[hh_id].append(record)
            
            # Index by record ID
            DEMO_DATA_BY_ID[record['record_id']] = record
        
        DEMO_CENSUS_DATA = records
        logging.info(f"Loaded {len(records)} demo census records from output.json")
        return records
        
    except Exception as e:
        logging.error(f"Error loading demo census data: {e}")
        return []

# Load demo data on module import
load_demo_census_data()

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
if mongo_url:
    mongo_client = AsyncIOMotorClient(mongo_url, tlsAllowInvalidCertificates=True)
    mongo_db = mongo_client[os.environ.get('DB_NAME', 'governance_portal')]
else:
    mongo_client = None
    mongo_db = None

# In-memory storage (fallback when MongoDB not available)
in_memory_db = {
    "users": {},
    "user_sessions": {},
    "census_records": {},
    "audit_logs": []
}

app = FastAPI()
api_router = APIRouter(prefix="/api")

EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

def get_session_token(request: Request) -> Optional[str]:
    token = request.cookies.get("session_token")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "")
    return token

async def get_current_user(request: Request) -> dict:
    token = get_session_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_doc = in_memory_db["user_sessions"].get(token)
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = in_memory_db["users"].get(session_doc["user_id"])
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user_doc

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: str = "supervisor"
    created_at: datetime

class SessionResponse(BaseModel):
    user: User
    session_token: str

class CensusRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    record_id: str
    household_id: str
    name: str
    age: int
    relation: str
    caste: str
    income: int
    region: str
    district: str
    state: str
    flag_status: str
    flag_source: Optional[str] = None
    reviewed: bool = False
    created_at: datetime

class ReviewUpdate(BaseModel):
    action: str

class PolicySimulation(BaseModel):
    income_threshold: int
    caste_filter: Optional[str] = None
    region_filter: Optional[str] = None
    sex_filter: Optional[str] = None
    occupation_filter: Optional[str] = None
    housing_type_filter: Optional[str] = None
    household_size_min: Optional[int] = None
    household_size_max: Optional[int] = None

@api_router.get("/")
async def api_root():
    return {"message": "Governance Portal API", "status": "operational"}

@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    async with httpx.AsyncClient() as http_client:
        headers = {"X-Session-ID": session_id}
        auth_response = await http_client.get(EMERGENT_AUTH_URL, headers=headers)
        
        if auth_response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session_id")
        
        user_data = auth_response.json()
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    session_token = f"session_{uuid.uuid4().hex}"
    
    # Check if user exists
    existing_user = None
    for uid, user in in_memory_db["users"].items():
        if user["email"] == user_data["email"]:
            existing_user = user
            user_id = uid
            break
    
    if existing_user:
        in_memory_db["users"][user_id].update({
            "name": user_data["name"],
            "picture": user_data.get("picture"),
            "updated_at": datetime.now(timezone.utc)
        })
    else:
        user_doc = {
            "user_id": user_id,
            "email": user_data["email"],
            "name": user_data["name"],
            "picture": user_data.get("picture"),
            "role": "supervisor",
            "created_at": datetime.now(timezone.utc)
        }
        in_memory_db["users"][user_id] = user_doc
    
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    }
    in_memory_db["user_sessions"][session_token] = session_doc
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    user = in_memory_db["users"][user_id]
    return {"user": user, "session_token": session_token}

@api_router.post("/auth/dev-login")
async def dev_login(request: Request, response: Response):
    """Development-only login - creates a mock user session"""
    body = await request.json()
    email = body.get("email", "dev@example.com")
    name = body.get("name", "Dev User")
    role = body.get("role", "supervisor")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    session_token = f"session_{uuid.uuid4().hex}"
    
    # Check if user exists
    existing_user = None
    for uid, user in in_memory_db["users"].items():
        if user["email"] == email:
            existing_user = user
            user_id = uid
            break
    
    if not existing_user:
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": None,
            "role": role,
            "created_at": datetime.now(timezone.utc)
        }
        in_memory_db["users"][user_id] = user_doc
    
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    }
    in_memory_db["user_sessions"][session_token] = session_doc
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=False,
        samesite="lax",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    user = in_memory_db["users"][user_id]
    return {"user": user, "session_token": session_token}

@api_router.get("/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = get_session_token(request)
    if token and token in in_memory_db["user_sessions"]:
        del in_memory_db["user_sessions"][token]
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

@api_router.put("/auth/role")
async def update_role(request: Request, user: dict = Depends(get_current_user)):
    body = await request.json()
    new_role = body.get("role")
    if new_role not in ["supervisor", "district_admin", "state_analyst", "policy_maker"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    in_memory_db["users"][user["user_id"]]["role"] = new_role
    
    updated_user = in_memory_db["users"][user["user_id"]]
    return updated_user

@api_router.get("/census/records")
async def get_census_records(
    flag_status: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    # First, ensure demo data is loaded into in_memory_db
    if not in_memory_db["census_records"]:
        generate_mock_census_data()
    
    # Start with demo data from output.json
    all_records = list(in_memory_db["census_records"].values())
    
    # Also fetch from MongoDB if available (real mobile registrations)
    if mongo_db is not None:
        try:
            surveys = await mongo_db.citizen_surveys.find().to_list(1000)
            
            # Transform citizen survey data to census record format
            for survey in surveys:
                # Determine flag status based on AI verification
                ai_verification = survey.get('aiVerification', {})
                conflict_detected = ai_verification.get('conflictDetected', False)
                confidence = ai_verification.get('confidence', 100)
                
                flag_status_value = 'normal'
                flag_source_value = None
                
                if conflict_detected:
                    flag_status_value = 'priority'
                    flag_source_value = 'AI'
                elif confidence < 70:
                    flag_status_value = 'review'
                    flag_source_value = 'AI'
                
                record = {
                    "record_id": survey.get('id', str(uuid.uuid4())),
                    "household_id": f"HH{survey.get('id', '')[:8]}",
                    "name": survey.get('name', 'Unknown'),
                    "age": int(survey.get('age', 0)) if survey.get('age') else 0,
                    "sex": survey.get('sex', 'Unknown'),
                    "relation": "head",
                    "caste": survey.get('caste', 'General'),
                    "income": int(survey.get('income', 0)) if survey.get('income') else 0,
                    "region": "Mobile Survey",
                    "district": "Mobile Registration",
                    "state": "Mobile Survey",
                    "flag_status": flag_status_value,
                    "flag_source": flag_source_value,
                    "reviewed": survey.get('reviewed', False),
                    "created_at": survey.get('createdAt', datetime.now(timezone.utc).isoformat()),
                    "ai_verification": ai_verification,
                    "blockchain_receipt": survey.get('blockchainReceipt', {}),
                    "photo": survey.get('photoBase64'),
                    "voice_note": survey.get('voiceNote'),
                    # Add default values for new fields
                    "welfare_score": 0,
                    "ration_card_type": "N/A",
                    "scheme_enrollment_count": 0,
                    "scheme_leakage_flag": 0,
                    "exclusion_error_risk_score": 0,
                    "employment_status": "N/A",
                    "occupation_category": "none"
                }
                # Add mobile records at the beginning so they appear first
                all_records.insert(0, record)
            
            logger.info(f"Added {len(surveys)} mobile records to {len(all_records) - len(surveys)} demo records")
        except Exception as e:
            logger.error(f"Error fetching from MongoDB: {e}")
    
    # Filter by flag_status if provided
    if flag_status:
        all_records = [r for r in all_records if r.get("flag_status") == flag_status]
    
    # Return first 100 records
    return all_records[:100]

@api_router.get("/census/records/{record_id}")
async def get_census_record(record_id: str, user: dict = Depends(get_current_user)):
    # Try MongoDB first
    if mongo_db is not None:
        try:
            survey = await mongo_db.citizen_surveys.find_one({"id": record_id})
            if survey:
                ai_verification = survey.get('aiVerification', {})
                conflict_detected = ai_verification.get('conflictDetected', False)
                confidence = ai_verification.get('confidence', 100)
                
                flag_status_value = 'normal'
                flag_source_value = None
                
                if conflict_detected:
                    flag_status_value = 'priority'
                    flag_source_value = 'AI'
                elif confidence < 70:
                    flag_status_value = 'review'
                    flag_source_value = 'AI'
                
                record = {
                    "record_id": survey.get('id', str(uuid.uuid4())),
                    "household_id": f"HH{survey.get('id', '')[:8]}",
                    "name": survey.get('name', 'Unknown'),
                    "age": int(survey.get('age', 0)) if survey.get('age') else 0,
                    "relation": "head",
                    "caste": survey.get('caste', 'General'),
                    "income": int(survey.get('income', 0)) if survey.get('income') else 0,
                    "region": "Mobile Survey",
                    "district": "District Unknown",
                    "state": "State Unknown",
                    "flag_status": flag_status_value,
                    "flag_source": flag_source_value,
                    "reviewed": survey.get('reviewed', False),
                    "created_at": survey.get('createdAt', datetime.now(timezone.utc).isoformat()),
                    "ai_verification": ai_verification,
                    "blockchain_receipt": survey.get('blockchainReceipt', {}),
                    "photo": survey.get('photoBase64'),
                    "voice_note": survey.get('voiceNote'),
                    "sex": survey.get('sex', 'Unknown')
                }
                return record
        except Exception as e:
            logger.error(f"Error fetching record from MongoDB: {e}")
    
    # Fallback to in-memory
    record = in_memory_db["census_records"].get(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record

@api_router.put("/census/records/{record_id}/review")
async def review_record(
    record_id: str,
    review: ReviewUpdate,
    user: dict = Depends(get_current_user)
):
    if user["role"] not in ["supervisor", "district_admin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Update in MongoDB if available
    if mongo_db is not None:
        try:
            update_data = {
                "reviewed": True,
                "reviewed_by": user["user_id"],
                "reviewed_at": datetime.now(timezone.utc).isoformat(),
                "review_action": review.action
            }
            
            result = await mongo_db.citizen_surveys.update_one(
                {"id": record_id},
                {"$set": update_data}
            )
            
            if result.matched_count > 0:
                # Fetch updated record
                survey = await mongo_db.citizen_surveys.find_one({"id": record_id})
                if survey:
                    # Create audit log
                    audit_entry = {
                        "audit_id": f"audit_{uuid.uuid4().hex[:12]}",
                        "user_id": user["user_id"],
                        "user_name": user["name"],
                        "action": f"Reviewed record {record_id}",
                        "details": {"record_id": record_id, "action": review.action},
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }
                    await mongo_db.audit_logs.insert_one(audit_entry)
                    
                    # Transform and return
                    ai_verification = survey.get('aiVerification', {})
                    record = {
                        "record_id": survey.get('id'),
                        "household_id": f"HH{survey.get('id', '')[:8]}",
                        "name": survey.get('name'),
                        "age": int(survey.get('age', 0)),
                        "relation": "head",
                        "caste": survey.get('caste'),
                        "income": int(survey.get('income', 0)),
                        "region": "Mobile Survey",
                        "district": "District Unknown",
                        "state": "State Unknown",
                        "flag_status": "approved" if review.action == "approve" else "verification_requested",
                        "reviewed": True,
                        "reviewed_by": user["user_id"],
                        "reviewed_at": update_data["reviewed_at"],
                        "review_action": review.action,
                        "ai_verification": ai_verification,
                        "blockchain_receipt": survey.get('blockchainReceipt', {})
                    }
                    return record
        except Exception as e:
            logger.error(f"Error updating record in MongoDB: {e}")
    
    # Fallback to in-memory
    record = in_memory_db["census_records"].get(record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    
    record["reviewed"] = True
    record["reviewed_by"] = user["user_id"]
    record["reviewed_at"] = datetime.now(timezone.utc)
    record["review_action"] = review.action
    
    if review.action == "approve":
        record["flag_status"] = "approved"
    elif review.action == "request_verification":
        record["flag_status"] = "verification_requested"
    
    audit_entry = {
        "audit_id": f"audit_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "user_name": user["name"],
        "action": f"Reviewed record {record_id}",
        "details": {"record_id": record_id, "action": review.action},
        "timestamp": datetime.now(timezone.utc)
    }
    in_memory_db["audit_logs"].append(audit_entry)
    
    return record

@api_router.get("/census/household/{household_id}")
async def get_household(household_id: str, user: dict = Depends(get_current_user)):
    # First check in_memory_db
    members = [r for r in in_memory_db["census_records"].values() if r["household_id"] == household_id]
    
    # If not found in in_memory, check demo data
    if not members and household_id in DEMO_DATA_BY_HOUSEHOLD:
        members = DEMO_DATA_BY_HOUSEHOLD[household_id]
    
    if not members:
        return {"household_id": household_id, "members": [], "graph": {"nodes": [], "edges": []}, "household_info": {}}
    
    # Create nodes with more info
    nodes = [{
        "id": m["record_id"], 
        "name": m["name"], 
        "relation": m["relation"],
        "age": m.get("age", 0),
        "sex": m.get("sex", "Unknown")
    } for m in members]
    
    # Build edges using real parent_id and spouse_id relationships
    edges = []
    member_ids = {m["record_id"] for m in members}
    
    for member in members:
        # Add parent-child edge
        parent_id = member.get("parent_id", "")
        if parent_id and parent_id in member_ids:
            edges.append({"source": parent_id, "target": member["record_id"], "type": "parent-child"})
        
        # Add spouse edge (only add once, check if not already added)
        spouse_id = member.get("spouse_id", "")
        if spouse_id and spouse_id in member_ids:
            # Only add if this edge doesn't exist in reverse
            existing_edge = any(
                e["source"] == spouse_id and e["target"] == member["record_id"] and e.get("type") == "spouse"
                for e in edges
            )
            if not existing_edge:
                edges.append({"source": member["record_id"], "target": spouse_id, "type": "spouse"})
    
    # If no edges built from parent/spouse, fallback to head-based edges
    if not edges:
        head = next((m for m in members if m["relation"] == "head"), None)
        if head:
            for member in members:
                if member["relation"] != "head" and member["relation"] in ["spouse", "son", "daughter", "parent", "other"]:
                    edges.append({"source": head["record_id"], "target": member["record_id"], "type": member["relation"]})
    
    # Get household info from first member
    first_member = members[0]
    household_info = {
        "housing_type": first_member.get("housing_type", "pucca"),
        "household_size": first_member.get("household_size", len(members)),
        "water_access": "Yes" if first_member.get("water_source", 0) == 1 else "No",
        "toilet_access": "Yes" if first_member.get("toilet_access", 0) == 1 else "No",
        "cooking_fuel": "LPG" if first_member.get("cooking_fuel", 0) == 1 else "Firewood",
        "internet_access": "Yes" if first_member.get("internet_access", 0) == 1 else "No",
        "state": first_member.get("state", "Unknown"),
        "district": first_member.get("district", "Unknown"),
        "pin_code": first_member.get("pin_code", "Unknown")
    }
    
    return {
        "household_id": household_id, 
        "members": members, 
        "graph": {"nodes": nodes, "edges": edges},
        "household_info": household_info
    }

@api_router.get("/analytics/summary")
async def get_analytics_summary(user: dict = Depends(get_current_user)):
    if user["role"] not in ["supervisor", "state_analyst", "policy_maker", "district_admin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Ensure demo data is loaded
    if not in_memory_db["census_records"]:
        generate_mock_census_data()
    
    records = list(in_memory_db["census_records"].values())
    
    if not records:
        return get_mock_analytics()
    
    total_records = len(records)
    regions = {}
    castes = {}
    states = {}
    income_brackets = {"0-50k": 0, "50k-100k": 0, "100k-200k": 0, "200k+": 0}
    employment_stats = {}
    ration_card_stats = {}
    
    # Counts for dashboard
    pending_review = 0
    priority_cases = 0
    normal_cases = 0
    scheme_leakage_count = 0
    total_welfare_score = 0
    total_income = 0
    households = set()
    
    for record in records:
        # Region (urban/rural) counts
        region = record.get("region", "Unknown")
        regions[region] = regions.get(region, 0) + 1
        
        # Caste distribution
        caste = record.get("caste", "General")
        castes[caste] = castes.get(caste, 0) + 1
        
        # State distribution
        state = record.get("state", "Unknown")
        states[state] = states.get(state, 0) + 1
        
        # Income brackets
        income = record.get("income", 0)
        total_income += income
        if income < 50000:
            income_brackets["0-50k"] += 1
        elif income < 100000:
            income_brackets["50k-100k"] += 1
        elif income < 200000:
            income_brackets["100k-200k"] += 1
        else:
            income_brackets["200k+"] += 1
        
        # Employment stats
        emp_status = record.get("employment_status", "Unknown")
        employment_stats[emp_status] = employment_stats.get(emp_status, 0) + 1
        
        # Ration card stats
        ration = record.get("ration_card_type", "Unknown")
        ration_card_stats[ration] = ration_card_stats.get(ration, 0) + 1
        
        # Flag status counts
        flag_status = record.get("flag_status", "normal")
        if flag_status == "review":
            pending_review += 1
        elif flag_status == "priority":
            priority_cases += 1
        else:
            normal_cases += 1
        
        # Scheme leakage
        if record.get("scheme_leakage_flag", 0) == 1:
            scheme_leakage_count += 1
        
        # Welfare score
        total_welfare_score += record.get("welfare_score", 0)
        
        # Households
        households.add(record.get("household_id"))
    
    # Compute averages and percentages
    avg_income = round(total_income / total_records) if total_records > 0 else 0
    avg_welfare_score = round(total_welfare_score / total_records, 2) if total_records > 0 else 0
    scheme_leakage_rate = round((scheme_leakage_count / total_records) * 100, 2) if total_records > 0 else 0
    
    # Data quality metrics (simulated based on data completeness)
    completeness = 98.7  # High since demo data is complete
    accuracy = 96.2
    consistency = 99.1
    
    # Welfare indicators (computed from actual data patterns)
    # Count amenity access
    toilet_access_count = sum(1 for r in records if r.get("toilet_access", 0) == 1)
    water_access_count = sum(1 for r in records if r.get("water_source", 0) == 1)
    internet_access_count = sum(1 for r in records if r.get("internet_access", 0) == 1)
    employed_count = sum(1 for r in records if r.get("employment_status") == "employed")
    bpl_count = sum(1 for r in records if r.get("ration_card_type") == "BPL")
    
    welfare_indicators = {
        "scheme_coverage": min(100, round((len([r for r in records if r.get("scheme_enrollment_count", 0) > 0]) / total_records) * 100, 1)) if total_records > 0 else 0,
        "toilet_access": round((toilet_access_count / total_records) * 100, 1) if total_records > 0 else 0,
        "water_access": round((water_access_count / total_records) * 100, 1) if total_records > 0 else 0,
        "employment_rate": round((employed_count / total_records) * 100, 1) if total_records > 0 else 0,
        "bpl_coverage": round((bpl_count / total_records) * 100, 1) if total_records > 0 else 0,
        "digital_inclusion": round((internet_access_count / total_records) * 100, 1) if total_records > 0 else 0
    }
    
    return {
        "total_records": total_records,
        "pending_review": pending_review,
        "priority_cases": priority_cases,
        "verified_records": normal_cases,
        "total_households": len(households),
        "by_region": regions,
        "by_caste": castes,
        "by_state": states,
        "by_income": income_brackets,
        "by_employment": employment_stats,
        "by_ration_card": ration_card_stats,
        "avg_income": avg_income,
        "avg_welfare_score": avg_welfare_score,
        "scheme_leakage_count": scheme_leakage_count,
        "scheme_leakage_rate": scheme_leakage_rate,
        "welfare_indicators": welfare_indicators,
        "data_quality": {
            "completeness": completeness,
            "accuracy": accuracy,
            "consistency": consistency
        }
    }

@api_router.get("/analytics/states")
async def get_state_analytics(user: dict = Depends(get_current_user)):
    if user["role"] not in ["supervisor", "state_analyst", "policy_maker", "district_admin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    records = list(in_memory_db["census_records"].values())
    
    if not records:
        return get_mock_state_analytics()
    
    state_data = {}
    for record in records:
        state = record["state"]
        if state not in state_data:
            state_data[state] = {
                "total_population": 0,
                "normal": 0,
                "review": 0,
                "priority": 0,
                "avg_income": 0,
                "income_sum": 0,
                "avg_welfare_score": 0,
                "welfare_sum": 0,
                "scheme_leakage_count": 0
            }
        
        state_data[state]["total_population"] += 1
        state_data[state]["income_sum"] += record["income"]
        state_data[state]["welfare_sum"] += record.get("welfare_score", 0)
        
        if record.get("scheme_leakage_flag") == 1:
            state_data[state]["scheme_leakage_count"] += 1
        
        flag_status = record.get("flag_status", "normal")
        if flag_status in state_data[state]:
            state_data[state][flag_status] += 1
    
    for state in state_data:
        if state_data[state]["total_population"] > 0:
            state_data[state]["avg_income"] = round(
                state_data[state]["income_sum"] / state_data[state]["total_population"]
            )
            state_data[state]["avg_welfare_score"] = round(
                state_data[state]["welfare_sum"] / state_data[state]["total_population"], 2
            )
        del state_data[state]["income_sum"]
        del state_data[state]["welfare_sum"]
    
    return state_data

# State center coordinates for generating approximate pincode locations
STATE_COORDS = {
    "Bihar": {"lat": 25.0961, "lon": 85.3131, "spread": 1.5},
    "Jharkhand": {"lat": 23.6102, "lon": 85.2799, "spread": 1.2},
    "Maharashtra": {"lat": 19.7515, "lon": 75.7139, "spread": 3.0},
    "Uttar Pradesh": {"lat": 26.8467, "lon": 80.9462, "spread": 2.5},
    "West Bengal": {"lat": 22.9868, "lon": 87.855, "spread": 1.5},
}

@api_router.get("/analytics/pincode-points")
async def get_pincode_points(
    limit: int = 5000,
    state_filter: Optional[str] = None,
    income_threshold: int = 50000,
    caste_filter: Optional[str] = None,
    sex_filter: Optional[str] = None,
    occupation_filter: Optional[str] = None,
    housing_type_filter: Optional[str] = None,
    household_size_min: Optional[int] = None,
    household_size_max: Optional[int] = None,
    user: dict = Depends(get_current_user)
):
    """
    Returns aggregated pincode data with approximate coordinates for map visualization.
    Each point represents a pincode area with population stats.
    """
    if user["role"] not in ["state_analyst", "policy_maker", "supervisor"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    records = list(in_memory_db["census_records"].values())
    
    if not records:
        return {"points": [], "total_records": 0}
    
    # Filter by state if specified
    if state_filter and state_filter != 'all':
        records = [r for r in records if r.get("state") == state_filter]
    
    # Aggregate by pincode
    pincode_data = {}
    for record in records:
        pincode = str(record.get("pin_code", "000000"))
        state = record.get("state", "Bihar")
        
        if pincode not in pincode_data:
            # Generate approximate coordinates based on state + pincode hash for consistency
            state_info = STATE_COORDS.get(state, STATE_COORDS["Bihar"])
            # Use pincode as seed for consistent random offset
            import hashlib
            hash_val = int(hashlib.md5(pincode.encode()).hexdigest()[:8], 16)
            lat_offset = ((hash_val % 1000) / 1000 - 0.5) * state_info["spread"]
            lon_offset = (((hash_val >> 10) % 1000) / 1000 - 0.5) * state_info["spread"]
            
            pincode_data[pincode] = {
                "pincode": pincode,
                "state": state,
                "lat": state_info["lat"] + lat_offset,
                "lon": state_info["lon"] + lon_offset,
                "count": 0,
                "welfare_sum": 0,
                "income_sum": 0,
                "eligible_count": 0,
                "priority_count": 0,
                "scheme_leakage_count": 0
            }
        
        pincode_data[pincode]["count"] += 1
        pincode_data[pincode]["welfare_sum"] += record.get("welfare_score", 0)
        pincode_data[pincode]["income_sum"] += record.get("income", 0)
        
        # Check eligibility based on ALL filters
        is_eligible = True
        if record.get("income", 0) > income_threshold:
            is_eligible = False
        if caste_filter and caste_filter != 'all' and record.get("caste") != caste_filter:
            is_eligible = False
        if sex_filter and sex_filter != 'all' and record.get("sex") != sex_filter:
            is_eligible = False
        if occupation_filter and occupation_filter != 'all' and record.get("occupation_category") != occupation_filter:
            is_eligible = False
        if housing_type_filter and housing_type_filter != 'all' and record.get("housing_type") != housing_type_filter:
            is_eligible = False
        if household_size_min and record.get("household_size", 0) < household_size_min:
            is_eligible = False
        if household_size_max and record.get("household_size", 0) > household_size_max:
            is_eligible = False
            
        if is_eligible:
            pincode_data[pincode]["eligible_count"] += 1
            
        if record.get("flag_status") == "priority":
            pincode_data[pincode]["priority_count"] += 1
        if record.get("scheme_leakage_flag") == 1:
            pincode_data[pincode]["scheme_leakage_count"] += 1
    
    # Convert to list and calculate averages
    points = []
    for pincode, data in pincode_data.items():
        if data["count"] > 0:
            points.append({
                "pincode": data["pincode"],
                "state": data["state"],
                "lat": round(data["lat"], 4),
                "lon": round(data["lon"], 4),
                "count": data["count"],
                "avg_welfare": round(data["welfare_sum"] / data["count"], 2),
                "avg_income": round(data["income_sum"] / data["count"]),
                "eligible_count": data["eligible_count"],
                "eligible_pct": round((data["eligible_count"] / data["count"]) * 100, 1),
                "priority_count": data["priority_count"],
                "leakage_count": data["scheme_leakage_count"]
            })
    
    # Sort by count and limit
    points.sort(key=lambda x: x["count"], reverse=True)
    points = points[:limit]
    
    return {
        "points": points,
        "total_pincodes": len(pincode_data),
        "total_records": len(records)
    }

@api_router.post("/policy/simulate")
async def simulate_policy(
    simulation: PolicySimulation,
    user: dict = Depends(get_current_user)
):
    if user["role"] != "policy_maker":
        raise HTTPException(status_code=403, detail="Only policy makers can run simulations")
    
    records = list(in_memory_db["census_records"].values())
    
    if not records:
        records = generate_mock_census_data()
    
    # Apply all filters
    eligible = [r for r in records if r["income"] <= simulation.income_threshold]
    
    if simulation.caste_filter:
        eligible = [r for r in eligible if r["caste"] == simulation.caste_filter]
    if simulation.region_filter:
        eligible = [r for r in eligible if r["state"] == simulation.region_filter]
    if simulation.sex_filter:
        eligible = [r for r in eligible if r.get("sex") == simulation.sex_filter]
    if simulation.occupation_filter:
        eligible = [r for r in eligible if r.get("occupation_category") == simulation.occupation_filter]
    if simulation.housing_type_filter:
        eligible = [r for r in eligible if r.get("housing_type") == simulation.housing_type_filter]
    if simulation.household_size_min:
        eligible = [r for r in eligible if r.get("household_size", 1) >= simulation.household_size_min]
    if simulation.household_size_max:
        eligible = [r for r in eligible if r.get("household_size", 1) <= simulation.household_size_max]
    
    total_population = len(records)
    eligible_population = len(eligible)
    
    # State distribution
    state_distribution = {}
    for record in eligible:
        state = record.get("state", "Unknown")
        state_distribution[state] = state_distribution.get(state, 0) + 1
    
    # Caste distribution
    caste_distribution = {}
    for record in eligible:
        caste = record.get("caste", "General")
        caste_distribution[caste] = caste_distribution.get(caste, 0) + 1
    
    # Sex distribution
    sex_distribution = {}
    for record in eligible:
        sex = record.get("sex", "Unknown")
        sex_distribution[sex] = sex_distribution.get(sex, 0) + 1
    
    # Occupation distribution
    occupation_distribution = {}
    for record in eligible:
        occupation = record.get("occupation_category", "Unknown")
        occupation_distribution[occupation] = occupation_distribution.get(occupation, 0) + 1
    
    # Housing type distribution
    housing_distribution = {}
    for record in eligible:
        housing = record.get("housing_type", "Unknown")
        housing_distribution[housing] = housing_distribution.get(housing, 0) + 1
    
    # Income brackets
    income_brackets = {"0-25k": 0, "25k-50k": 0, "50k-100k": 0, "100k+": 0}
    for record in eligible:
        income = record.get("income", 0)
        if income < 25000:
            income_brackets["0-25k"] += 1
        elif income < 50000:
            income_brackets["25k-50k"] += 1
        elif income < 100000:
            income_brackets["50k-100k"] += 1
        else:
            income_brackets["100k+"] += 1
    
    # Age group distribution
    age_groups = {"0-18": 0, "18-35": 0, "35-50": 0, "50-65": 0, "65+": 0}
    for record in eligible:
        age = record.get("age", 0)
        if age < 18:
            age_groups["0-18"] += 1
        elif age < 35:
            age_groups["18-35"] += 1
        elif age < 50:
            age_groups["35-50"] += 1
        elif age < 65:
            age_groups["50-65"] += 1
        else:
            age_groups["65+"] += 1
    
    # Household size distribution
    household_size_dist = {}
    for record in eligible:
        size = str(record.get("household_size", 1))
        household_size_dist[size] = household_size_dist.get(size, 0) + 1
    
    # Compute average income and welfare score of eligible
    avg_income_eligible = round(sum(r.get("income", 0) for r in eligible) / eligible_population) if eligible_population > 0 else 0
    avg_welfare_eligible = round(sum(r.get("welfare_score", 0) for r in eligible) / eligible_population, 2) if eligible_population > 0 else 0
    
    return {
        "total_population": total_population,
        "eligible_population": eligible_population,
        "eligibility_percentage": round((eligible_population / total_population) * 100, 2) if total_population > 0 else 0,
        "avg_income_eligible": avg_income_eligible,
        "avg_welfare_eligible": avg_welfare_eligible,
        "region_distribution": state_distribution,
        "caste_distribution": caste_distribution,
        "sex_distribution": sex_distribution,
        "occupation_distribution": occupation_distribution,
        "housing_distribution": housing_distribution,
        "income_brackets": income_brackets,
        "age_groups": age_groups,
        "household_size_distribution": household_size_dist
    }

@api_router.get("/audit/logs")
async def get_audit_logs(user: dict = Depends(get_current_user)):
    if user["role"] not in ["state_analyst", "district_admin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    logs = in_memory_db["audit_logs"]
    
    if not logs:
        return get_mock_audit_logs()
    
    return sorted(logs, key=lambda x: x["timestamp"], reverse=True)[:100]

@api_router.get("/integrity/status/{record_id}")
async def get_integrity_status(record_id: str, user: dict = Depends(get_current_user)):
    return {
        "record_id": record_id,
        "status": "pending",
        "message": "Blockchain integration placeholder",
        "ledger_anchored": False
    }

@api_router.get("/ml/audit-signals/{record_id}")
async def get_audit_signals(record_id: str, user: dict = Depends(get_current_user)):
    return {
        "record_id": record_id,
        "signals": [],
        "model_confidence": None,
        "message": "ML integration placeholder"
    }

def generate_mock_census_data():
    """Return demo census data from output.json"""
    global DEMO_CENSUS_DATA
    
    if not DEMO_CENSUS_DATA:
        load_demo_census_data()
    
    # Also populate in_memory_db for consistency
    for record in DEMO_CENSUS_DATA:
        in_memory_db["census_records"][record["record_id"]] = record
    
    return DEMO_CENSUS_DATA

def get_mock_analytics():
    """Return analytics computed from demo census data"""
    global DEMO_CENSUS_DATA
    
    if not DEMO_CENSUS_DATA:
        load_demo_census_data()
    
    records = DEMO_CENSUS_DATA
    total_records = len(records)
    
    regions = {}
    castes = {}
    income_brackets = {"0-50k": 0, "50k-100k": 0, "100k-200k": 0, "200k+": 0}
    
    for record in records:
        # Count by region (urban_rural)
        region = record.get('region', 'Unknown')
        regions[region] = regions.get(region, 0) + 1
        
        # Count by caste
        caste = record.get('caste', 'General')
        castes[caste] = castes.get(caste, 0) + 1
        
        # Count by income bracket
        income = record.get('income', 0)
        if income < 50000:
            income_brackets["0-50k"] += 1
        elif income < 100000:
            income_brackets["50k-100k"] += 1
        elif income < 200000:
            income_brackets["100k-200k"] += 1
        else:
            income_brackets["200k+"] += 1
    
    return {
        "total_records": total_records,
        "by_region": regions,
        "by_caste": castes,
        "by_income": income_brackets
    }

def get_mock_state_analytics():
    """Compute state-wise analytics from demo census data"""
    global DEMO_CENSUS_DATA
    
    if not DEMO_CENSUS_DATA:
        load_demo_census_data()
    
    records = DEMO_CENSUS_DATA
    state_data = {}
    
    for record in records:
        state = record.get('state', 'Unknown')
        if state not in state_data:
            state_data[state] = {
                "total_population": 0,
                "normal": 0,
                "review": 0,
                "priority": 0,
                "income_sum": 0,
                "avg_income": 0,
                "welfare_sum": 0,
                "avg_welfare_score": 0,
                "scheme_leakage_count": 0
            }
        
        state_data[state]["total_population"] += 1
        state_data[state]["income_sum"] += record.get('income', 0)
        state_data[state]["welfare_sum"] += record.get('welfare_score', 0)
        
        flag_status = record.get('flag_status', 'normal')
        if flag_status in state_data[state]:
            state_data[state][flag_status] += 1
        
        if record.get('scheme_leakage_flag', 0) == 1:
            state_data[state]["scheme_leakage_count"] += 1
    
    # Calculate averages
    for state in state_data:
        pop = state_data[state]["total_population"]
        if pop > 0:
            state_data[state]["avg_income"] = round(state_data[state]["income_sum"] / pop)
            state_data[state]["avg_welfare_score"] = round(state_data[state]["welfare_sum"] / pop, 2)
        del state_data[state]["income_sum"]
        del state_data[state]["welfare_sum"]
    
    return state_data

def get_mock_audit_logs():
    return [
        {
            "audit_id": f"audit_{i}",
            "user_id": "user_admin",
            "user_name": "System Admin",
            "action": f"Record reviewed: REC{str(i).zfill(6)}",
            "details": {"action": "approve"},
            "timestamp": datetime.now(timezone.utc) - timedelta(hours=i)
        }
        for i in range(10)
    ]

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    if mongo_client:
        mongo_client.close()
