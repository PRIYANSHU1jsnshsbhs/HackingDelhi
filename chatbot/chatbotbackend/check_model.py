"""
Check available Gemini models for your API key
Run this to see which models you can use
"""

import google.generativeai as genai
import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env from backend folder
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("❌ Error: GEMINI_API_KEY not found in .env file")
    exit(1)

genai.configure(api_key=api_key)

print(f"Checking models for API Key starting with: {api_key[:10]}...")
print("=" * 60)

try:
    models_found = []
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            models_found.append(m.name)
            print(f"✓ {m.name}")
    
    print("=" * 60)
    print(f"\nTotal models available: {len(models_found)}")
    
    if models_found:
        print("\n💡 Recommended models to try:")
        recommended = [m for m in models_found if 'flash' in m.lower() or 'pro' in m.lower()]
        for model in recommended[:3]:
            print(f"   - {model}")
    else:
        print("\n⚠️  No models found. Your API key might have issues.")
        print("   Try creating a new API key at: https://aistudio.google.com/app/apikey")
        
except Exception as e:
    print("=" * 60)
    print(f"❌ Error: {e}")
    print("\n💡 Troubleshooting:")
    print("   1. Check your API key is valid")
    print("   2. Ensure you haven't exceeded quota")
    print("   3. Try creating a new API key")
    print("   4. Visit: https://aistudio.google.com/app/apikey")
