#!/usr/bin/env python3
"""Test eligibility tracking flow end-to-end"""
import requests
import json

BASE_URL = "http://127.0.0.1:8001"

print("\n" + "="*60)
print("TEST: User Eligibility Tracking Flow")
print("="*60)

# Step 1: Signup
print("\n[1] Testing signup...")
signup_resp = requests.post(f"{BASE_URL}/api/signup", json={
    "phone": "9876543210",
    "email": "test@example.com",
    "name": "Test User"
})
print(f"Status: {signup_resp.status_code}")
print(json.dumps(signup_resp.json(), indent=2))

# Step 2: Check eligibility
print("\n[2] Testing eligibility check...")
eligibility_resp = requests.post(f"{BASE_URL}/api/check-eligibility", json={
    "phone": "9876543210",
    "monthly_income": 50000,
    "employment_type": "salaried",
    "existing_emi": 10000,
    "city": "Bangalore",
    "loan_amount_needed": 200000
})
print(f"Status: {eligibility_resp.status_code}")
print(json.dumps(eligibility_resp.json(), indent=2))

# Step 3: Get application timeline to verify eligibility was tracked
print("\n[3] Getting application timeline to verify tracking...")
timeline_resp = requests.get(f"{BASE_URL}/api/application-timeline/9876543210")
print(f"Status: {timeline_resp.status_code}")
timeline_data = timeline_resp.json()
print(json.dumps(timeline_data, indent=2))

# Verify eligibility_status is marked as "completed"
if timeline_data.get("ok"):
    user_data = timeline_data.get("user", {})
    eligibility_status = user_data.get("eligibility_status")
    print(f"\n✓ Eligibility Status: {eligibility_status}")
    if eligibility_status == "completed":
        print("✓✓ SUCCESS: Eligibility tracking is working!")
    else:
        print("✗✗ FAIL: Eligibility status not marked as completed")

print("\n" + "="*60)
