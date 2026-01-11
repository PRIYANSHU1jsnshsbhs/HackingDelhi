# Census Chatbot Backend

Production-grade AI chatbot with RAG architecture for census governance platform.

## Architecture

```
┌─────────────────┐
│  FastAPI Server │
│   (server.py)   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐  ┌─▼──────┐
│  RAG  │  │  LLM   │
│(rag.py)│ │(llm.py)│
└───┬───┘  └────────┘
    │
┌───▼──────────┐
│  ChromaDB    │
│ (Knowledge)  │
└──────────────┘
```

## Features

- **RAG-based Knowledge Retrieval**: ChromaDB with sentence-transformers
- **Role-Aware Responses**: Respects user permissions (Supervisor, District Admin, State Analyst, Policy Maker)
- **Context-Aware**: Adapts answers based on current page
- **Grounded Answers**: No hallucinations - all responses from indexed knowledge
- **Production-Ready**: Clean code, error handling, API documentation

## Installation

1. **Install dependencies**:
```bash
pip install -r requirements.txt
```

2. **Set up environment**:
```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

3. **Get Gemini API Key**:
   - Visit: https://makersuite.google.com/app/apikey
   - Create a new API key
   - Add to `.env` file

## Usage

### Start the server:
```bash
python server.py
```

Server runs at: `http://localhost:8001`

API documentation: `http://localhost:8001/docs`

### API Endpoints:

#### 1. Chat Endpoint
```bash
POST /chat
Content-Type: application/json

{
  "message": "What metrics are shown on analytics?",
  "role": "state_analyst",
  "page": "analytics"
}
```

**Response**:
```json
{
  "response": "The Analytics Dashboard shows Total Households, Verified Records, Pending Reviews, and Average Income. All metrics support drill-down by district and demographic filters.",
  "sources_used": 3,
  "error": null
}
```

#### 2. Quick Help
```bash
GET /quick-help?role=supervisor&page=review
```

#### 3. Health Check
```bash
GET /health
```

## Knowledge Base

The RAG system indexes governance knowledge including:

- **Role Permissions**: What each role can/cannot do
- **Analytics Explanations**: Metric definitions and calculations
- **Audit Log Semantics**: What actions are tracked
- **Review Workflow**: Flagging and approval process
- **Policy Simulation**: How simulations work and examples
- **Data Governance**: Privacy rules and validation logic

**Note**: Raw census data is NEVER stored in ChromaDB. Only governance rules and explanations.

## Security

- No hardcoded secrets (uses `.env`)
- Role-based response filtering
- Never exposes unauthorized actions
- Professional government tone maintained

## Valid Roles

- `supervisor` - Create/edit households, review flagged records
- `district_admin` - Manage district, view analytics
- `state_analyst` - Read-only state-wide analytics
- `policy_maker` - Run policy simulations, strategic analysis

## Testing

Test the chatbot:
```bash
# Install httpx for testing
pip install httpx

# Test script
python -c "
import httpx
response = httpx.post('http://localhost:8001/chat', json={
    'message': 'What is a policy simulation?',
    'role': 'policy_maker',
    'page': 'policy_simulation'
})
print(response.json())
"
```

## File Structure

```
chatbotbackend/
├── server.py           # FastAPI server with endpoints
├── chat_logic.py       # Main chatbot orchestration
├── rag.py             # ChromaDB and retrieval logic
├── llm.py             # Gemini LLM integration
├── requirements.txt   # Python dependencies
├── .env.example       # Environment template
├── README.md          # This file
└── knowledge_db/      # ChromaDB persistent storage (auto-created)
```

## Integration with Frontend

Example React integration:
```javascript
const response = await fetch('http://localhost:8001/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userMessage,
    role: currentUserRole,
    page: currentPage
  })
});

const data = await response.json();
console.log(data.response); // Display to user
```

## Troubleshooting

**Issue**: `GEMINI_API_KEY not found`
- **Solution**: Create `.env` file with your API key

**Issue**: ChromaDB errors
- **Solution**: Delete `knowledge_db/` folder and restart server

**Issue**: Empty responses
- **Solution**: Check if knowledge base is indexed (see startup logs)

