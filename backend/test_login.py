import requests
import json

API_BASE = "http://127.0.0.1:8000"

print("Testing Admin Login...")
try:
    response = requests.post(
        f"{API_BASE}/auth/login",
        json={"email": "admin@gmail.com", "password": "admin123"},
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        print(" Login successful!")
        print(f"Cookies: {response.cookies}")
    else:
        print(" Login failed!")
        
except Exception as e:
    print(f"Error: {e}")

print("\nTesting /auth/me...")
try:
    response = requests.get(f"{API_BASE}/auth/me")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
