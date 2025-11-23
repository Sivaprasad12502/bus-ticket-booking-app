import firebase_admin
from firebase_admin import credentials, auth
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SERVICE_ACCOUNT_PATH = os.path.join(BASE_DIR, "firebase/serviceAccountKey.json")
print("Looking for service account at:", SERVICE_ACCOUNT_PATH)
print("Exists:", os.path.exists(SERVICE_ACCOUNT_PATH))

cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
