"""
Chat Logic Module
Orchestrates RAG retrieval and LLM generation with role-aware constraints
"""

from typing import Optional
from rag import retrieve_texts
from llm import generate_answer
from fallback_qa import get_fallback_response


# Role-specific permission constraints
ROLE_CONSTRAINTS = {
    "supervisor": """
You are assisting a Supervisor who can:
- Create and edit household records in their district
- Review and approve/reject flagged submissions
- View district-level analytics
- Access audit logs for their district

DO NOT suggest actions beyond their permissions (e.g., state-wide analytics, policy simulations, or accessing other districts).
""",
    "district_admin": """
You are assisting a District Admin who can:
- View all households in their district
- Manage supervisors and team performance
- Access district audit logs
- Review district-level analytics and reports

DO NOT suggest modifying household data directly or accessing other districts' data.
""",
    "state_analyst": """
You are assisting a State Analyst who can:
- View aggregated state-wide analytics
- Access all audit logs across districts
- Generate analytical reports
- Monitor system-wide trends

This is a READ-ONLY role. DO NOT suggest creating, editing, or approving records.
""",
    "policy_maker": """
You are assisting a Policy Maker who can:
- Run policy simulations on census data
- View state-wide analytics and trends
- Access historical policy impacts
- Export strategic reports

DO NOT suggest accessing individual household data or making operational decisions. Focus on strategic analysis only.
"""
}


# Page-specific context
PAGE_CONTEXT = {
    "dashboard": "The user is on the Dashboard page showing their personalized overview.",
    "analytics": "The user is on the Analytics page viewing census data visualizations and metrics.",
    "audit": "The user is on the Audit Logs page reviewing system activity history.",
    "review": "The user is on the Review Queue page managing flagged household submissions.",
    "policy_simulation": "The user is on the Policy Simulation page testing welfare schemes.",
    "household_detail": "The user is viewing detailed information about a specific household."
}


def build_system_prompt(role: str, page: Optional[str] = None) -> str:
    """
    Build role-aware system prompt with constraints.
    
    Args:
        role: User's role (supervisor, district_admin, state_analyst, policy_maker)
        page: Current page context (optional)
    
    Returns:
        System prompt string
    """
    
    base_prompt = """You are an AI Governance Assistant for a government census management platform.

Your purpose is to:
- Explain analytics, audit logs, review queues, and policy simulations in detail
- Help users understand platform features and workflows comprehensively
- Provide clear, complete, professional answers based on retrieved knowledge
- Maintain a formal government tone suitable for official use

CRITICAL RULES:
1. Answer ONLY based on the retrieved context provided below
2. If context doesn't contain enough information, say "I don't have sufficient information to fully answer that. Please consult your administrator."
3. Provide complete explanations (2-5 sentences) - DO NOT stop mid-sentence
4. Always finish your thoughts completely before ending your response
5. Be precise, factual, and thorough - NO hallucinations or incomplete statements
6. Use professional, clear language appropriate for government officials
7. Structure answers with clear explanations and relevant details
"""
    
    # Add role constraints
    role_constraint = ROLE_CONSTRAINTS.get(role.lower(), "")
    if role_constraint:
        base_prompt += f"\n{role_constraint}"
    
    # Add page context
    if page and page.lower() in PAGE_CONTEXT:
        base_prompt += f"\n\nCONTEXT: {PAGE_CONTEXT[page.lower()]}"
    
    return base_prompt


def generate_chatbot_response(
    user_message: str,
    user_role: str,
    page: Optional[str] = None
) -> dict:
    """
    Generate chatbot response using RAG and LLM.
    
    Args:
        user_message: User's question or message
        user_role: User's role in the system
        page: Current page user is on (optional)
    
    Returns:
        Dictionary with response and metadata
    """
    
    # Validate inputs
    if not user_message or not user_message.strip():
        return {
            "response": "Please ask a question about the census platform.",
            "sources_used": 0,
            "error": None
        }
    
    valid_roles = ["supervisor", "district_admin", "state_analyst", "policy_maker"]
    if user_role.lower() not in valid_roles:
        return {
            "response": "Invalid user role. Please contact system administrator.",
            "sources_used": 0,
            "error": "invalid_role"
        }
    
    try:
        # Step 1: Retrieve relevant knowledge via RAG
        retrieved_docs = retrieve_texts(
            query=user_message,
            n_results=5,
            role=user_role.lower(),
            page=page.lower() if page else None
        )
        
        print(f"[DEBUG] RAG returned {len(retrieved_docs) if retrieved_docs else 0} documents")
        
        if not retrieved_docs:
            # No relevant docs found - try fallback first
            print(f"[DEBUG] No RAG results, trying fallback...")
            fallback_response = get_fallback_response(user_message, user_role, page)
            if fallback_response and "I don't have" not in fallback_response:
                print(f"[DEBUG] Using fallback response")
                return {
                    "response": fallback_response,
                    "sources_used": 0,
                    "error": None
                }
            # If no fallback either, return generic message
            print(f"[DEBUG] No fallback match, using generic")
            return {
                "response": "I don't have enough information to answer that question. Please contact your administrator or refer to the platform documentation.",
                "sources_used": 0,
                "error": None
            }
        
        # Step 2: Build context from retrieved documents
        context_sections = []
        for i, doc in enumerate(retrieved_docs, 1):
            context_sections.append(f"[Source {i}]: {doc['text']}")
        
        retrieved_context = "\n\n".join(context_sections)
        
        # Step 3: Build full prompt
        system_prompt = build_system_prompt(user_role, page)
        
        full_prompt = f"""{system_prompt}

---
RETRIEVED KNOWLEDGE:
{retrieved_context}
---

USER QUESTION: {user_message}

YOUR RESPONSE (Provide a complete, professional explanation in 2-5 sentences. Base your answer ONLY on the retrieved knowledge above. Always complete your sentences fully):"""
        
        # Step 4: Generate response using LLM (increased tokens for complete answers)
        try:
            response_text = generate_answer(full_prompt, max_tokens=800)
            
            print(f"[DEBUG] LLM response: {response_text[:100]}...")
            
            # Check if LLM gave an unhelpful/generic response
            unhelpful_phrases = [
                "i don't have sufficient information",
                "i don't have enough information",
                "please consult your administrator",
                "i cannot answer",
                "insufficient information",
                "i'm not able to"
            ]
            
            response_lower = response_text.lower()
            is_unhelpful = any(phrase in response_lower for phrase in unhelpful_phrases)
            
            if is_unhelpful:
                print(f"[DEBUG] LLM gave unhelpful response, trying fallback...")
                fallback_response = get_fallback_response(user_message, user_role, page)
                if fallback_response and not any(phrase in fallback_response.lower() for phrase in unhelpful_phrases):
                    print(f"[DEBUG] Using fallback instead of unhelpful LLM response")
                    response_text = fallback_response
            
            # Check if response seems incomplete (ends abruptly without punctuation)
            if response_text and not response_text[-1] in '.!?':
                response_text += "..."
                
        except Exception as llm_error:
            # Fallback to pre-generated responses if LLM fails
            print(f"[DEBUG] LLM generation failed, using fallback: {llm_error}")
            response_text = get_fallback_response(user_message, user_role, page)
        
        # Step 5: Return structured response
        return {
            "response": response_text,
            "sources_used": len(retrieved_docs),
            "error": None
        }
    
    except Exception as e:
        print(f"Error in generate_chatbot_response: {e}")
        # Use fallback even for critical errors
        try:
            fallback_response = get_fallback_response(user_message, user_role, page)
            return {
                "response": fallback_response,
                "sources_used": 0,
                "error": None
            }
        except:
            return {
                "response": "I encountered an error processing your request. Please try again.",
                "sources_used": 0,
                "error": str(e)
            }


def get_quick_help(role: str, page: Optional[str] = None) -> str:
    """
    Provide quick help based on current context.
    
    Args:
        role: User's role
        page: Current page (optional)
    
    Returns:
        Quick help message
    """
    
    if page:
        page = page.lower()
        if page == "analytics":
            return "I can help explain metrics, demographic breakdowns, and district comparisons on this Analytics page."
        elif page == "audit":
            return "I can explain audit log entries, track actions, and help you understand what changes were made."
        elif page == "review":
            return "I can explain why records are flagged, what the review workflow is, and what actions you can take."
        elif page == "policy_simulation":
            return "I can explain how to set up policy simulations, interpret results, and understand eligibility criteria."
    
    return f"I'm your AI assistant for the census platform. Ask me about analytics, workflows, or features relevant to your role as {role}."
