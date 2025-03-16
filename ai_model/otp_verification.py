from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import random
import os
import time
from dotenv import load_dotenv
from twilio.rest import Client
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables from .env file
load_dotenv()

# Get Twilio credentials from .env file
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

# Initialize Twilio client
client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory OTP storage (use a DB in production)
otp_store = {}


# Define request models
class PhoneRequest(BaseModel):
    phone_number: str


class OtpRequest(BaseModel):
    phone_number: str
    otp: str


# Endpoint to send OTP
@app.post("/send_otp")
def send_otp(request: PhoneRequest):
    phone_number = request.phone_number.strip()

    # Generate a 6-digit OTP
    otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])

    # Store OTP with timestamp (expires in 5 minutes)
    otp_store[phone_number] = {"otp": otp, "timestamp": time.time()}

    try:
        # Send OTP via Twilio
        message = client.messages.create(
            body=f"Your OTP code is: {otp}",
            from_=TWILIO_PHONE_NUMBER,
            to=phone_number
        )
        print(f"OTP sent to {phone_number}: {otp}")  # Debugging

        return {"message": "OTP sent successfully"}
    except Exception as e:
        print(f"Error sending OTP: {e}")
        raise HTTPException(status_code=500, detail="Failed to send OTP")


# Endpoint to verify OTP
@app.post("/verify_otp")
def verify_otp(request: OtpRequest):
    phone_number = request.phone_number.strip()
    entered_otp = request.otp.strip()

    stored_data = otp_store.get(phone_number)

    if not stored_data:
        raise HTTPException(status_code=400, detail="OTP expired or not found")

    stored_otp = stored_data["otp"]
    timestamp = stored_data["timestamp"]

    # Check if OTP is expired (valid for 5 minutes)
    if time.time() - timestamp > 300:
        del otp_store[phone_number]
        raise HTTPException(status_code=400, detail="OTP expired. Request a new one.")

    # Verify OTP
    if stored_otp == entered_otp:
        del otp_store[phone_number]  # Remove OTP after successful verification
        return {"status": "OTP verified successfully"}

    raise HTTPException(status_code=400, detail="Invalid OTP")


# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "OTP service is running"}


# curl -X POST "http://localhost:8001/send_otp" -H "Content-Type: application/json" -d '{"phone_number": "+919876543210"}'
# curl -X POST "http://localhost:8001/verify_otp" -H "Content-Type: application/json" -d '{"phone_number": "+919876543210", "otp": "123456"}'
