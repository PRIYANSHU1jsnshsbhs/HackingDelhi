#!/usr/bin/env python3
"""
Backend API Testing for Census Enumeration System
Tests the basic FastAPI setup and MongoDB connectivity
"""

import requests
import json
import sys
from datetime import datetime

# Get backend URL from frontend .env
BACKEND_URL = "https://enumeration-system.preview.emergentagent.com/api"

def test_health_check():
    """Test the basic health check endpoint GET /api/"""
    print("🔍 Testing Health Check Endpoint...")
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("message") == "Hello World":
                print("✅ Health check passed - API is responding correctly")
                return True
            else:
                print(f"❌ Health check failed - unexpected response: {data}")
                return False
        else:
            print(f"❌ Health check failed - status code: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check failed - connection error: {e}")
        return False

def test_mongodb_connection():
    """Test MongoDB connection by creating and retrieving a status check"""
    print("\n🔍 Testing MongoDB Connection...")
    
    # Test POST /api/status (create)
    test_data = {
        "client_name": "test_client_census_app"
    }
    
    try:
        print("Creating status check...")
        response = requests.post(f"{BACKEND_URL}/status", 
                               json=test_data, 
                               timeout=10)
        print(f"POST Status Code: {response.status_code}")
        print(f"POST Response: {response.text}")
        
        if response.status_code != 200:
            print(f"❌ MongoDB test failed - POST failed with status: {response.status_code}")
            return False
            
        created_item = response.json()
        if not created_item.get("id") or created_item.get("client_name") != test_data["client_name"]:
            print(f"❌ MongoDB test failed - invalid POST response: {created_item}")
            return False
            
        print("✅ POST successful - item created")
        
        # Test GET /api/status (retrieve)
        print("Retrieving status checks...")
        response = requests.get(f"{BACKEND_URL}/status", timeout=10)
        print(f"GET Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ MongoDB test failed - GET failed with status: {response.status_code}")
            return False
            
        items = response.json()
        print(f"Retrieved {len(items)} items")
        
        # Check if our test item exists
        test_item_found = any(item.get("client_name") == test_data["client_name"] for item in items)
        
        if test_item_found:
            print("✅ MongoDB connection test passed - data persisted and retrieved successfully")
            return True
        else:
            print("❌ MongoDB test failed - test item not found in retrieved data")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ MongoDB test failed - connection error: {e}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ MongoDB test failed - invalid JSON response: {e}")
        return False

def test_backend_service():
    """Test if backend service is accessible and responding"""
    print("\n🔍 Testing Backend Service Accessibility...")
    
    try:
        # Test basic connectivity
        response = requests.get(BACKEND_URL.replace('/api', ''), timeout=5)
        print(f"Root endpoint status: {response.status_code}")
        
        # Test API endpoint
        response = requests.get(f"{BACKEND_URL}/", timeout=5)
        print(f"API endpoint status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Backend service is accessible and responding")
            return True
        else:
            print(f"❌ Backend service test failed - status: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend service test failed - connection error: {e}")
        return False

def main():
    """Run all backend tests"""
    print("=" * 60)
    print("🚀 CENSUS ENUMERATION SYSTEM - BACKEND API TESTS")
    print("=" * 60)
    print(f"Testing Backend URL: {BACKEND_URL}")
    print(f"Test Time: {datetime.now().isoformat()}")
    print("=" * 60)
    
    results = []
    
    # Run tests
    results.append(("Health Check", test_health_check()))
    results.append(("Backend Service", test_backend_service()))
    results.append(("MongoDB Connection", test_mongodb_connection()))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All backend tests passed! API is working correctly.")
        return True
    else:
        print("⚠️  Some backend tests failed. Check the details above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)