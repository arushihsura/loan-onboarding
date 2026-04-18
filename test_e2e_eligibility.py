#!/usr/bin/env python3
"""Complete end-to-end test of eligibility tracking with frontend and backend"""
import requests
import json
import time

BASE_URL = "http://127.0.0.1:8001"

print("\n" + "="*70)
print(" COMPLETE END-TO-END TEST: User Journey Tracking")
print("="*70)

# Generate unique phone number for this test run
test_phone = f"987654{int(time.time()) % 10000:04d}"

print(f"\n[TEST USER PHONE]: {test_phone}")
print(f"\n{'='*70}")

# STEP 1: User Signup
print("\n[STEP 1] User Registration")
print("-" * 70)
signup_resp = requests.post(f"{BASE_URL}/api/signup", json={
    "phone": test_phone,
    "email": f"test{test_phone}@example.com",
    "name": "End-to-End Test User"
})
print(f"✓ Status: {signup_resp.status_code}")
signup_data = signup_resp.json()
print(f"✓ User Created: {signup_data['user']['name']}")
print(f"  - ID: {signup_data['user']['id']}")
print(f"  - eligibility_status: {signup_data['user'].get('eligibility_status', 'N/A')}")
print(f"  - kyc_status: {signup_data['user'].get('kyc_status', 'N/A')}")
print(f"  - verification_status: {signup_data['user'].get('verification_status', 'N/A')}")
print(f"  - offer_status: {signup_data['user'].get('offer_status', 'N/A')}")

# STEP 2: Check Initial Timeline
print("\n[STEP 2] View Initial Application Timeline")
print("-" * 70)
timeline_resp1 = requests.get(f"{BASE_URL}/api/application-timeline/{test_phone}")
print(f"✓ Status: {timeline_resp1.status_code}")
timeline_data1 = timeline_resp1.json()
user_data1 = timeline_data1['user']
print(f"✓ Initial Status:")
print(f"  - eligibility_status: {user_data1.get('eligibility_status', 'N/A')} (should be 'pending')")
print(f"  - kyc_status: {user_data1.get('kyc_status', 'N/A')} (should be 'pending')")
print(f"  - offer_status: {user_data1.get('offer_status', 'N/A')} (should be 'pending')")
print(f"\n✓ Timeline Events:")
for i, event in enumerate(timeline_data1['timeline'], 1):
    print(f"  {i}. {event['step']}: {event['status']} (Date: {event['date']})")

# STEP 3: Submit Eligibility Check
print("\n[STEP 3] Submit Eligibility Form")
print("-" * 70)
eligibility_resp = requests.post(f"{BASE_URL}/api/check-eligibility", json={
    "phone": test_phone,
    "monthly_income": 75000,
    "employment_type": "salaried",
    "existing_emi": 5000,
    "city": "Bangalore",
    "loan_amount_needed": 500000
})
print(f"✓ Status: {eligibility_resp.status_code}")
eligibility_data = eligibility_resp.json()
print(f"✓ Eligibility Result:")
print(f"  - Eligible: {eligibility_data['eligible']}")
print(f"  - Eligible Amount: ₹{eligibility_data['eligible_amount']:,.0f}")
print(f"  - Message: {eligibility_data['message']}")
print(f"  - Application ID: {eligibility_data.get('application_id', 'N/A')}")

# STEP 4: Verify Eligibility Status Updated
print("\n[STEP 4] Verify Eligibility Status Updated in Database")
print("-" * 70)
timeline_resp2 = requests.get(f"{BASE_URL}/api/application-timeline/{test_phone}")
print(f"✓ Status: {timeline_resp2.status_code}")
timeline_data2 = timeline_resp2.json()
user_data2 = timeline_data2['user']
eligibility_status = user_data2.get('eligibility_status', 'N/A')
print(f"✓ Updated Status:")
print(f"  - eligibility_status: {eligibility_status} ← SHOULD BE 'completed'")

# STEP 5: Verify Timeline Events
print("\n[STEP 5] Verify Timeline Reflects Eligibility Step")
print("-" * 70)
print(f"✓ Timeline Events After Eligibility:")
for i, event in enumerate(timeline_data2['timeline'], 1):
    status_marker = "✓✓" if event['step'] == 'Eligibility Check' and event['status'] == 'completed' else "  "
    print(f"  {status_marker} {i}. {event['step']}: {event['status']} (Date: {event['date']})")

# FINAL VALIDATION
print("\n" + "="*70)
print(" VALIDATION RESULTS")
print("="*70)

all_passed = True

# Check 1: Eligibility status changed from pending to completed
if eligibility_status == 'completed':
    print("✓ [PASS] Eligibility status updated to 'completed'")
else:
    print(f"✗ [FAIL] Eligibility status is '{eligibility_status}', expected 'completed'")
    all_passed = False

# Check 2: Eligibility event shows as completed
eligibility_event = next((e for e in timeline_data2['timeline'] if e['step'] == 'Eligibility Check'), None)
if eligibility_event and eligibility_event['status'] == 'completed':
    print("✓ [PASS] Timeline shows Eligibility Check as 'completed'")
else:
    status = eligibility_event['status'] if eligibility_event else 'NOT FOUND'
    print(f"✗ [FAIL] Eligibility event status is '{status}', expected 'completed'")
    all_passed = False

# Check 3: LoanApplication persisted in database
if eligibility_data.get('application_id'):
    print(f"✓ [PASS] LoanApplication saved with ID: {eligibility_data['application_id']}")
else:
    print("✗ [FAIL] No application ID returned")
    all_passed = False

# Check 4: User data persisted
if signup_data['ok']:
    print("✓ [PASS] User created and persisted in database")
else:
    print("✗ [FAIL] User creation failed")
    all_passed = False

print("\n" + "="*70)
if all_passed:
    print("✓✓✓ ALL TESTS PASSED! Eligibility tracking is fully functional!")
else:
    print("✗✗✗ SOME TESTS FAILED - Please review errors above")
print("="*70 + "\n")
