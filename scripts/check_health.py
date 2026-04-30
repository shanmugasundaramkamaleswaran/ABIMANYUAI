import http.client
import ssl
import sys

def check_backend():
    print("Checking Abimanyu AI Backend Health...")
    try:
        conn = http.client.HTTPConnection("localhost", 8000, timeout=5)
        conn.request("GET", "/health")
        response = conn.getresponse()
        data = response.read().decode()
        
        if response.status == 200:
            print("\n✅ Backend is UP and Healthy!")
            print(f"Response: {data}")
            return True
        else:
            print(f"\n❌ Backend returned status {response.status}")
            print(f"Response: {data}")
            return False
            
    except ConnectionRefusedError:
        print("\n❌ Backend is DOWN (Connection Refused)")
        print("Tip: Run 'npm run backend' or 'python backend/main.py' to start it.")
        return False
    except Exception as e:
        print(f"\n❌ Connection Error: {e}")
        print("\nPossible Issues:")
        print("1. Backend is not running.")
        print("2. Port 8000 is occupied by another process.")
        print("3. Firewall is blocking the connection.")
        return False

if __name__ == "__main__":
    if check_backend():
        sys.exit(0)
    else:
        sys.exit(1)
