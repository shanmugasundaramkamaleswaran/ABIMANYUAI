#!/usr/bin/env python3
"""Test script to create demo user and test login."""

import requests
import json
import urllib3

# Disable SSL warnings for self-signed certificates
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "https://localhost:8000"

def create_demo_user():
    """Create a demo user."""
    try:
        response = requests.post(
            f"{BASE_URL}/test/create-demo-user",
            verify=False
        )
        result = response.json()
        print("✅ Demo User Creation:")
        print(json.dumps(result, indent=2))
        return result
    except Exception as e:
        print(f"❌ Error creating demo user: {e}")
        return None

def test_login(email, password):
    """Test login with credentials."""
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": email, "password": password},
            verify=False
        )
        print(f"\n🔐 Login Test ({email}):")
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Login successful!")
            print(f"Access Token: {result['access_token'][:50]}...")
            print(f"User: {result['user']}")
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"Error: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error during login: {e}")
        return False

def test_register(email, password, name):
    """Test user registration."""
    try:
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json={"email": email, "password": password, "name": name},
            verify=False
        )
        print(f"\n📝 Registration Test ({email}):")
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Registration successful!")
            print(f"User: {result['user']}")
        else:
            print(f"❌ Registration failed: {response.status_code}")
            print(f"Error: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error during registration: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("ABIMANYU AI - Authentication Test Script")
    print("=" * 60)
    
    # Create demo user
    create_demo_user()
    
    # Test login with demo user
    test_login("demo@example.com", "demo123")
    
    # Test login with wrong password
    test_login("demo@example.com", "wrongpassword")
    
    # Test register new user
    test_register("testuser@example.com", "test123", "Test User")
    
    # Test login with new user
    test_login("testuser@example.com", "test123")
    
    print("\n" + "=" * 60)
    print("Test complete!")
    print("=" * 60)
