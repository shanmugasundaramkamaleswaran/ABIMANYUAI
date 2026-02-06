import requests
import json
import urllib3

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "https://localhost:8000"

def test_chat():
    print("=" * 60)
    print("ABIMANYU AI - Chat Integration Test")
    print("=" * 60)
    
    # 1. Login to get token
    print("\n🔐 Logging in...")
    login_resp = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": "demo@example.com", "password": "demo123"},
        verify=False
    )
    
    if login_resp.status_code != 200:
        print(f"❌ Login failed: {login_resp.status_code}")
        return
    
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Login successful")
    
    # 2. Test Greeting
    print("\n👋 Testing Greeting...")
    chat_resp = requests.post(
        f"{BASE_URL}/chat",
        json={"message": "Namaste Abimanyu"},
        headers=headers,
        verify=False
    )
    
    if chat_resp.status_code == 200:
        result = chat_resp.json()
        print(f"✅ Greeting Response: {result['reply'][:100]}...")
        print(f"Sentiment: {result['sentiment']}")
    else:
        print(f"❌ Greeting failed: {chat_resp.status_code}")
        print(chat_resp.text)
        
    # 3. Test Struggle (to trigger wisdom/story)
    print("\n💪 Testing Struggle Response...")
    chat_resp = requests.post(
        f"{BASE_URL}/chat",
        json={"message": "I am feeling afraid and confused about my path."},
        headers=headers,
        verify=False
    )
    
    if chat_resp.status_code == 200:
        result = chat_resp.json()
        print(f"✅ Struggle Response: {result['reply'][:200]}...")
        print(f"Sentiment: {result['sentiment']}")
    else:
        print(f"❌ Struggle failed: {chat_resp.status_code}")
        
    print("\n" + "=" * 60)
    print("Test complete!")
    print("=" * 60)

if __name__ == "__main__":
    test_chat()
