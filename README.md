# Governance Portal - Census Intelligence System

<div align="center">

## 🎥 Demo Video

[![Governance Portal Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg)](https://www.youtube.com/watch?v=QCwCYHa5YCMcQfyt)

**Click the image above to watch the full demo**

*Search for: "H4D_HackingDelhi_PriyanshuBarik_CivicTech" on YouTube or replace `YOUR_VIDEO_ID` with your actual YouTube video ID*

---

</div>

A comprehensive web application for managing census data with role-based access control, real-time analytics, policy simulation, and audit logging. Built for government and administrative use cases requiring secure data management and decision-making tools.

## 🌟 Features

### Core Functionality
- **Secure Authentication**: OAuth2 integration with Google Sign-In + development login for testing
- **Role-Based Access Control**: Four user roles (Supervisor, District Admin, State Analyst, Policy Maker)
- **Census Data Management**: Create, read, update, and review census records
- **Review Queue**: Flag and review census records with approval workflows
- **Household Details**: Visualize family relationships with interactive graphs
- **Real-Time Analytics**: State-wise and region-wise data aggregation and visualization
- **Policy Simulation**: Test policy eligibility based on income, caste, and region filters
- **Audit Logging**: Complete tracking of all user actions and data modifications
- **Interactive India Map**: Visualize state-wise census data on an interactive map

### Technical Features
- **In-Memory Database**: Fast, local storage without external database dependencies
- **RESTful API**: Clean, well-documented API endpoints
- **Responsive Design**: Mobile-first UI with Tailwind CSS
- **Modern UI Components**: Radix UI + shadcn/ui component library
- **Real-Time Updates**: Dynamic data fetching and state management
- **CORS Enabled**: Proper cross-origin configuration for development

---

## 🏗️ Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Server**: Uvicorn (ASGI server)
- **Authentication**: JWT-like session tokens, OAuth2 integration
- **Data Storage**: In-memory dictionaries (no external database required)
- **Dependencies**: 
  - `fastapi` - Web framework
  - `uvicorn` - ASGI server
  - `httpx` - Async HTTP client
  - `python-dotenv` - Environment configuration
  - `pydantic` - Data validation

### Frontend
- **Framework**: React 19
- **Build Tool**: Create React App with CRACO
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives + shadcn/ui
- **HTTP Client**: Axios
- **Charts**: Recharts
- **State Management**: React Hooks
- **Icons**: Lucide React
- **Notifications**: Sonner (toast notifications)

---

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/)
- **pip** (comes with Python)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
cd path/to/project
# The project structure should be:
# app/
#   ├── backend/
#   ├── frontend/
#   └── README.md
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn httpx python-dotenv pydantic

# Verify .env file exists with correct configuration
# The .env file should contain:
# MONGO_URL="mongodb://localhost:27017"  # Not used, but kept for compatibility
# DB_NAME="test_database"
# CORS_ORIGINS="*"
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install --legacy-peer-deps

# Verify .env file exists with correct configuration
# The .env file should contain:
# REACT_APP_BACKEND_URL=http://localhost:8000
# ENABLE_HEALTH_CHECK=false
```

---

## ▶️ Running the Application

### Start Backend Server

```bash
# From the backend directory
cd backend
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at: `http://localhost:8000`

**API Documentation**: `http://localhost:8000/docs` (FastAPI auto-generated Swagger UI)

### Start Frontend Server

Open a **new terminal** window:

```bash
# From the frontend directory
cd frontend
npm start
```

The frontend will be available at: `http://localhost:3000`

The browser should automatically open. If not, navigate to `http://localhost:3000` manually.

---

## 🔐 Login & Authentication

### For Development/Testing
1. Navigate to `http://localhost:3000`
2. Click the **"Dev Login (Local Testing)"** button (green button)
3. You'll be automatically logged in as a test user with supervisor role

### For Production (OAuth)
1. Click the **"Sign in with Google"** button
2. Complete the OAuth flow through Emergent Agent authentication
3. You'll be redirected back to the dashboard after successful authentication

---

## 👥 User Roles & Permissions

| Role | Permissions |
|------|------------|
| **Supervisor** | Review records, approve/reject flagged entries |
| **District Admin** | Review records, view analytics, access audit logs |
| **State Analyst** | View state-wise analytics, access audit logs |
| **Policy Maker** | Run policy simulations, view all analytics |

---

## 📊 Application Pages

### 1. Dashboard (`/dashboard`)
- Overview statistics (total records, regions, castes, income brackets)
- Quick access cards to other features
- Real-time data summaries

### 2. Review Queue (`/review`)
- List of flagged census records requiring review
- Filter by flag status (normal, review, priority, approved)
- Approve or request verification for records
- Pagination support

### 3. Household Details (`/household/:householdId`)
- View all members of a household
- Interactive family relationship graph
- Individual member details

### 4. Analytics (`/analytics`)
- Interactive India map with state-wise data
- Visualize population distribution
- Filter by flag status
- State comparison charts

### 5. Policy Simulation (`/policy`)
- Simulate policy eligibility criteria
- Filter by income threshold, caste, region
- View eligible population statistics
- Region-wise distribution charts

### 6. Audit Logs (`/audit`)
- Complete history of all user actions
- Timestamp, user, action details
- Search and filter capabilities

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/dev-login` - Development login
- `POST /api/auth/session` - Create session from OAuth
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout and clear session
- `PUT /api/auth/role` - Update user role

### Census Records
- `GET /api/census/records` - List census records (with optional filters)
- `GET /api/census/records/{record_id}` - Get single record
- `PUT /api/census/records/{record_id}/review` - Review a record
- `GET /api/census/household/{household_id}` - Get household members

### Analytics
- `GET /api/analytics/summary` - Get summary statistics
- `GET /api/analytics/states` - Get state-wise analytics

### Policy
- `POST /api/policy/simulate` - Run policy simulation

### Audit
- `GET /api/audit/logs` - Get audit logs

### Placeholders (Future Integration)
- `GET /api/integrity/status/{record_id}` - Blockchain integrity check
- `GET /api/ml/audit-signals/{record_id}` - ML audit signals

---

## 🗂️ Project Structure

```
app/
├── backend/
│   ├── server.py              # Main FastAPI application
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Backend environment variables
│
├── frontend/
│   ├── public/
│   │   └── index.html        # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # Reusable UI components (shadcn/ui)
│   │   │   ├── Layout.js     # Main layout wrapper
│   │   │   ├── ProtectedRoute.js
│   │   │   └── InteractiveIndiaMap.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   ├── ReviewQueue.js
│   │   │   ├── HouseholdDetail.js
│   │   │   ├── Analytics.js
│   │   │   ├── PolicySimulation.js
│   │   │   └── AuditLogs.js
│   │   ├── hooks/
│   │   │   └── use-toast.js
│   │   ├── lib/
│   │   │   └── utils.js      # Utility functions
│   │   ├── App.js            # Main React component
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json          # Frontend dependencies
│   ├── jsconfig.json
│   ├── craco.config.js       # CRACO configuration
│   ├── tailwind.config.js
│   └── .env                  # Frontend environment variables
│
└── README.md                  # This file
```

---

## 🛠️ Development

### Mock Data Generation

The backend automatically generates mock census data when no records exist. This includes:
- 50 sample census records
- Multiple households with family relationships
- Various states, districts, regions
- Different caste categories and income levels
- Mix of normal and flagged records

### Adding New Features

**Backend (FastAPI)**:
1. Add new route in `server.py`
2. Define Pydantic models for request/response
3. Implement business logic
4. Update in-memory storage as needed

**Frontend (React)**:
1. Create new page in `src/pages/`
2. Add route in `App.js`
3. Use existing UI components from `src/components/ui/`
4. Connect to backend API using axios

### Styling Guidelines

The project uses a government-themed color scheme:
- **Primary**: Navy Blue (`hsl(var(--navy))`)
- **Secondary**: Saffron Orange (`hsl(var(--saffron))`)
- **Success**: Green (`hsl(var(--green))`)

All colors are defined in `frontend/src/index.css` as CSS variables.

---

## 🐛 Troubleshooting

### Backend won't start
- Ensure Python virtual environment is activated
- Verify all dependencies are installed: `pip install fastapi uvicorn httpx python-dotenv pydantic`
- Check if port 8000 is already in use: `netstat -ano | findstr :8000`

### Frontend won't start
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install --legacy-peer-deps`
- Check if port 3000 is available

### CORS Errors
- Ensure backend is running before starting frontend
- Verify `REACT_APP_BACKEND_URL=http://localhost:8000` in frontend `.env`
- Check backend CORS middleware allows `http://localhost:3000`

### Authentication Issues
- For dev login: Use the green "Dev Login" button
- Clear browser cookies and localStorage
- Check browser console for detailed error messages

### Styling Issues
- Run `npm install --legacy-peer-deps` to ensure all Tailwind dependencies are installed
- Clear browser cache
- Check if Tailwind CSS is properly compiled

---

## 🔒 Security Considerations

⚠️ **Important**: This application uses in-memory storage and is designed for development/demonstration purposes.

For production deployment:
- Replace in-memory storage with a real database (MongoDB, PostgreSQL, etc.)
- Implement proper JWT token management
- Add rate limiting and request throttling
- Enable HTTPS/TLS
- Implement proper session management
- Add input validation and sanitization
- Enable security headers (CORS, CSP, etc.)
- Add logging and monitoring
- Implement backup and recovery strategies

---

## 📝 Environment Variables

### Backend (`.env`)
```env
MONGO_URL="mongodb://localhost:27017"  # Legacy, not actively used
DB_NAME="test_database"
CORS_ORIGINS="*"
```

### Frontend (`.env`)
```env
REACT_APP_BACKEND_URL=http://localhost:8000
ENABLE_HEALTH_CHECK=false
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

---

## 📄 License

This project is part of HACK4DELHI initiative. Please check with the project maintainers for licensing details.

---

## 🙋 Support

For issues, questions, or contributions:
- Open an issue on the project repository
- Contact the development team
- Check the API documentation at `http://localhost:8000/docs`

---

## 🎯 Future Enhancements

- [ ] Blockchain integration for data integrity
- [ ] Machine Learning audit signals
- [ ] Excel/CSV import/export functionality
- [ ] Advanced search and filtering
- [ ] Real-time notifications
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Offline mode support
- [ ] Advanced reporting tools
- [ ] Data visualization improvements

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)

---

**Built with ❤️ for HACK4DELHI**
