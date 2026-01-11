# Chatbot Widget Integration

The Census Governance Assistant chatbot has been integrated into the main platform as a professional widget.

## Features

**Small floating icon** in the bottom-right corner  
**Opens on click** to reveal a compact chat interface (380x600px)  
**Suggested prompts** for quick access to common questions  
**Real-time chat** with AI assistant  
**Context-aware** - sends current page info to backend  
**Clear chat history** option  
**Professional design** matching modern chat widgets  

## How It Works

### Frontend
- **Component**: `frontend/src/components/ChatbotWidget.js`
- **Integrated in**: `frontend/src/App.js`
- **Styling**: Uses Tailwind CSS (already configured)
- **Icons**: Uses lucide-react (already installed)

### Backend
- **API Endpoint**: `http://localhost:8001/chat`
- **Server**: `chatbot/chatbotbackend/server.py`
- **Port**: 8001

## Usage

### Starting the Chatbot Backend

```bash
cd chatbot/chatbotbackend
pip install -r requirements.txt
python server.py
```

The backend will start on `http://localhost:8001`

### Starting the Frontend

```bash
cd frontend
npm install
npm start
```

The frontend will start on `http://localhost:3000`

## Widget Behavior

1. **Closed State**: Small circular blue button with chat icon
2. **Open State**: 380x600px chat window with:
   - Header with title and clear/close buttons
   - Scrollable messages area
   - Suggested prompts (on first interaction)
   - Input field with send button

## API Integration

The widget sends POST requests to `/chat` endpoint with:
```json
{
  "message": "user's question",
  "role": "state_analyst",
  "page": "dashboard"
}
```

Response format:
```json
{
  "response": "AI assistant's response",
  "sources_used": 3,
  "error": null
}
```

## Customization

### Change Position
Edit `ChatbotWidget.js`:
```javascript
// Change from bottom-right to bottom-left
className="fixed bottom-6 left-6 ..."
```

### Change Size
```javascript
// Change dimensions
className="... w-[380px] h-[600px] ..."
```

### Change API URL
```javascript
const CHATBOT_API_URL = "http://your-api-url:8001";
```

## Notes

- Widget appears on all pages after user logs in
- Chat history is maintained during the session
- Automatically detects current page for context
- All components from the original chatbot are working
- No unnecessary changes made to existing functionality
