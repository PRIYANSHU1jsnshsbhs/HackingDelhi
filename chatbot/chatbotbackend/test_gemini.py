"""
Quick test to verify Gemini is working
"""

from llm import generate_answer

print("Testing Gemini API...")
print("=" * 60)

response = generate_answer("Say 'Hello, I am working!' if you receive this message.")

print("Response:", response)
print("=" * 60)

if response and "working" in response.lower():
    print("SUCCESS! Gemini is working correctly!")
else:
    print("Gemini responded but might have issues")
