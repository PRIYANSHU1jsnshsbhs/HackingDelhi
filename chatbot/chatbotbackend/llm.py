"""
LLM Integration Module
Handles Google Gemini API for generating chatbot responses
"""

import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables. Please set it in .env file")

genai.configure(api_key=GEMINI_API_KEY)

# Try primary model, fallback to generic if needed
PRIMARY_MODEL = 'gemini-2.5-flash'
FALLBACK_MODEL = 'gemini-flash-latest'

print("✓ Gemini API configured successfully")


def generate_answer(prompt: str, max_tokens: int = 1000) -> str:
    """
    Generate an answer using Google Gemini with automatic fallback.
    
    Args:
        prompt: Full prompt including system instructions and user query
        max_tokens: Maximum response length (default 1000 for complete responses)
    
    Returns:
        Generated text response
    """
    
    try:
        # Configure generation parameters for concise, professional responses
        generation_config = genai.types.GenerationConfig(
            max_output_tokens=max_tokens,
            temperature=0.3,  # Lower temperature for factual, consistent responses
            top_p=0.8,
            top_k=40
        )
        
        # Try primary model first
        try:
            model = genai.GenerativeModel(PRIMARY_MODEL)
            response = model.generate_content(
                prompt,
                generation_config=generation_config,
                safety_settings={
                    'HARM_CATEGORY_HARASSMENT': 'BLOCK_NONE',
                    'HARM_CATEGORY_HATE_SPEECH': 'BLOCK_NONE',
                    'HARM_CATEGORY_SEXUALLY_EXPLICIT': 'BLOCK_NONE',
                    'HARM_CATEGORY_DANGEROUS_CONTENT': 'BLOCK_NONE',
                }
            )
        except Exception as model_error:
            # If primary model fails, try fallback
            if "404" in str(model_error) or "not found" in str(model_error).lower():
                print(f"⚠️ Primary model failed, switching to fallback: {FALLBACK_MODEL}")
                model = genai.GenerativeModel(FALLBACK_MODEL)
                response = model.generate_content(
                    prompt,
                    generation_config=generation_config,
                    safety_settings={
                        'HARM_CATEGORY_HARASSMENT': 'BLOCK_NONE',
                        'HARM_CATEGORY_HATE_SPEECH': 'BLOCK_NONE',
                        'HARM_CATEGORY_SEXUALLY_EXPLICIT': 'BLOCK_NONE',
                        'HARM_CATEGORY_DANGEROUS_CONTENT': 'BLOCK_NONE',
                    }
                )
            else:
                raise model_error
        
        # Extract text from response - handle different response formats
        if response and response.candidates:
            # Access the first candidate's content
            candidate = response.candidates[0]
            if candidate.content and candidate.content.parts:
                text_parts = []
                for part in candidate.content.parts:
                    if hasattr(part, 'text') and part.text:
                        text_parts.append(part.text)
                if text_parts:
                    return ' '.join(text_parts).strip()
        
        # Fallback: try direct text access
        try:
            return response.text.strip()
        except:
            pass
        
        return "I apologize, but I couldn't generate a response. Please try rephrasing your question."
    
    except Exception as e:
        print(f"Error generating response: {e}")
        return "An error occurred while processing your request. Please try again."


def test_connection() -> bool:
    """
    Test if Gemini API is working correctly.
    
    Returns:
        True if connection successful, False otherwise
    """
    
    try:
        # Simple direct test without going through generate_answer
        test_model = genai.GenerativeModel(PRIMARY_MODEL)
        response = test_model.generate_content(
            "Say 'OK'",
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=10,
                temperature=0.1
            )
        )
        
        # Try to extract text
        if response and response.candidates:
            candidate = response.candidates[0]
            if candidate.content and candidate.content.parts:
                for part in candidate.content.parts:
                    if hasattr(part, 'text') and part.text:
                        return True
        
        # Try direct text access
        try:
            if response.text:
                return True
        except:
            pass
        
        return False
        
    except Exception as e:
        print(f"Gemini API test failed: {e}")
        # Try fallback model
        try:
            fallback_model = genai.GenerativeModel(FALLBACK_MODEL)
            response = fallback_model.generate_content("Say 'OK'")
            return True
        except:
            return False
