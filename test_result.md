#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  Build a secure, role-based Governance & Intelligence web platform for Tech-Enabled Census Management System.
  The platform should allow authorized officials to:
  - Review census records and flags
  - Monitor audit signals
  - View aggregated analytics
  - Run policy simulations
  Features include OAuth2 authentication, RBAC with 4 roles (Supervisor, District Admin, State Analyst, Policy Maker),
  census review workflow, household graph visualization, analytics dashboard, policy simulation, and audit logs.
  Blockchain and ML integration hooks are placeholders for future implementation.

backend:
  - task: "OAuth2 Authentication via Emergent Auth"
    implemented: true
    working: NA
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: NA
        agent: "main"
        comment: "Implemented OAuth2 authentication with Emergent Auth, session management with cookies"

  - task: "Role-Based Access Control (RBAC)"
    implemented: true
    working: NA
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: NA
        agent: "main"
        comment: "Implemented 4 roles: supervisor, district_admin, state_analyst, policy_maker with route restrictions"

  - task: "Census Records API with Filtering"
    implemented: true
    working: NA
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: NA
        agent: "main"
        comment: "GET /api/census/records with flag_status filtering, mock data generation"

  - task: "Review Workflow API"
    implemented: true
    working: NA
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: NA
        agent: "main"
        comment: "PUT /api/census/records/{id}/review with approve/request_verification actions, audit logging"

  - task: "Household API with Graph Data"
    implemented: true
    working: NA
    file: "backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: NA
        agent: "main"
        comment: "GET /api/census/household/{id} returns members and relationship graph data"

  - task: "Analytics Summary API"
    implemented: true
    working: NA
    file: "backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: NA
        agent: "main"
        comment: "GET /api/analytics/summary with region, caste, income aggregations. Role restricted to state_analyst, policy_maker, district_admin. Added GET /api/analytics/states for state-wise population, review status, and income data with heatmap support."

  - task: "Policy Simulation API"
    implemented: true
    working: NA
    file: "backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: NA
        agent: "main"
        comment: "POST /api/policy/simulate with income threshold and filters. Policy maker role only"

  - task: "Audit Logs API"
    implemented: true
    working: NA
    file: "backend/server.py"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: NA
        agent: "main"
        comment: "GET /api/audit/logs with role restrictions. Returns action logs sorted by timestamp"

  - task: "Blockchain Integration Placeholder"
    implemented: true
    working: NA
    file: "backend/server.py"
    stuck_count: 0
    priority: "low"
    needs_retesting: true
    status_history:
      - working: NA
        agent: "main"
        comment: "GET /api/integrity-status/{record_id} returns placeholder status"

  - task: "ML Audit Signals Placeholder"
    implemented: true
    working: NA
    file: "backend/server.py"
    stuck_count: 0
    priority: "low"
    needs_retesting: true
    status_history:
      - working: NA
        agent: "main"
        comment: "GET /api/ml/audit-signals/{record_id} returns placeholder signals"

frontend:
  - task: "Login Page with Google OAuth"
    implemented: true
    working: NA
    file: "frontend/src/pages/Login.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: NA
        agent: "main"
        comment: "Government-themed login page with Emergent Auth integration"

  - task: "Dashboard with Role-Based Quick Access"
    implemented: true
    working: NA
    file: "frontend/src/pages/Dashboard.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: NA
        agent: "main"
        comment: "Stats cards, system status badges, quick access links based on role"

  - task: "Review Queue with Filters"
    implemented: true
    working: NA
    file: "frontend/src/pages/ReviewQueue.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: NA
        agent: "main"
        comment: "Census record list with approve/verify actions, filter by status"

  - task: "Household Detail with Graph Visualization"
    implemented: true
    working: NA
    file: "frontend/src/pages/HouseholdDetail.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: NA
        agent: "main"
        comment: "SVG-based circular graph visualization of family relationships"

  - task: "Analytics Dashboard with Charts"
    implemented: true
    working: NA
    file: "frontend/src/pages/Analytics.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: NA
        agent: "main"
        comment: "Bar and pie charts using Recharts, privacy mode toggle. Added interactive India map with state-wise heatmaps showing population, pending reviews, priority cases, and average income. Features hover tooltips and clickable states."

  - task: "Policy Simulation Page"
    implemented: true
    working: NA
    file: "frontend/src/pages/PolicySimulation.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: NA
        agent: "main"
        comment: "Sliders for income threshold, caste/region filters, impact results"

  - task: "Audit Logs Viewer"
    implemented: true
    working: NA
    file: "frontend/src/pages/AuditLogs.js"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: NA
        agent: "main"
        comment: "List view of audit entries with timestamps and details"

  - task: "Interactive India Map Component"
    implemented: true
    working: NA
    file: "frontend/src/components/InteractiveIndiaMap.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: NA
        agent: "main"
        comment: "Interactive SVG-based India map with 30 states/UTs. Features: hover tooltips showing detailed state statistics, orange-yellow heatmap gradient, clickable states, metric toggle (population/review/priority/income), state selection display"

  - task: "Role-Aware Navigation Sidebar"
    implemented: true
    working: NA
    file: "frontend/src/components/Layout.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: NA
        agent: "main"
        comment: "Sidebar shows menu items based on user role, role switcher in header"

  - task: "Protected Routes"
    implemented: true
    working: NA
    file: "frontend/src/components/ProtectedRoute.js"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
      - working: NA
        agent: "main"
        comment: "Auth check on protected routes, redirect to login if not authenticated"

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 1
  run_ui: false

test_plan:
  current_focus:
    - "OAuth2 Authentication via Emergent Auth"
    - "Role-Based Access Control (RBAC)"
    - "Census Records API with Filtering"
    - "Review Workflow API"
    - "Analytics Summary API"
    - "Policy Simulation API"
    - "Audit Logs API"
  stuck_tasks: []
  test_all: true
  test_priority: "high_first"

agent_communication:
  - agent: "main"
    message: |
      Initial testing needed for the Governance Portal application.
      All backend APIs and frontend pages have been implemented.
      Please test the following backend endpoints:
      1. Authentication flow - POST /api/auth/session, GET /api/auth/me, POST /api/auth/logout
      2. Census Records - GET /api/census/records, GET /api/census/records/{id}
      3. Review - PUT /api/census/records/{id}/review (requires supervisor or district_admin role)
      4. Household - GET /api/census/household/{id}
      5. Analytics - GET /api/analytics/summary (requires state_analyst, policy_maker, or district_admin)
      6. Policy Simulation - POST /api/policy/simulate (requires policy_maker role)
      7. Audit Logs - GET /api/audit/logs (requires state_analyst or district_admin)
      8. Placeholders - GET /api/integrity-status/{id}, GET /api/ml/audit-signals/{id}
      
      Note: Auth requires Emergent Auth session_id from OAuth flow.
      For RBAC testing, use PUT /api/auth/role to switch roles after login.
  
  - agent: "main"
    message: |
      FEATURE ADDED: Interactive India Map with State-wise Heatmaps
      
      Added to Analytics page:
      - New backend endpoint: GET /api/analytics/states
        Returns state-wise population, review counts, priority cases, and average income
      - InteractiveIndiaMap component with 30 Indian states/UTs
      - Features:
        * Orange-yellow gradient heatmap (Indian government theme)
        * Hover tooltips showing detailed state statistics
        * Clickable states for detailed view
        * Metric toggle buttons: Population, Pending Review, Priority Cases, Avg Income
        * Color intensity based on selected metric
        * Legend explaining color gradients
      
      Mock data includes all major Indian states with realistic population distributions.
      The map integrates seamlessly with existing analytics and uses the same RBAC permissions.
