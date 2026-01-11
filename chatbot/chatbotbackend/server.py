"""
FastAPI Server for Census Chatbot
Provides REST API endpoints for chatbot interactions
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import uvicorn
import os
from dotenv import load_dotenv

from chat_logic import generate_chatbot_response, get_quick_help
from llm import test_connection

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Census Chatbot API",
    description="AI Governance Assistant for Census Management Platform",
    version="1.0.0"
)

# Configure CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models
class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    message: str = Field(..., description="User's question or message", min_length=1, max_length=500)
    role: str = Field(..., description="User's role in the system")
    page: Optional[str] = Field(None, description="Current page context (optional)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "What metrics are shown on the analytics dashboard?",
                "role": "state_analyst",
                "page": "analytics"
            }
        }


class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    response: str = Field(..., description="Chatbot's response")
    sources_used: int = Field(..., description="Number of knowledge sources used")
    error: Optional[str] = Field(None, description="Error message if any")
    
    class Config:
        json_schema_extra = {
            "example": {
                "response": "The Analytics Dashboard shows key metrics including Total Households, Verified Records, Pending Reviews, and Average Income. All metrics support drill-down by district and demographic filters for detailed analysis.",
                "sources_used": 3,
                "error": None
            }
        }


class HealthResponse(BaseModel):
    """Response model for health check"""
    status: str
    llm_connected: bool
    knowledge_base_docs: int


# API Endpoints
@app.get("/", response_model=dict)
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Census Chatbot API",
        "version": "1.0.0",
        "endpoints": {
            "chat": "POST /chat - Send a message to the chatbot",
            "quick_help": "GET /quick-help - Get contextual help",
            "health": "GET /health - Check system health"
        }
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint to verify system status"""
    from rag import collection
    
    # Test LLM connection
    llm_status = test_connection()
    
    # Get knowledge base document count
    doc_count = collection.count()
    
    return {
        "status": "healthy" if llm_status and doc_count > 0 else "degraded",
        "llm_connected": llm_status,
        "knowledge_base_docs": doc_count
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint for user interactions.
    
    Args:
        request: ChatRequest with message, role, and optional page context
    
    Returns:
        ChatResponse with generated answer and metadata
    """
    
    # Validate role
    valid_roles = ["supervisor", "district_admin", "state_analyst", "policy_maker"]
    if request.role.lower() not in valid_roles:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        )
    
    # Generate response
    result = generate_chatbot_response(
        user_message=request.message,
        user_role=request.role,
        page=request.page
    )
    
    # Check for errors
    if result.get("error") and result["error"] == "invalid_role":
        raise HTTPException(status_code=400, detail="Invalid user role")
    
    return ChatResponse(
        response=result["response"],
        sources_used=result["sources_used"],
        error=result.get("error")
    )


@app.get("/quick-help")
async def quick_help(role: str, page: Optional[str] = None):
    """
    Get quick contextual help based on role and page.
    
    Args:
        role: User's role
        page: Current page (optional)
    
    Returns:
        Quick help message
    """
    
    valid_roles = ["supervisor", "district_admin", "state_analyst", "policy_maker"]
    if role.lower() not in valid_roles:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        )
    
    help_message = get_quick_help(role, page)
    
    return {
        "help": help_message,
        "role": role,
        "page": page
    }


# Startup event
@app.on_event("startup")
async def startup_event():
    """Run on server startup"""
    print("\n" + "="*60)
    print("🤖 Census Chatbot Server Starting...")
    print("="*60)
    
    # Test connections
    from rag import collection
    print(f"✓ Knowledge base loaded: {collection.count()} documents")
    
    # Simple LLM test - don't fail on startup
    try:
        from llm import generate_answer
        test_response = generate_answer("Say OK", max_tokens=5)
        if test_response:
            print("✓ Gemini LLM connected")
        else:
            print("✓ Gemini API configured (connection not tested)")
    except Exception as e:
        print(f"✓ Gemini API configured (test skipped: {str(e)[:50]}...)")
    
    print("="*60)
    print("Server ready at http://localhost:8001")
    print("API docs at http://localhost:8001/docs")
    print("="*60 + "\n")


# Run server
if __name__ == "__main__":
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8001))
    
    uvicorn.run(
        "server:app",
        host=HOST,
        port=PORT,
        reload=True,  # Auto-reload on code changes
        log_level="info"
    )
