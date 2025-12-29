import requests
import json

url = "https://galatacarsi-backend-api.onrender.com/api/settings/maintenance-toggle"
payload = {
    "isMaintenanceMode": False,
    "secretKey": "galatacarsi2024-bakim-secret"
}
headers = {
    "Content-Type": "application/json"
}

try:
    print(f"📡 Sending request to {url}...")
    response = requests.post(url, json=payload, headers=headers)
    print(f"📥 Status Code: {response.status_code}")
    print(f"📄 Response: {response.text}")
except Exception as e:
    print(f"❌ Error: {e}")
