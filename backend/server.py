from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

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
    # Fetch from MongoDB if available
    if mongo_db is not None:
        try:
            surveys = await mongo_db.citizen_surveys.find().to_list(1000)
            
            # Transform citizen survey data to census record format
            records = []
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
                    "relation": "head",  # Default relation
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
                records.append(record)
            
            # Filter by flag_status if provided
            if flag_status:
                records = [r for r in records if r.get("flag_status") == flag_status]
            
            logger.info(f"Fetched {len(records)} records from MongoDB")
            return records
        except Exception as e:
            logger.error(f"Error fetching from MongoDB: {e}")
            # Fall back to in-memory/mock data
    
    # Fallback to in-memory data
    records = list(in_memory_db["census_records"].values())
    
    if flag_status:
        records = [r for r in records if r.get("flag_status") == flag_status]
    
    if not records:
        mock_records = generate_mock_census_data()
        return mock_records[:100]
    
    return records[:100]

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
    members = [r for r in in_memory_db["census_records"].values() if r["household_id"] == household_id]
    
    if not members:
        return {"household_id": household_id, "members": [], "graph": {"nodes": [], "edges": []}}
    
    nodes = [{"id": m["record_id"], "name": m["name"], "relation": m["relation"]} for m in members]
    edges = []
    
    head = next((m for m in members if m["relation"] == "head"), None)
    if head:
        for member in members:
            if member["relation"] != "head" and member["relation"] in ["spouse", "son", "daughter", "parent"]:
                edges.append({"source": head["record_id"], "target": member["record_id"]})
    
    return {"household_id": household_id, "members": members, "graph": {"nodes": nodes, "edges": edges}}

@api_router.get("/analytics/summary")
async def get_analytics_summary(user: dict = Depends(get_current_user)):
    if user["role"] not in ["state_analyst", "policy_maker", "district_admin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    records = list(in_memory_db["census_records"].values())
    
    if not records:
        return get_mock_analytics()
    
    total_records = len(records)
    regions = {}
    castes = {}
    income_brackets = {"0-50k": 0, "50k-100k": 0, "100k-200k": 0, "200k+": 0}
    
    for record in records:
        regions[record["region"]] = regions.get(record["region"], 0) + 1
        castes[record["caste"]] = castes.get(record["caste"], 0) + 1
        
        income = record["income"]
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

@api_router.get("/analytics/states")
async def get_state_analytics(user: dict = Depends(get_current_user)):
    if user["role"] not in ["state_analyst", "policy_maker", "district_admin"]:
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
                "income_sum": 0
            }
        
        state_data[state]["total_population"] += 1
        state_data[state]["income_sum"] += record["income"]
        
        flag_status = record.get("flag_status", "normal")
        if flag_status in state_data[state]:
            state_data[state][flag_status] += 1
    
    for state in state_data:
        if state_data[state]["total_population"] > 0:
            state_data[state]["avg_income"] = round(
                state_data[state]["income_sum"] / state_data[state]["total_population"]
            )
        del state_data[state]["income_sum"]
    
    return state_data

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
    
    eligible = [r for r in records if r["income"] <= simulation.income_threshold]
    
    if simulation.caste_filter:
        eligible = [r for r in eligible if r["caste"] == simulation.caste_filter]
    if simulation.region_filter:
        eligible = [r for r in eligible if r["region"] == simulation.region_filter]
    
    total_population = len(records)
    eligible_population = len(eligible)
    
    region_distribution = {}
    for record in eligible:
        region = record["region"]
        region_distribution[region] = region_distribution.get(region, 0) + 1
    
    return {
        "total_population": total_population,
        "eligible_population": eligible_population,
        "eligibility_percentage": round((eligible_population / total_population) * 100, 2) if total_population > 0 else 0,
        "region_distribution": region_distribution
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
    regions = ["North", "South", "East", "West", "Central"]
    districts = ["District A", "District B", "District C", "District D"]
    states = [
        "Maharashtra", "Karnataka", "Tamil Nadu", "Gujarat", "Delhi",
        "Uttar Pradesh", "West Bengal", "Rajasthan", "Madhya Pradesh", "Kerala",
        "Andhra Pradesh", "Telangana", "Bihar", "Odisha", "Punjab",
        "Haryana", "Assam", "Jharkhand", "Uttarakhand", "Himachal Pradesh",
        "Chhattisgarh", "Goa", "Jammu and Kashmir", "Manipur", "Meghalaya"
    ]
    castes = ["General", "OBC", "SC", "ST"]
    relations = ["head", "spouse", "son", "daughter", "parent"]
    names = ["Rajesh Kumar", "Priya Sharma", "Amit Patel", "Sneha Reddy", "Vikram Singh"]
    
    records = []
    for i in range(50):
        household_id = f"HH{str(i // 3).zfill(4)}"
        record_id = f"REC{str(i).zfill(6)}"
        record = {
            "record_id": record_id,
            "household_id": household_id,
            "name": names[i % len(names)],
            "age": 25 + (i % 50),
            "relation": relations[i % len(relations)],
            "caste": castes[i % len(castes)],
            "income": 50000 + (i * 10000),
            "region": regions[i % len(regions)],
            "district": districts[i % len(districts)],
            "state": states[i % len(states)],
            "flag_status": "normal" if i % 5 != 0 else "review",
            "flag_source": "ML" if i % 5 == 0 else None,
            "reviewed": False,
            "created_at": datetime.now(timezone.utc)
        }
        records.append(record)
        in_memory_db["census_records"][record_id] = record
    
    return records

def get_mock_analytics():
    return {
        "total_records": 1500000,
        "by_region": {"North": 350000, "South": 400000, "East": 300000, "West": 250000, "Central": 200000},
        "by_caste": {"General": 600000, "OBC": 450000, "SC": 300000, "ST": 150000},
        "by_income": {"0-50k": 500000, "50k-100k": 450000, "100k-200k": 350000, "200k+": 200000}
    }

def get_mock_state_analytics():
    """Generate mock state-wise data for Indian states"""
    import random
    random.seed(42)
    
    states = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
        "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
        "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
        "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
        "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir"
    ]
    
    state_data = {}
    for state in states:
        base_pop = random.randint(50000, 500000)
        state_data[state] = {
            "total_population": base_pop,
            "normal": int(base_pop * random.uniform(0.75, 0.85)),
            "review": int(base_pop * random.uniform(0.10, 0.18)),
            "priority": int(base_pop * random.uniform(0.02, 0.07)),
            "avg_income": random.randint(40000, 150000)
        }
    
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
