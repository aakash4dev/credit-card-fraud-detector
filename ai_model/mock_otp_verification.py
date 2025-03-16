from fastapi import FastAPI
from pydantic import BaseModel
import random
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware to allow requests from Next.js (localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock OTP storage (in-memory; use a database in production)
otp_store = {}

# Request models
class PhoneRequest(BaseModel):
    phone_number: str

class OtpRequest(BaseModel):
    phone_number: str
    otp: str
# Endpoint to send OTP
@app.post("/send_otp")
def send_otp(request: PhoneRequest):
    # Generate a 6-digit OTP
    otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    otp_store[request.phone_number] = otp
    # Simulate sending OTP (print to console for mock)
    print(f"Generated OTP for {request.phone_number}: {otp}")
    return {"message": "OTP sent successfully"}

# Endpoint to verify OTP
@app.post("/verify_otp")
def verify_otp(request: OtpRequest):
    stored_otp = otp_store.get(request.phone_number)
    if stored_otp and stored_otp == request.otp:
        del otp_store[request.phone_number]  # Clear OTP after verification
        return {"status": "OTP verified successfully"}
    return {"error": "Invalid OTP"}

# Optional: Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "Mock OTP server is running"}