import requests
import ssl
import socket
import json
import os
from datetime import datetime

def check_ssl(host, port):
    print(f"--- Checking SSL for {host}:{port} ---")
    context = ssl.create_default_context()
    context.check_hostname = False
    context.verify_mode = ssl.CERT_NONE
    
    try:
        with socket.create_connection((host, port)) as sock:
            with context.wrap_socket(sock, server_hostname=host) as ssock:
                cert = ssock.getpeercert(binary_form=True)
                print("[SUCCESS] Able to establish SSL connection.")
    except Exception as e:
        print(f"[FAIL] SSL connection failed: {e}")

def check_endpoint(url):
    print(f"--- Testing Endpoint: {url} ---")
    try:
        # Use verify=False because of self-signed certs in local dev
        response = requests.get(url, verify=False, timeout=5)
        print(f"[SUCCESS] Status Code: {response.status_code}")
        print(f"[INFO] Response: {response.text[:100]}...")
        
        # Check CORS headers
        print("[INFO] CORS Headers:")
        for header, value in response.headers.items():
            if 'access-control' in header.lower():
                print(f"  {header}: {value}")
    except Exception as e:
        print(f"[FAIL] Request failed: {e}")

def check_env_vars():
    print("--- Checking Environment Variables ---")
    vars_to_check = ["VERCEL_FRONTEND_URL", "PORT"]
    for var in vars_to_check:
        print(f"{var}: {os.getenv(var, 'Not set')}")

if __name__ == "__main__":
    print(f"=== Abimanyu AI Backend Self-Test ({datetime.now()}) ===")
    
    # Ensure we are in the right directory if needed or use defaults
    host = "localhost"
    port = 8000
    
    check_ssl(host, port)
    check_endpoint(f"https://{host}:{port}/health")
    check_endpoint(f"https://{host}:{port}/rag/stats")
    check_env_vars()
    
    print("=== End of Self-Test ===")
