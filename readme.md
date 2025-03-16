### One time setup for project
```sh
# ubuntu system requirements and update.
sudo apt update
sudo apt install -y build-essential cmake libopenblas-dev liblapack-dev libx11-dev libgtk-3-dev
sudo apt install python3.10
cd ai_model
python3.10 -m venv venv
source venv/bin/activate
pip install --no-cache-dir dlib  fastapi uvicorn opencv-python numpy twilio joblib pandas  fastapi  pillow uvicorn  pip setuptools wheel  tensorflow-cpu  deepface  python-multipart face_recognition  twilio python-dotenv  scikit-learn  deepface tf-keras
pip install git+https://github.com/ageitgey/face_recognition_models
pip install dlib==19.21.1
deactivate
source venv/bin/activate
```

### Train and start api server
```sh
cd ai_model
source venv/bin/activate

python3 train_fraud_model.py
uvicorn all_apis:app --host 0.0.0.0 --port 8000
```

### Give camera permission in Chrome to localhost:3000
1. Open `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
2. copy paste `http://localhost:8000`
3. Restart Chrome and try again.

### frontend 
```sh 
cd fraud-detection-frontend 
npm i 
npm run dev
```