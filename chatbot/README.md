# Census Governance Chatbot

Production-grade AI chatbot for census management and policy analysis platform.

## Structure

```
chatbot/
├── chatbotbackend/          # FastAPI backend with RAG
│   ├── server.py           # FastAPI server
│   ├── rag.py              # ChromaDB knowledge base
│   ├── llm.py              # Gemini LLM integration
│   ├── chat_logic.py       # Main orchestration
│   ├── requirements.txt    # Python dependencies
│   ├── .env               # API keys (create from .env.example)
│   └── README.md          # Backend docs
│
└── index.html             # Standalone chatbot UI (vanilla JS)
```

## Quick Start

### 1. Start Backend

```bash
cd chatbotbackend

# Install dependencies
pip install -r requirements.txt

# Create .env file with your Gemini API key
cp .env.example .env
# Edit .env and add: GEMINI_API_KEY=your_key_here

# Start server
python server.py
```

Backend runs at: `http://localhost:8001`

### 2. Open Frontend

Simply open `index.html` in your browser, or serve it via your main application.

**Option A: Direct Access**
```bash
# Open in default browser
start index.html  # Windows
open index.html   # Mac
xdg-open index.html  # Linux
```

**Option B: Serve via HTTP**
```bash
# Using Python
python -m http.server 8080
# Then open: http://localhost:8080/index.html
```

## Configuration

### Setting User Role & Page Context

The chatbot needs to know:
1. **User Role** - What permissions the user has
2. **Current Page** - Where in the app they are

#### Method 1: Via URL Parameters (Recommended for Demo)
```html
index.html?role=state_analyst&page=analytics
```

#### Method 2: Via JavaScript Global Variable
```html
<script>
    window.USER_ROLE = 'policy_maker';
    window.CURRENT_PAGE = 'policy_simulation';
</script>
<script src="chatbot-ui.js"></script>
```

#### Method 3: Embed in Your App
When integrating into your main platform:

```html
<!-- In your dashboard.html, analytics.html, etc. -->
<script>
    // Set from your authentication system
    window.USER_ROLE = getCurrentUserRole(); // Your function
    window.CURRENT_PAGE = 'analytics'; // Hardcode per page
</script>

<!-- Include chatbot -->
<iframe src="chatbot/index.html" width="100%" height="600px"></iframe>

<!-- Or embed directly -->
<div id="chatbot-container"></div>
<script>
    fetch('chatbot/index.html')
        .then(r => r.text())
        .then(html => {
            document.getElementById('chatbot-container').innerHTML = html;
        });
</script>
```

### Valid User Roles

- `supervisor` - Field supervisors who manage households
- `district_admin` - District-level administrators
- `state_analyst` - State-wide data analysts
- `policy_maker` - Policy planners and strategists

### Valid Page Contexts

- `dashboard` - Main overview
- `analytics` - Data visualization page
- `audit` - Audit logs page
- `review` - Review queue for flagged records
- `policy_simulation` - Policy testing interface
- `household_detail` - Individual household view

## Features

**Context-Aware**: Adapts suggestions based on current page  
**Role-Aware**: Respects user permissions  
**Professional UI**: Government-grade design  
**Vanilla JS**: No dependencies, no build step  
**Accessible**: Keyboard navigation, ARIA labels  
**Real-time**: Typing indicators, smooth animations  
**Error Handling**: Graceful API failure messages  

## 🔧 Integration into Main Platform

### As Modal/Overlay
```html
<!-- Add floating chat button -->
<button id="open-chat" style="position: fixed; bottom: 20px; right: 20px;">
    💬 AI Assistant
</button>

<!-- Chat modal -->
<div id="chat-modal" style="display: none;">
    <iframe src="chatbot/index.html" width="500" height="700"></iframe>
</div>

<script>
    document.getElementById('open-chat').onclick = () => {
        document.getElementById('chat-modal').style.display = 'block';
    };
</script>
```

### As Sidebar
```html
<div style="display: flex;">
    <main style="flex: 1;">
        <!-- Your main content -->
    </main>
    <aside style="width: 400px;">
        <iframe src="chatbot/index.html" height="100%"></iframe>
    </aside>
</div>
```

## API Integration

The frontend sends requests to:

```
POST http://localhost:8001/chat

Headers:
  Content-Type: application/json

Body:
{
  "message": "What metrics are shown on analytics?",
  "role": "state_analyst",
  "page": "analytics"
}

Response:
{
  "response": "The Analytics Dashboard shows Total Households...",
  "sources_used": 3,
  "error": null
}
```

## Customization

### Change Colors

Edit the CSS in `index.html`:

```css
/* Primary color (blue -> green) */
.chat-header {
    background: linear-gradient(135deg, #065f46 0%, #10b981 100%);
}

.message.user .message-bubble,
#send-btn {
    background: #10b981;
}
```

### Add More Suggested Prompts

Edit the `SUGGESTED_PROMPTS` object in `index.html`:

```javascript
const SUGGESTED_PROMPTS = {
    your_custom_page: [
        "Custom question 1",
        "Custom question 2",
        "Custom question 3"
    ]
};
```

### Change API URL

Edit in `index.html`:

```javascript
const CHATBOT_API_URL = 'http://your-server:8001';
```

## Testing

### Test Backend Connection
```bash
curl -X POST http://localhost:8001/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is a policy simulation?",
    "role": "policy_maker",
    "page": "policy_simulation"
  }'
```

### Test Frontend
1. Open `index.html` in browser
2. Click suggested questions
3. Type custom questions
4. Verify responses appear
5. Test clear chat button

## Troubleshooting

**Issue**: "Failed to connect to AI assistant"
- **Fix**: Ensure backend is running at `http://localhost:8001`
- **Fix**: Check browser console for CORS errors
- **Fix**: Verify `.env` has `GEMINI_API_KEY` set

**Issue**: Suggested prompts don't match page
- **Fix**: Ensure `CURRENT_PAGE` is set correctly
- **Fix**: Check page name matches keys in `SUGGESTED_PROMPTS`

**Issue**: Backend returns empty responses
- **Fix**: Verify ChromaDB is initialized (check backend logs)
- **Fix**: Ensure Gemini API key is valid

**Issue**: UI looks broken
- **Fix**: Open in modern browser (Chrome, Firefox, Edge)
- **Fix**: Disable browser extensions that modify CSS

## Production Deployment

### Backend (Recommended: Docker)
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY chatbotbackend/ .
RUN pip install -r requirements.txt
CMD ["python", "server.py"]
```

### Frontend
- Host `index.html` on your web server
- Or embed directly into your main app
- Ensure `CHATBOT_API_URL` points to production backend

