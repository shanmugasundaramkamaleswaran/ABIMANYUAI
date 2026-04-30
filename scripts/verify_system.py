import os
import socket
import requests
import json
import subprocess
from datetime import datetime

def check_port(host, port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(1)
        return s.connect_ex((host, port)) == 0

def get_process_on_port(port):
    try:
        if os.name == 'nt':  # Windows
            output = subprocess.check_output(f'netstat -ano | findstr :{port}', shell=True).decode()
            if output:
                pid = output.strip().split()[-1]
                proc = subprocess.check_output(f'tasklist /FI "PID eq {pid}"', shell=True).decode()
                return f"PID {pid} ({proc.splitlines()[-1].split()[0]})"
        else:
            output = subprocess.check_output(f'lsof -i :{port} -t', shell=True).decode()
            if output:
                return f"PID {output.strip()}"
    except:
        pass
    return "Unknown"

def verify_system():
    print(f"=== Abimanyu AI System Self-Test ({datetime.now().strftime('%Y-%m-%d %H:%M:%S')}) ===")
    
    # 1. Check Backend
    backend_port = 8000
    backend_up = check_port('127.0.0.1', backend_port)
    print(f"[BACKEND] Status: {'UP' if backend_up else 'DOWN'}")
    if backend_up:
        print(f"          Process: {get_process_on_port(backend_port)}")
        try:
            resp = requests.get(f"https://127.0.0.1:{backend_port}/health", verify=False, timeout=2)
            print(f"          Health Check: {resp.status_code} - {resp.json().get('status')}")
        except Exception as e:
            print(f"          Health Check: FAILED ({e})")
    
    # 2. Check Frontend
    frontend_port = 8080
    frontend_up = check_port('127.0.0.1', frontend_port)
    print(f"[FRONTEND] Status: {'UP' if frontend_up else 'DOWN'}")
    if frontend_up:
        print(f"           Process: {get_process_on_port(frontend_port)}")

    # 3. SSL Files
    cert_path = "backend/cert.pem"
    key_path = "backend/key.pem"
    print(f"[SSL] Certificate: {'EXISTS' if os.path.exists(cert_path) else 'MISSING'}")
    print(f"      Key: {'EXISTS' if os.path.exists(key_path) else 'MISSING'}")

    # 4. Common "Failed to fetch" causes
    print("\n--- Diagnostic Findings ---")
    if backend_up and frontend_up:
        print("[!] Backend and Frontend are both running.")
        print("[!] If the browser still shows 'Failed to fetch':")
        print("    1. Open https://127.0.0.1:8000/health in your browser.")
        print("    2. If you see a 'Your connection is not private' warning, click 'Advanced' -> 'Proceed to 127.0.0.1'.")
        print("    3. Return to the frontend (https://localhost:8080) and refresh.")
    elif not backend_up:
        print("[X] Backend is not running on port 8000. Please start it using 'py main.py' in the backend directory.")
    elif not frontend_up:
        print("[X] Frontend is not running on port 8080. Please start it using 'npm run dev' in the frontend directory.")

    print("\n=== End of Self-Test ===")

if __name__ == "__main__":
    verify_system()
