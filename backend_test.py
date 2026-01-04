#!/usr/bin/env python3
"""
Backend API Testing for Governance Portal
Tests all backend endpoints for the census management system
"""

import requests
import json
import sys
from datetime import datetime

# Get backend URL from frontend .env file
BACKEND_URL = "https://polisim-app.preview.emergentagent.com/api"

class GovernancePortalTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        self.session_token = None
        
    def log_test(self, test_name, success, details="", response_code=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "status": status,
            "success": success,
            "details": details,
            "response_code": response_code,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        print(f"{status} {test_name}")
        if details:
            print(f"    Details: {details}")
        if response_code:
            print(f"    Response Code: {response_code}")
        print()

    def test_api_health_check(self):
        """Test GET /api/ - Root API health check"""
        try:
            response = self.session.get(f"{BACKEND_URL}/")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "operational":
                    self.log_test("API Health Check", True, 
                                f"API is operational: {data}", response.status_code)
                else:
                    self.log_test("API Health Check", False, 
                                f"Unexpected response: {data}", response.status_code)
            else:
                self.log_test("API Health Check", False, 
                            f"HTTP {response.status_code}: {response.text}", response.status_code)
                
        except Exception as e:
            self.log_test("API Health Check", False, f"Exception: {str(e)}")

    def test_census_records_unauthorized(self):
        """Test GET /api/census/records without authentication - should return 401"""
        try:
            response = self.session.get(f"{BACKEND_URL}/census/records")
            
            if response.status_code == 401:
                self.log_test("Census Records - Unauthorized Access", True, 
                            "Correctly returns 401 for unauthenticated request", response.status_code)
            else:
                self.log_test("Census Records - Unauthorized Access", False, 
                            f"Expected 401, got {response.status_code}: {response.text}", response.status_code)
                
        except Exception as e:
            self.log_test("Census Records - Unauthorized Access", False, f"Exception: {str(e)}")

    def test_blockchain_placeholder(self):
        """Test GET /api/integrity/status/{record_id} - Blockchain placeholder"""
        try:
            test_record_id = "REC000001"
            response = self.session.get(f"{BACKEND_URL}/integrity/status/{test_record_id}")
            
            if response.status_code == 401:
                self.log_test("Blockchain Integration Placeholder", True, 
                            "Correctly requires authentication (401)", response.status_code)
            elif response.status_code == 200:
                data = response.json()
                if data.get("message") == "Blockchain integration placeholder":
                    self.log_test("Blockchain Integration Placeholder", True, 
                                f"Placeholder working: {data}", response.status_code)
                else:
                    self.log_test("Blockchain Integration Placeholder", False, 
                                f"Unexpected response: {data}", response.status_code)
            else:
                self.log_test("Blockchain Integration Placeholder", False, 
                            f"HTTP {response.status_code}: {response.text}", response.status_code)
                
        except Exception as e:
            self.log_test("Blockchain Integration Placeholder", False, f"Exception: {str(e)}")

    def test_ml_audit_signals_placeholder(self):
        """Test GET /api/ml/audit-signals/{record_id} - ML placeholder"""
        try:
            test_record_id = "REC000001"
            response = self.session.get(f"{BACKEND_URL}/ml/audit-signals/{test_record_id}")
            
            if response.status_code == 401:
                self.log_test("ML Audit Signals Placeholder", True, 
                            "Correctly requires authentication (401)", response.status_code)
            elif response.status_code == 200:
                data = response.json()
                if data.get("message") == "ML integration placeholder":
                    self.log_test("ML Audit Signals Placeholder", True, 
                                f"Placeholder working: {data}", response.status_code)
                else:
                    self.log_test("ML Audit Signals Placeholder", False, 
                                f"Unexpected response: {data}", response.status_code)
            else:
                self.log_test("ML Audit Signals Placeholder", False, 
                            f"HTTP {response.status_code}: {response.text}", response.status_code)
                
        except Exception as e:
            self.log_test("ML Audit Signals Placeholder", False, f"Exception: {str(e)}")

    def test_other_protected_endpoints(self):
        """Test other protected endpoints to verify they require authentication"""
        protected_endpoints = [
            ("GET", "/auth/me", "Get Current User"),
            ("GET", "/census/records/REC000001", "Get Specific Census Record"),
            ("GET", "/census/household/HH0001", "Get Household Data"),
            ("GET", "/analytics/summary", "Analytics Summary"),
            ("GET", "/audit/logs", "Audit Logs"),
        ]
        
        for method, endpoint, description in protected_endpoints:
            try:
                if method == "GET":
                    response = self.session.get(f"{BACKEND_URL}{endpoint}")
                elif method == "POST":
                    response = self.session.post(f"{BACKEND_URL}{endpoint}", json={})
                elif method == "PUT":
                    response = self.session.put(f"{BACKEND_URL}{endpoint}", json={})
                
                if response.status_code == 401:
                    self.log_test(f"{description} - Auth Protection", True, 
                                "Correctly requires authentication (401)", response.status_code)
                else:
                    self.log_test(f"{description} - Auth Protection", False, 
                                f"Expected 401, got {response.status_code}: {response.text}", response.status_code)
                    
            except Exception as e:
                self.log_test(f"{description} - Auth Protection", False, f"Exception: {str(e)}")

    def test_auth_endpoints_without_credentials(self):
        """Test authentication endpoints without proper credentials"""
        try:
            # Test session creation without session_id
            response = self.session.post(f"{BACKEND_URL}/auth/session", json={})
            
            if response.status_code == 400:
                self.log_test("Auth Session - Missing Credentials", True, 
                            "Correctly returns 400 for missing session_id", response.status_code)
            else:
                self.log_test("Auth Session - Missing Credentials", False, 
                            f"Expected 400, got {response.status_code}: {response.text}", response.status_code)
                
        except Exception as e:
            self.log_test("Auth Session - Missing Credentials", False, f"Exception: {str(e)}")

    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 60)
        print("GOVERNANCE PORTAL BACKEND API TESTING")
        print("=" * 60)
        print(f"Testing backend at: {BACKEND_URL}")
        print()
        
        # Test public endpoints
        self.test_api_health_check()
        
        # Test authentication protection
        self.test_census_records_unauthorized()
        self.test_auth_endpoints_without_credentials()
        self.test_other_protected_endpoints()
        
        # Test placeholder endpoints
        self.test_blockchain_placeholder()
        self.test_ml_audit_signals_placeholder()
        
        # Summary
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print()
        
        if failed_tests > 0:
            print("FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"❌ {result['test']}: {result['details']}")
            print()
        
        return failed_tests == 0

if __name__ == "__main__":
    tester = GovernancePortalTester()
    success = tester.run_all_tests()
    
    if not success:
        sys.exit(1)
    else:
        print("✅ All tests passed!")