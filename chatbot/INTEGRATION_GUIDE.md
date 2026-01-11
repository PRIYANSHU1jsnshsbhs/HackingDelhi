# Chatbot Integration Guide

## How Role Switching Works

### In Your Main Platform (React)

Your Layout.js already has:
- `user.role` - Current user role (from authentication)
- Role switcher dropdown - Users can switch roles dynamically

### Integration Steps

#### 1. **Embed Chatbot in Your Main App**

Add this to your `Layout.js` (or any page):

```jsx
// At the top of Layout.js
import { useState } from 'react';

function Layout() {
  const { user, setUser } = useOutletContext();
  const location = useLocation();
  const [chatOpen, setChatOpen] = useState(false);

  // Get current page from route
  const getCurrentPage = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes('analytics')) return 'analytics';
    if (path.includes('audit')) return 'audit';
    if (path.includes('review')) return 'review';
    if (path.includes('policy')) return 'policy_simulation';
    if (path.includes('household')) return 'household_detail';
    return 'dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Your existing header and sidebar */}
      
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <Outlet context={{ user, setUser }} />
      </main>

      {/* ADD CHATBOT HERE */}
      {chatOpen && (
        <iframe
          src={`/chatbot/index.html?role=${user?.role}&page=${getCurrentPage()}`}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '450px',
            height: '600px',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000
          }}
        />
      )}

      {/* Floating Chat Button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          zIndex: chatOpen ? 999 : 1001
        }}
      >
        {chatOpen ? '✕' : '💬'}
      </button>
    </div>
  );
}
```

#### 2. **Update index.html to Read URL Parameters**

The chatbot index.html already supports this! It reads from:
```javascript
// In index.html (already implemented)
const urlParams = new URLSearchParams(window.location.search);
const USER_ROLE = urlParams.get('role') || window.USER_ROLE || 'supervisor';
const CURRENT_PAGE = urlParams.get('page') || detectCurrentPage();
```

#### 3. **Role Changes Update Automatically**

When user switches role in your main app:
1. React updates `user.role`
2. Chatbot iframe URL includes `?role=${user.role}`
3. Chatbot automatically uses new role context

## Testing Different Roles (Standalone)

### Method 1: URL Parameters
```
http://localhost:8080/chatbot/index.html?role=supervisor&page=dashboard
http://localhost:8080/chatbot/index.html?role=district_admin&page=analytics
http://localhost:8080/chatbot/index.html?role=state_analyst&page=audit
http://localhost:8080/chatbot/index.html?role=policy_maker&page=policy_simulation
```

### Method 2: Browser Console
```javascript
// Open DevTools (F12), then:
window.USER_ROLE = 'state_analyst';
location.reload();
```

### Method 3: Edit index.html Temporarily
Find line with `const USER_ROLE` and change:
```javascript
const USER_ROLE = 'state_analyst'; // Change this
```

## Valid Roles & Pages

### Roles:
- `supervisor` - Create/edit households, review flagged records
- `district_admin` - Manage district, view analytics
- `state_analyst` - Read-only state-wide analytics
- `policy_maker` - Run policy simulations

### Pages:
- `dashboard` - Main overview
- `analytics` - Data visualizations
- `audit` - Audit log history
- `review` - Review queue for flagged records
- `policy_simulation` - Policy testing interface
- `household_detail` - Individual household view

## Advanced: React Component (No iframe)

If you want a native React component instead of iframe:

```jsx
// components/Chatbot/ChatbotWidget.jsx
import { useState, useEffect } from 'react';

export const ChatbotWidget = ({ userRole, currentPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { text: input, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          role: userRole,
          page: currentPage
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { text: data.response, isUser: false }]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="chatbot-widget">
          {/* Your chat UI here */}
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)}>💬</button>
    </>
  );
};
```

## Production Deployment

### Backend:
```bash
cd chatbot/chatbotbackend
# Set production env vars
export GEMINI_API_KEY=your_key
export HOST=0.0.0.0
export PORT=8001

# Run with gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker server:app
```

### Frontend:
```bash
# Copy chatbot folder to React public/
cp -r chatbot/index.html frontend/public/chatbot/

# Update API URL in index.html
const CHATBOT_API_URL = 'https://your-api.com';
```

## How Role Context Works

### Supervisor sees:
- "How do I approve a household?"
- "What can I do on this dashboard?"
-  Won't see state-wide policy questions

### Policy Maker sees:
- "How do policy simulations work?"
- "Explain eligibility criteria"
-  Won't see individual household operations

The backend automatically filters responses based on role!

---

**Current Status**: Working!
- Backend running: http://localhost:8001
- Chatbot UI: index.html (opened in browser)
- Role: Currently set to 'supervisor'
- To test other roles: Use URL parameters or console
