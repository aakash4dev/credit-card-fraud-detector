# **Credit Card Fraud Detector**  
An open-source, AI-powered fraud detection system that combines **machine learning, blockchain security, and facial recognition** to prevent fraudulent transactions.

## **📌 Features**
✔️ **AI Fraud Detection** – Uses ML models to detect suspicious transactions.  
✔️ **Blockchain Security** – Secure transactions using smart contracts.  
✔️ **Facial Recognition** – Prevents fraud with biometric verification.  
✔️ **Twilio Alerts** – Sends real-time fraud alerts via SMS.  
✔️ **Next.js Frontend** – Interactive user dashboard.  

---

## **⚙️ Technology Stack**
🔹 **Backend**: FastAPI, TensorFlow, OpenCV, Dlib, Scikit-Learn  
🔹 **AI Model**: DeepFace, Face Recognition  
🔹 **Blockchain**: Hardhat, Solidity, Ethereum  
🔹 **Frontend**: Next.js, React, TailwindCSS  
🔹 **Notifications**: Twilio API  

---

## **🛠️ One-Time Project Setup**
Before running the project, ensure your system meets these **prerequisites**.

### **System Requirements (Ubuntu)**
Run the following commands to install required dependencies:  
```sh
# Update system packages
sudo apt update

# Install dependencies
sudo apt install -y build-essential cmake libopenblas-dev liblapack-dev libx11-dev libgtk-3-dev python3.10
```

---

### **AI Model Setup**

```sh

cd ai_model
python3.10 -m venv venv
source venv/bin/activate

#  Install Dependencies
pip install --no-cache-dir dlib fastapi uvicorn opencv-python numpy twilio joblib pandas pillow scikit-learn python-dotenv deepface tensorflow-cpu tf-keras python-multipart
pip install git+https://github.com/ageitgey/face_recognition_models
pip install dlib==19.21.1

# Deactivate and reactivate the virtual environment:**
deactivate
source venv/bin/activate
```


### **Train and Start AI Fraud Detection API**
```sh
cd ai_model
source venv/bin/activate

# Train the AI fraud detection model
python3 train_fraud_model.py

# Start the FastAPI server
uvicorn all_apis:app --host 0.0.0.0 --port 8000
```

---

### If havn't setup Twilio API for SMS, Stop above code and restart after this setup:
- Create a **free account** on [Twilio](https://twilio.com/) and log in.  
- Go to the [Twilio Console](https://console.twilio.com/) to get:  
  - **Phone Number**  
  - **Account SID**  
  - **Auth Token**  
- Create a `.env` file inside the `ai_model` folder and paste your Twilio credentials:
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

---


### **Start Local Blockchain on new terminal**
```sh
cd blockchain_api
npm i 
npx hardhat node
```

### **Deploy Smart Contract & Start Blockchain API on New terminal**
```sh
cd blockchain_api
npx hardhat run --network localhost scripts/deploy.js
node api.js
```

---

---

### **Start Next.js Frontend in new terminal**
```sh
cd fraud-detection-frontend
npm i
npm run dev
```
---

### **Enable Camera Permissions in Chrome**
To allow facial recognition in the browser, grant **camera permissions** for `localhost:3000`:

1. Open Chrome and go to:  
   ```
   chrome://flags/#unsafely-treat-insecure-origin-as-secure
   ```
2. Paste this into the box:  
   ```
   http://localhost:3000
   ```
3. **Restart Chrome** and try again.

### Thats all, Now open localhost:3000 on the Chrome

---
---
<!-- 
## **🛠️ Contribution Guide**
Want to improve this project? Contributions are welcome! 🎉  

### **🔹 Fork & Clone the Repository**
```sh
git clone https://github.com/aakash4dev/credit-card-fraud-detector.git
cd credit-card-fraud-detector
```

### **🔹 Create a New Branch**
```sh
git checkout -b feature-your-feature-name
```

### **🔹 Make Changes & Commit**
```sh
git add .
git commit -m "Added new feature"
```

### **🔹 Push Changes & Open a Pull Request**
```sh
git push origin feature-your-feature-name
```
Go to **GitHub** and submit a **Pull Request (PR).** 🚀

---

## **📜 License**
This project is **open-source** under the **MIT License**. Feel free to use, modify, and distribute. -->
