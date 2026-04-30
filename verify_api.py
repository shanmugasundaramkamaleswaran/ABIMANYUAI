import requests
import urllib3
import json

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def test_connection():
    try:
        print("Testing Health Check...")
        r = requests.get('https://localhost:8000/health', verify=False, timeout=5)
        print(f"Health Status: {r.status_code}")
        
        print("\nTesting Login Endpoint...")
        payload = {"email": "demo@example.com", "password": "demo123"}
        r = requests.post('https://localhost:8000/auth/login', json=payload, verify=False, timeout=5)
        print(f"Login Status: {r.status_code}")
        if r.status_code == 200:
            token = r.json().get('access_token')
            print("Login successful! Token acquired.")
            
            print("\nTesting Chat Endpoint...")
            headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
            chat_payload = {"message": "Namaste"}
            r = requests.post('https://localhost:8000/chat', json=chat_payload, headers=headers, verify=False, timeout=10)
            print(f"Chat Status: {r.status_code}")
            if r.status_code == 200:
                print(f"Chat Reply: {r.json().get('reply')[:100]}...")
            else:
                print(f"Chat Error: {r.text}")
        else:
            print(f"Login Error: {r.text}")
            
    except Exception as e:
        print(f"Verification Failed: {e}")

if __name__ == "__main__":
    test_connection()
