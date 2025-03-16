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
pip install --no-cache-dir dlib face-recognition-models fastapi uvicorn opencv-python numpy face-recognition twilio joblib pandas scikit-learn
pip install dlib==19.21.1
python3 train_fraud_model.py
uvicorn fraud_api:app --host 0.0.0.0 --port 8000
```

# frontend 
```sh 
cd fraud-detection-frontend 
npm i 
npm run dev
```

http://127.0.0.1:8000/predict 
{
    "card_number": "1234567812345678",
    "cvv": "123",
    "location": "New York",
    "ip_address": "192.168.1.1",
    "merchant": "Amazon",
    "amount": 1200,
    "transaction_type": "Online",
    "time_of_day": 23
}




# 
```sh 
#pip install --no-cache-dir face_recognition
# uvicorn fraud_face_api:app --host 0.0.0.0 --port 8000
# uvicorn fraud_face_api:app --host 0.0.0.0 --port 8000

# pip install dlib
# uvicorn fraud_api:app --host 0.0.0.0 --port 8000
# uvicorn face_recognition_api:app --host 0.0.0.0 --port 8000
```
