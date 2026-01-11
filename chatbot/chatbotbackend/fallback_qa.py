"""
Fallback Q&A Database for Demo Purposes
Used when Gemini API is unavailable or rate-limited
"""

# Comprehensive Q&A database organized by role and page context
FALLBACK_QA = {
    # SUPERVISOR QUESTIONS
    "supervisor": {
        "dashboard": {
            "what can i do on this dashboard": "As a Supervisor, your Dashboard provides a personalized overview of your work. You can see pending reviews that need your attention, recent household submissions from your team, approval/rejection statistics, and quick access to flagged records requiring manual verification. The dashboard also shows your district's current census progress and any urgent tasks.",
            
            "what are my pending tasks": "Your pending tasks include households flagged for manual review, recent submissions waiting for approval or rejection, incomplete household records that need follow-up, and any quality checks identified by the AI verification system. You can access these directly from the Review Queue section.",
            
            "explain my recent activity": "Your recent activity shows a timeline of actions you've performed including households created, records approved or rejected, status changes made, and notes added to flagged submissions. This audit trail helps you track your work and provides accountability for all census data modifications.",
            
            "how do i create a household": "To create a household record, navigate to the main dashboard and click 'Create New Household'. You'll need to provide mandatory information including family head name, complete address, family size, total income, and at least one identity proof document. The system will validate your inputs and flag any inconsistencies for review."
        },
        
        "review": {
            "why are records flagged for review": "Records are flagged by our AI verification system when it detects potential inconsistencies or suspicious patterns. Common reasons include: income exceeding typical thresholds for the declared occupation, missing or invalid identity documents, duplicate addresses within the district, unusual family compositions, or inconsistent age declarations among family members.",
            
            "what is the review workflow": "The review workflow has five steps: First, AI flags suspicious records with specific reasons. Second, the record enters your Review Queue with priority levels. Third, you investigate by examining the household data and supporting documents. Fourth, you either approve the record if legitimate or reject it with a detailed justification. Finally, your decision is logged in the audit trail for accountability and reporting.",
            
            "how should i handle inconsistent data": "When you encounter inconsistent data, first review the specific flag reason provided by the AI system. Check all supporting documents carefully. If the inconsistency appears legitimate (like a retired doctor with low income), add detailed notes explaining your reasoning and approve the record. If the data seems fraudulent or incorrect, reject the submission and request the field agent to re-verify with the household.",
            
            "what happens after i approve a record": "After you approve a record, it moves from pending status to verified in the system. The household data becomes part of the official census count for your district. The approval action is logged in the audit trail with your user ID, timestamp, and any notes you added. District Admins and State Analysts can then include this data in their analytics and reports."
        },
        
        "analytics": {
            "what metrics can i see": "As a Supervisor, you can view district-level metrics including total households under your supervision, verification success rates, pending reviews count, average household income in your area, demographic breakdowns by age and occupation, and your personal approval/rejection statistics. These metrics update in real-time as you process submissions.",
            
            "how is average income calculated": "Average household income is calculated by summing all reported household incomes in your district and dividing by the number of verified households. Only approved records are included in this calculation. The system automatically excludes outliers and rejected submissions to ensure data accuracy.",
            
            "can i see other districts data": "No, as a Supervisor your analytics access is restricted to your assigned district only. This ensures data privacy and prevents unauthorized access to sensitive census information from other regions. Only District Admins and State Analysts have cross-district visibility."
        },
        
        "audit": {
            "what actions are tracked": "The audit system tracks all critical actions including household creation with user ID, record updates showing what changed, approval and rejection decisions with justifications, status changes from pending to verified, user login and logout times, and any manual data corrections. Each entry includes timestamp, user identity, and affected household ID.",
            
            "how can i view my audit history": "Navigate to the Audit Logs page where you can filter by your username to see all actions you've performed. You can also filter by date range, action type (created, updated, approved, rejected), or specific household IDs. Export functionality allows you to download your audit history for personal records."
        }
    },
    
    # DISTRICT ADMIN QUESTIONS
    "district_admin": {
        "dashboard": {
            "what can i do on this dashboard": "As a District Admin, your Dashboard provides comprehensive oversight of census operations across your entire district. You can view aggregated statistics for all supervisors, monitor team performance metrics, track district-wide census completion rates, manage supervisor accounts and permissions, and access critical alerts requiring administrative attention.",
            
            "how do i manage supervisors": "You can add new supervisors by creating user accounts with assigned geographic areas, view performance metrics for each supervisor including approval rates and processing times, reassign households between supervisors when needed, and deactivate accounts for supervisors who have completed their assignments or left the program.",
            
            "what is team performance": "Team performance metrics show comparative statistics across all supervisors in your district including households processed per supervisor, approval vs rejection rates, average processing time per submission, quality scores based on AI flagging patterns, and identification of supervisors who may need additional training or support."
        },
        
        "analytics": {
            "what district analytics can i see": "You have access to comprehensive district-level analytics including total households by supervisor area, demographic distributions across age groups and occupations, income level statistics and poverty indicators, verification status breakdowns, geographic heatmaps showing census coverage, time-series trends of submission rates, and comparative analysis between sub-districts.",
            
            "how do i compare sub-districts": "Use the analytics dashboard's comparison view to select multiple sub-districts and view side-by-side metrics. You can compare household counts, average incomes, demographic profiles, and census completion percentages. This helps identify areas needing additional resources or outreach efforts.",
            
            "can i export reports": "Yes, you can export comprehensive reports in PDF or Excel formats including district summary reports with key statistics, supervisor performance reports for team management, demographic breakdowns for policy planning, and audit trail exports for compliance purposes. Reports can be scheduled for automated generation."
        },
        
        "audit": {
            "what is logged for my district": "All actions performed by supervisors in your district are logged including household data entry and modifications, approval and rejection decisions, supervisor account changes you make, bulk operations like reassignments, and system configuration changes affecting your district. This provides complete accountability and traceability.",
            
            "how do i investigate issues": "Use the audit log's advanced filtering to search by household ID, supervisor name, action type, or date range. You can track the complete history of any household record from creation to final verification, identify patterns of incorrect approvals, and generate reports for quality assurance reviews."
        },
        
        "review": {
            "can i override supervisor decisions": "Yes, as District Admin you have authority to review and override supervisor decisions when quality issues are identified. Navigate to the household record, review the supervisor's decision and notes, add your administrative justification, and change the status. Your override action is logged separately in the audit trail."
        }
    },
    
    # STATE ANALYST QUESTIONS
    "state_analyst": {
        "dashboard": {
            "what can i do on this dashboard": "As a State Analyst, your Dashboard provides read-only access to state-wide census intelligence. You can view aggregated statistics across all districts, access trend analysis and forecasting tools, generate custom analytical reports, monitor data quality metrics across regions, and create visualizations for stakeholder presentations.",
            
            "what is my role": "Your role is strategic analysis and reporting. You have comprehensive read-only access to all census data across the state, allowing you to identify patterns, trends, and insights that inform government policy and resource allocation decisions. You cannot modify household data or approve submissions."
        },
        
        "analytics": {
            "what state-wide metrics can i access": "You can access comprehensive state-level analytics including total households and population estimates by district, demographic distributions across urban and rural areas, socioeconomic indicators like poverty rates and education levels, occupation and employment statistics, income distribution analyses, geographic visualizations showing census coverage, and historical trend comparisons.",
            
            "how do i generate custom reports": "Use the analytics dashboard's report builder to select specific metrics, choose geographic regions (state-wide, by district, or urban/rural), set time periods for trend analysis, apply demographic filters, and choose visualization types. Reports can be exported in multiple formats and scheduled for recurring generation.",
            
            "can i see individual household data": "No, as a State Analyst you only have access to aggregated statistical data to protect individual privacy. You can view summary statistics, averages, distributions, and trends, but cannot access personally identifiable information or individual household records. This ensures census data confidentiality.",
            
            "what demographic breakdowns are available": "You can analyze demographics by age groups (child, youth, adult, senior), gender distribution, education levels (illiterate to post-graduate), occupation categories (agriculture, business, service, etc.), income quintiles, household sizes, and residence types. Cross-tabulation allows multidimensional analysis."
        },
        
        "audit": {
            "what audit data can i access": "You have read-only access to aggregated audit statistics including total actions performed by district, types of actions and their frequencies, approval and rejection rates over time, data quality indicators, and system usage patterns. You cannot view individual supervisor actions or personally identifiable audit records.",
            
            "how do i identify data quality issues": "Use the audit analytics to identify patterns like unusually high rejection rates in specific districts, anomalies in approval patterns, geographic regions with low census participation, supervisors with suspicious activity patterns, and time periods with data entry spikes. Generate quality assurance reports for district administrators."
        }
    },
    
    # POLICY MAKER QUESTIONS
    "policy_maker": {
        "dashboard": {
            "what can i do on this dashboard": "As a Policy Maker, your Dashboard provides strategic policy simulation tools and high-level census insights. You can run welfare scheme simulations on census data, analyze policy impact scenarios, view state-wide demographic trends, access economic indicators for planning, and generate policy recommendation reports.",
            
            "what is my role": "Your role is strategic policy development and simulation. You use census data to model welfare schemes, test eligibility criteria, estimate program costs and coverage, and make data-driven policy recommendations. You have read-only access to aggregated census data and powerful simulation tools."
        },
        
        "policy_simulation": {
            "how do policy simulations work": "Policy simulations allow you to define eligibility criteria for welfare schemes (age ranges, income thresholds, occupation types, education levels) and the system calculates which households qualify based on actual census data. You receive detailed impact analysis including number of beneficiaries, total budget required, district-wise coverage, and demographic reach.",
            
            "what eligibility criteria can i set": "You can define multiple criteria including income limits (below a threshold), age ranges (for youth programs or pensions), occupation filters (farmers, daily wage workers), education requirements (scholarships), household size (large family benefits), residence type (urban/rural targeting), and gender specifications (women empowerment schemes). Criteria can be combined with AND/OR logic.",
            
            "how is the budget calculated": "The system multiplies the per-beneficiary amount you specify by the number of qualifying households from census data. It provides breakdowns by district, projects annual vs one-time costs, shows beneficiary demographics, and estimates administrative overhead. You can adjust benefit amounts to see real-time budget impact.",
            
            "what does coverage rate mean": "Coverage rate shows what percentage of the total population (or target demographic) would be reached by your policy. For example, if you design a senior citizen pension for people 60+ years old and 15% of census households qualify, that's your coverage rate. Higher rates mean broader impact but higher costs.",
            
            "can i compare different policy scenarios": "Yes, run multiple simulations with different parameters and save each scenario. The system provides side-by-side comparison showing relative costs, beneficiary counts, demographic reach, and district-wise impacts. This helps optimize policy design for maximum social benefit within budget constraints.",
            
            "what example policies can i simulate": "Common simulations include Universal Basic Income for households below poverty line, Senior Citizen Pension for 60+ age group, Student Scholarships for youth in education, Farmer Subsidies for agricultural workers, Women Entrepreneurship Grants for female household heads, Child Nutrition programs for families with young children, and Housing schemes for low-income urban families."
        },
        
        "analytics": {
            "what policy-relevant analytics exist": "You can access poverty level distributions, employment and unemployment statistics, education attainment metrics, demographic dependency ratios, income inequality indicators, urban vs rural economic disparities, vulnerable population segments, and historical trend analysis for longitudinal policy impact assessment.",
            
            "how do i identify vulnerable populations": "Use the analytics filters to segment by low income levels (below poverty line), specific occupations prone to economic instability, low education attainment, large household sizes with single income, elderly populations without working-age support, and geographic regions with concentrated poverty. This informs targeted welfare policies."
        }
    },
    
    # GENERAL PLATFORM QUESTIONS (ALL ROLES)
    "general": {
        "how do i verify census data": "To verify census data, review the household submissions in your Review Queue. Check for inconsistencies like income mismatches with occupation, validate identity documents, look for duplicate addresses, and examine family compositions. The AI system flags suspicious records automatically. You can approve legitimate records or reject fraudulent ones with detailed notes. All decisions are logged in the audit trail for accountability.",
        
        "what is the review queue workflow": "The review workflow has five steps: First, AI flags suspicious records with specific reasons. Second, the record enters your Review Queue with priority levels. Third, you investigate by examining the household data and supporting documents. Fourth, you either approve the record if legitimate or reject it with a detailed justification. Finally, your decision is logged in the audit trail for accountability and reporting.",
        
        "explain data quality metrics": "Data quality metrics measure the accuracy and completeness of census data. Key metrics include verification rates (percentage of approved vs total submissions), rejection rates (flagged fraudulent records), completeness scores (percentage of filled mandatory fields), consistency checks (cross-validation of related data points), and duplicate detection rates. These metrics help identify areas needing additional training or outreach.",
        
        "how to handle suspicious submissions": "When handling suspicious submissions, first review the AI flag reason carefully. Check all supporting documents and cross-reference data points. If the submission appears legitimate despite the flag (like a retired professional with low income), add detailed notes explaining your reasoning and approve it. If data seems fraudulent or incorrect, reject the submission with specific reasons and request the field agent to re-verify with the household in person.",
        
        "what is this platform": "This is a Census Data Governance and Policy Simulation System designed for government officials to manage household census data, verify submissions through AI-powered validation, review flagged records, analyze demographic and socioeconomic trends, and simulate welfare policy impacts. The platform ensures data quality, accountability through audit trails, and provides role-based access control for security.",
        
        "how does ai verification work": "The AI verification system automatically analyzes all household submissions using machine learning algorithms trained on historical census data. It checks for inconsistencies like income mismatches with occupation types, validates document authenticity, detects duplicate addresses, identifies unusual family compositions, and flags suspicious patterns. Flagged records go to supervisors for manual review.",
        
        "what are the main features": "Key features include household data collection and management, AI-powered verification and fraud detection, role-based review queue workflows, comprehensive analytics dashboards with visualization, detailed audit logging for accountability, policy simulation and impact analysis tools, district-wise and state-wide reporting, and secure authentication with hierarchical permissions.",
        
        "how is data security maintained": "Data security is maintained through JWT-based authentication, role-based access control limiting data visibility, encrypted data transmission, audit logging of all access and modifications, no external database exposure (in-memory storage), session management and timeout policies, and privacy rules preventing individual household data exposure to analysts and policy makers.",
        
        "what happens to rejected records": "Rejected household records are flagged in the system with the supervisor's rejection reason and notes. The field agent who submitted the record is notified to re-verify information with the household. Rejected records do not count toward official census statistics or analytics. The entire rejection history is preserved in audit logs for accountability."
    }
}


def get_fallback_response(user_message: str, role: str, page: str) -> str:
    """
    Get fallback response when Gemini API is unavailable.
    Uses fuzzy matching to find relevant pre-generated answers.
    """
    user_message_lower = user_message.lower().strip()
    # Remove punctuation for better matching
    user_message_clean = user_message_lower.replace('?', '').replace('!', '').replace('.', '')
    
    print(f"[FALLBACK] Checking message: '{user_message_clean}'")
    print(f"[FALLBACK] Role: {role}, Page: {page}")
    
    # Check role-specific questions first
    if role in FALLBACK_QA and page in FALLBACK_QA[role]:
        page_qa = FALLBACK_QA[role][page]
        for question, answer in page_qa.items():
            question_clean = question.replace('?', '').replace('!', '').replace('.', '')
            # Check exact match or if most words match
            if question_clean in user_message_clean or user_message_clean in question_clean:
                print(f"[FALLBACK] Matched role-specific question: {question}")
                return answer
            # Check if key words match (at least 3 words)
            question_words = set(question_clean.split())
            message_words = set(user_message_clean.split())
            common_words = question_words & message_words
            if len(common_words) >= 3 and len(question_words) > 0:
                match_ratio = len(common_words) / len(question_words)
                if match_ratio >= 0.6:
                    print(f"[FALLBACK] Fuzzy matched role-specific: {question} (ratio: {match_ratio})")
                    return answer
    
    # Check general questions with improved matching
    for question, answer in FALLBACK_QA["general"].items():
        question_clean = question.replace('?', '').replace('!', '').replace('.', '')
        # Check exact match or substring
        if question_clean in user_message_clean or user_message_clean in question_clean:
            print(f"[FALLBACK] Matched general question: {question}")
            return answer
        # Check fuzzy match with key words
        question_words = set(question_clean.split())
        message_words = set(user_message_clean.split())
        common_words = question_words & message_words
        if len(common_words) >= 3 and len(question_words) > 0:
            match_ratio = len(common_words) / len(question_words)
            if match_ratio >= 0.6:
                print(f"[FALLBACK] Fuzzy matched general: {question} (ratio: {match_ratio})")
                return answer
    
    print(f"[FALLBACK] No match found")
    
    # Default fallback with helpful suggestions
    return (
        "I'm having trouble finding specific information about that. However, I can help you with:\n\n"
        "• **Dashboard features** - What you can do on your dashboard\n"
        "• **Review workflows** - How to review and verify census data\n"
        "• **Analytics** - Understanding metrics and reports\n"
        "• **Policy simulations** - Testing welfare schemes\n"
        "• **Audit logs** - Tracking changes and accountability\n"
        "• **Role permissions** - What actions you can perform\n\n"
        "Try asking a specific question from the topics above!"
    )
