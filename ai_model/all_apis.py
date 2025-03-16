from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import random
import os
import time
from dotenv import load_dotenv
from twilio.rest import Client
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import joblib
import numpy as np
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File
import uvicorn
import cv2
import numpy as np
import base64
from deepface import DeepFace
from fastapi.middleware.cors import CORSMiddleware


# Load trained models
model = joblib.load("fraud_model.pkl")
scaler = joblib.load("scaler.pkl")
encoder_location = joblib.load("encoder_location.pkl")
encoder_merchant = joblib.load("encoder_merchant.pkl")
encoder_ip = joblib.load("encoder_ip.pkl")
encoder_transaction_type = joblib.load("encoder_transaction_type.pkl")

# Load environment variables from .env file
load_dotenv()
# Path to the admin image
admin_image_path = './admins/me.jpeg'

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



class Transaction(BaseModel):
    card_number: str
    cvv: str
    location: str
    ip_address: str
    merchant: str
    amount: float
    transaction_type: str
    time_of_day: int

@app.post("/check_fraud")
def predict_fraud(transaction: Transaction):
    try:
        # Encode categorical variables with handling for unseen labels
        known_locations = encoder_location.classes_
        location_encoded = encoder_location.transform([[transaction.location]])[0] if transaction.location in known_locations else -1

        known_merchants = encoder_merchant.classes_
        merchant_encoded = encoder_merchant.transform([[transaction.merchant]])[0] if transaction.merchant in known_merchants else -1

        known_ips = encoder_ip.classes_
        ip_encoded = encoder_ip.transform([[transaction.ip_address]])[0] if transaction.ip_address in known_ips else -1

        known_types = encoder_transaction_type.classes_
        transaction_type_encoded = encoder_transaction_type.transform([[transaction.transaction_type]])[0] if transaction.transaction_type in known_types else -1

        # Prepare input data
        input_data = np.array([[int(transaction.card_number[-4:]), int(transaction.cvv),
                                location_encoded, ip_encoded, merchant_encoded, transaction.amount,
                                transaction_type_encoded, transaction.time_of_day]], dtype=float)

        # Normalize numerical values
        input_data[:, [5, 7]] = scaler.transform(input_data[:, [5, 7]])

        # Predict fraud
        prediction = model.predict(input_data)
        result = "Fraudulent Transaction" if prediction[0] == 1 else "Legitimate Transaction"

        return {"prediction": result}

    except Exception as e:
        return {"error": str(e)}



@app.post("/match_face")
async def match_face(image: UploadFile = File(...)):
    try:
        image_data = await image.read()
        np_arr = np.frombuffer(image_data, np.uint8)
        image_cv = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        # Save the received image temporarily
        temp_image_path = "temp_face.png"
        cv2.imwrite(temp_image_path, image_cv)

        # Perform face verification using DeepFace
        result = DeepFace.verify(img1_path=temp_image_path, img2_path=admin_image_path, enforce_detection=False)

        return {
            'success': True,
            'verified': result['verified'],
            'distance': result['distance'],
            'threshold': result['threshold'],
            'similarity_metric': result['similarity_metric'],
            'message': 'Face matches admin' if result['verified'] else 'Face does not match admin'
        }
    except Exception as e:
        return {'success': False, 'message': str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
