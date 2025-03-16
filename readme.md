TODOs:
- blockchain
- face detection
- real OTP verification

# Python AI model: train and start api server
```sh
# ubuntu system requirements and update.
sudo apt update
sudo apt install -y build-essential cmake libopenblas-dev liblapack-dev libx11-dev libgtk-3-dev
sudo apt install -y python3

# train ai model and start the server
cd ai_model
python3 -m venv venv
source venv/bin/activate
pip install --no-cache-dir dlib face-recognition-models fastapi uvicorn opencv-python numpy face-recognition twilio joblib pandas scikit-learn fastapi uvicorn
pip install dlib==19.21.1
python3 train_fraud_model.py
uvicorn fraud_api:app --host 0.0.0.0 --port 8000
```
### Mock sms verification 
```sh 
source venv/bin/activate
uvicorn mock_otp_verification:app --reload --port 8001
```

# frontend 
```sh 
cd fraud-detection-frontend 
npm i 
npm run dev
```