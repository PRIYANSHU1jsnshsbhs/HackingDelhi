"""
RAG (Retrieval-Augmented Generation) Module
Manages ChromaDB for governance knowledge retrieval
"""

import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import os
from typing import List, Dict

# Initialize persistent ChromaDB
PERSIST_DIRECTORY = os.path.join(os.path.dirname(__file__), "knowledge_db")
os.makedirs(PERSIST_DIRECTORY, exist_ok=True)

client = chromadb.PersistentClient(path=PERSIST_DIRECTORY)
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

# Get or create collection
try:
    collection = client.get_collection(name="governance_knowledge")
    print("✓ Loaded existing ChromaDB collection")
except:
    collection = client.create_collection(
        name="governance_knowledge",
        metadata={"description": "Census governance and policy knowledge"}
    )
    print("✓ Created new ChromaDB collection")


def index_governance_knowledge():
    """
    Index governance knowledge into ChromaDB on startup.
    This includes: policy rules, role permissions, workflow explanations, etc.
    """
    
    # Check if already populated
    if collection.count() > 0:
        print(f"✓ Knowledge base already populated with {collection.count()} documents")
        return
    
    knowledge_base = [
        # Role Permissions - Expanded
        {
            "id": "role_supervisor",
            "text": "Supervisors are field workers who manage census data collection. They can create and edit household records in their assigned district, review flagged submissions in the review queue, approve or reject records with justification, and view district-level analytics dashboards. Supervisors cannot access state-wide aggregated data, manage other users, or run policy simulations. Their primary responsibility is accurate data collection and initial verification of census records.",
            "category": "roles",
            "metadata": {"role": "supervisor"}
        },
        {
            "id": "role_district_admin",
            "text": "District Administrators oversee census operations at the district level. They can view all household records within their district, manage and assign supervisors, access comprehensive district audit logs to track all actions, review district-level analytics including demographic breakdowns and verification rates, and monitor team performance metrics. District Admins cannot directly modify household data (that's the supervisor's role) and cannot access data from other districts. They focus on coordination, oversight, and ensuring data quality within their jurisdiction.",
            "category": "roles",
            "metadata": {"role": "district_admin"}
        },
        {
            "id": "role_state_analyst",
            "text": "State Analysts have read-only access to perform comprehensive data analysis across all districts. They can view aggregated state-wide analytics including population demographics, income distributions, and verification trends. They access complete audit logs across all districts to identify patterns and anomalies. State Analysts generate detailed reports for policy makers and government officials. They cannot modify any census records, approve submissions, or access individual household details to maintain privacy. Their role is purely analytical and strategic.",
            "category": "roles",
            "metadata": {"role": "state_analyst"}
        },
        {
            "id": "role_policy_maker",
            "text": "Policy Makers use the platform for strategic planning and policy evaluation. They can run detailed policy simulations to test welfare schemes before implementation, view state-wide analytics showing demographic trends and socioeconomic patterns, access historical data to identify long-term trends, and export comprehensive policy impact reports. Policy Makers cannot access individual household data or personally identifiable information. They cannot modify census records or approve submissions. Their access is designed for high-level strategic decision-making and resource allocation planning.",
            "category": "roles",
            "metadata": {"role": "policy_maker"}
        },
        
        # Analytics Explanations - Expanded
        {
            "id": "analytics_overview",
            "text": "The Analytics Dashboard provides real-time visualizations of census data with multiple interactive components. It displays key metrics including total household count, number of verified records, pending reviews awaiting action, and average household income calculations. The dashboard features demographic breakdowns by age groups, gender distribution, education levels, and occupation categories. District-wise comparisons show relative performance and coverage. Charts update automatically as supervisors submit new records. The interface supports filtering by date ranges, districts, and demographic criteria to enable detailed analysis.",
            "category": "analytics",
            "metadata": {"page": "analytics"}
        },
        {
            "id": "analytics_metrics_detailed",
            "text": "Key analytics metrics include: Total Households (comprehensive count of all census records), Verified Records (households that passed AI verification checks), Pending Reviews (records flagged for manual inspection), Average Income (mean household income calculated across all verified records), Demographic Distributions (population breakdowns by age, gender, education, and occupation), Verification Rate (percentage of records that pass initial validation), and Geographic Coverage (district and state-level completion statistics). All metrics support drill-down functionality to explore specific segments and time periods.",
            "category": "analytics",
            "metadata": {"page": "analytics"}
        },
        {
            "id": "analytics_demographics_detailed",
            "text": "Demographics analysis provides comprehensive population insights. Age distribution shows counts across ranges: children (0-17), working age (18-60), and seniors (60+). Gender analysis displays male-female ratios and identifies gender imbalances. Education breakdown categorizes by levels: no formal education, primary, secondary, higher secondary, graduate, and post-graduate. Occupation analysis groups by sectors: agriculture, manufacturing, services, education, healthcare, government, and self-employed. These insights help identify underserved communities, plan resource allocation, and design targeted welfare programs.",
            "category": "analytics",
            "metadata": {"page": "analytics"}
        },
        
        # Audit Logs - Expanded
        {
            "id": "audit_purpose_detailed",
            "text": "Audit Logs provide complete transparency and accountability for all system operations. Every action is recorded with comprehensive details: user identity (who performed the action), timestamp (when it occurred), action type (what was done), affected records (which data was changed), previous values (what data looked like before), new values (what changed to), and justification (why the action was taken). This creates an immutable trail for compliance audits, security investigations, and quality assurance. Audit logs support filtering by user, date range, action type, and affected resources.",
            "category": "audit",
            "metadata": {"page": "audit"}
        },
        {
            "id": "audit_actions_detailed",
            "text": "Logged actions include: Household Creation (new census records added), Data Updates (modifications to existing records), Status Changes (approval, rejection, or flag state changes), User Authentication (login and logout events), Role Modifications (permission changes), Policy Simulation Runs (testing welfare schemes), Data Exports (report generation and downloads), and Critical Operations (deletions or bulk updates). Each entry includes full context including IP address, user agent, and related record identifiers. Critical actions like deletions are highlighted and require supervisor review.",
            "category": "audit",
            "metadata": {"page": "audit"}
        },
        
        # Review Queue - Expanded
        {
            "id": "review_queue_purpose_detailed",
            "text": "The Review Queue is a critical component for data quality assurance. When supervisors submit census records, an AI verification system analyzes them for accuracy, consistency, and completeness. Records that exhibit suspicious patterns, inconsistencies, or missing mandatory information are automatically flagged and moved to the review queue. Each flagged record displays the specific reason for flagging, related household details, and historical submission data. Supervisors must manually review these records, investigate discrepancies, add verification notes, and make a final decision to approve or reject. This process ensures data integrity and prevents fraudulent or inaccurate information from entering the system.",
            "category": "review",
            "metadata": {"page": "review"}
        },
        {
            "id": "review_workflow_detailed",
            "text": "The complete review workflow consists of five stages: First, AI verification flags records with potential issues. Second, the record enters the review queue with a detailed flag reason and priority level. Third, a supervisor is assigned to investigate the record, which may include contacting the household for clarification. Fourth, the supervisor adds detailed notes documenting their findings and reasoning. Fifth, the supervisor makes a final decision to approve (record is verified and moves to active database) or reject (record is marked invalid and may require re-collection). All review actions are logged in the audit trail with timestamps and justifications for accountability.",
            "category": "review",
            "metadata": {"page": "review"}
        },
        {
            "id": "review_flags_detailed",
            "text": "Common flag reasons with detailed explanations: Income Anomaly (declared income significantly exceeds or falls below typical range for stated occupation and region), Missing Documents (mandatory identity proofs, address verification, or income certificates not provided), Duplicate Detection (another record exists with same address or family head name suggesting duplicate entry), Age Inconsistencies (family member ages don't align logically, such as children older than parents), Household Size Mismatch (declared family size doesn't match number of members listed), Address Validation Failure (address cannot be verified against government records), and Occupation-Income Mismatch (stated occupation and income level are significantly misaligned with regional data).",
            "category": "review",
            "metadata": {"page": "review"}
        },
        
        # Policy Simulation - Expanded
        {
            "id": "policy_sim_overview_detailed",
            "text": "Policy Simulation is a powerful tool that allows testing welfare schemes and social programs on census data before actual implementation. Policy makers define comprehensive eligibility criteria including income thresholds (minimum and maximum), age ranges (to target specific demographics), occupation categories (agriculture, services, etc.), caste categories (for targeted welfare), geographic regions (state or district level), and education requirements. The system then calculates the impact by filtering all eligible households, computing total budget requirements based on per-household benefit amounts, analyzing demographic reach and coverage, generating cost-benefit analysis, and producing detailed impact reports. This enables evidence-based policy decisions and efficient resource allocation.",
            "category": "policy",
            "metadata": {"page": "policy_simulation"}
        },
        {
            "id": "policy_sim_logic_detailed",
            "text": "Policy simulation uses sophisticated filtering logic: All eligibility criteria are combined using AND logic (household must meet ALL conditions to qualify). For each eligible household, the system calculates the benefit amount based on policy parameters. Results are aggregated by district to show geographic distribution of beneficiaries. Demographic breakdowns show which age groups, gender, education levels, and occupations benefit most. Cost analysis includes total budget required, per-capita cost, and administrative overhead estimates. Coverage statistics show percentage of population reached and identify underserved segments. The simulation can run scenarios with different parameters to compare policy alternatives.",
            "category": "policy",
            "metadata": {"page": "policy_simulation"}
        },
        {
            "id": "policy_sim_examples_detailed",
            "text": "Example policy simulations include: Universal Basic Income (all households earning below ₹50,000 annually receive ₹5,000 monthly support, projected beneficiaries and total annual budget), Senior Citizen Pension (individuals aged 60+ receive ₹3,000 monthly, with geographic distribution and demographic reach), Student Scholarships (ages 18-25 in education sector receive ₹20,000 annually for tuition, targeting underserved communities), Farmer Subsidies (agriculture occupation households receive ₹15,000 per season for inputs and equipment), Women Entrepreneurship Grants (female heads of household receive ₹50,000 one-time grant for business setup), and Low-Income Housing Support (families earning below ₹30,000 receive ₹100,000 housing subsidy). Each simulation shows eligible count, budget requirements, and district-wise distribution.",
            "category": "policy",
            "metadata": {"page": "policy_simulation"}
        },
        
        # Dashboard - Expanded
        {
            "id": "dashboard_overview_detailed",
            "text": "The Dashboard serves as the central hub providing role-specific personalized views. Supervisors see their pending review queue with flagged records requiring attention, recent household submissions they've created, and quick statistics for their district including total records, verification rate, and pending approvals. District Admins view team performance metrics showing supervisor activity levels, district-wide statistics including completion rates and demographic coverage, and audit log highlights of recent critical actions. State Analysts see trend graphs showing state-wide patterns over time, comparison charts between districts, and data quality indicators. Policy Makers access quick links to run simulations, recent policy impact reports, and state-level summary statistics for strategic planning.",
            "category": "dashboard",
            "metadata": {"page": "dashboard"}
        },
        
        # Data Governance Rules - Expanded
        {
            "id": "governance_privacy_detailed",
            "text": "Privacy and data protection rules are strictly enforced throughout the platform. Individual household data including names, addresses, and personal identifiers is completely masked and inaccessible to State Analysts and Policy Makers who only see aggregated statistics and anonymized data. Supervisors can view full household details but only for records within their assigned district jurisdiction. District Admins similarly have access limited to their district boundaries. All data access attempts are logged in the audit trail with user identity, timestamp, and accessed records for security monitoring. Data exports automatically redact personally identifiable information based on user role. Geographic aggregation ensures no individual household can be identified from statistical reports. These measures ensure compliance with data protection regulations while enabling effective governance and analysis.",
            "category": "governance",
            "metadata": {}
        },
        {
            "id": "governance_validation_detailed",
            "text": "Comprehensive data validation rules ensure census data quality and consistency. Mandatory fields that must be provided include: head of household name, complete physical address with pin code, total family size as integer, annual household income as positive number, at least one government-issued identity proof (Aadhaar, voter ID, ration card), and occupation category. Validation constraints include: income must be non-negative with reasonable upper limits based on occupation, age must be between 0-120 years, family size must be positive integer matching the count of listed family members, at least one identity document must be verified and valid, addresses must be unique within district to prevent duplicates, phone numbers must follow valid formats, and pin codes must match district boundaries. Records failing validation are flagged for supervisor review before approval.",
            "category": "governance",
            "metadata": {}
        },
        
        # Platform Features - New
        {
            "id": "household_details_feature",
            "text": "The Household Details view provides comprehensive information about individual census records. It displays family member relationships in an interactive graph visualization showing hierarchical structure (parents, children, spouses). Each member shows age, gender, education level, and occupation. The page includes verification status indicators showing AI verification results and manual review outcomes. Document management shows attached identity proofs, income certificates, and address verification documents. Historical changes are tracked showing all modifications made to the record with timestamps and responsible users. Contact information displays phone numbers and email addresses for follow-up if needed. Quick actions allow supervisors to edit records, flag for review, or download household reports.",
            "category": "features",
            "metadata": {"page": "household_detail"}
        },
        {
            "id": "authentication_system",
            "text": "The platform uses secure OAuth2 authentication with Google Sign-In for production use, providing enterprise-grade security and single sign-on capabilities. For development and testing, a simple email-based login is available where users can login with any email and password combination. After successful authentication, users receive a JWT-like session token that must be included in all API requests. Sessions expire after 24 hours of inactivity for security. Role assignment is handled by administrators and cannot be self-selected. Multi-factor authentication can be enabled for sensitive roles like District Admin and State Analyst. All authentication attempts are logged in the audit trail for security monitoring.",
            "category": "features",
            "metadata": {}
        },
        {
            "id": "data_storage_architecture",
            "text": "The platform uses an in-memory data storage architecture with Python dictionaries for maximum speed and simplicity. This eliminates external database dependencies, reduces deployment complexity, and provides microsecond-level query performance. All census records, user sessions, audit logs, and review queue items are stored in memory structures that persist for the server's lifetime. For production deployment, data can be periodically serialized to disk for backup and recovery. This architecture is ideal for pilot deployments, testing environments, and scenarios where dataset size is manageable in RAM. The in-memory approach also simplifies horizontal scaling through state replication.",
            "category": "technical",
            "metadata": {}
        }
    ]
    
    # Add documents to ChromaDB
    ids = [doc["id"] for doc in knowledge_base]
    documents = [doc["text"] for doc in knowledge_base]
    metadatas = [{"category": doc["category"], **doc["metadata"]} for doc in knowledge_base]
    
    collection.add(
        ids=ids,
        documents=documents,
        metadatas=metadatas
    )
    
    print(f"✓ Indexed {len(knowledge_base)} governance knowledge documents")


def retrieve_texts(query: str, n_results: int = 5, role: str = None, page: str = None) -> List[Dict]:
    """
    Retrieve relevant knowledge from ChromaDB based on query.
    
    Args:
        query: User's question
        n_results: Number of documents to retrieve
        role: User's role (for filtering role-specific knowledge)
        page: Current page context (for filtering page-specific knowledge)
    
    Returns:
        List of relevant document dictionaries with text and metadata
    """
    
    # Simplified approach: Don't use complex filters, just retrieve and filter after
    # ChromaDB has limited where clause support
    try:
        # Query ChromaDB without filters for better compatibility
        results = collection.query(
            query_texts=[query],
            n_results=n_results * 2  # Get more results to filter later
        )
        
        # Format and filter results
        retrieved_docs = []
        if results and results['documents'] and len(results['documents']) > 0:
            for i, doc_text in enumerate(results['documents'][0]):
                metadata = results['metadatas'][0][i] if results['metadatas'] else {}
                
                # Simple filtering: prioritize docs matching role/page, but include all
                is_relevant = True
                if role and 'role' in metadata and metadata['role'] != role:
                    is_relevant = False
                if page and 'page' in metadata and metadata['page'] != page:
                    is_relevant = False
                
                # Include document if it's relevant or has no specific role/page (general)
                if is_relevant or ('role' not in metadata and 'page' not in metadata):
                    retrieved_docs.append({
                        "text": doc_text,
                        "metadata": metadata,
                        "distance": results['distances'][0][i] if results['distances'] else None
                    })
                
                # Stop when we have enough results
                if len(retrieved_docs) >= n_results:
                    break
        
        return retrieved_docs[:n_results]  # Return only requested number
        
    except Exception as e:
        print(f"Error in retrieve_texts: {e}")
        # Fallback: simple query without filtering
        results = collection.query(
            query_texts=[query],
            n_results=n_results
        )
        
        retrieved_docs = []
        if results and results['documents'] and len(results['documents']) > 0:
            for i, doc_text in enumerate(results['documents'][0]):
                retrieved_docs.append({
                    "text": doc_text,
                    "metadata": results['metadatas'][0][i] if results['metadatas'] else {},
                    "distance": results['distances'][0][i] if results['distances'] else None
                })
        
        return retrieved_docs


# Initialize knowledge base on module import
index_governance_knowledge()
