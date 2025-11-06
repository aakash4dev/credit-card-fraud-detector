# Credit Card Fraud Detector

An open-source, AI-powered fraud detection system that combines machine learning, blockchain security, and facial recognition to prevent fraudulent transactions.

## Features

- **AI Fraud Detection**: Utilizes machine learning models to identify and flag suspicious transactions in real-time.
- **Blockchain Security**: Enhances transaction security through the use of decentralized smart contracts on the Ethereum blockchain.
- **Facial Recognition**: Provides an additional layer of security with biometric verification to authorize transactions.
- **Real-Time Alerts**: Sends instant SMS notifications about potentially fraudulent activity via the Twilio API.
- **Interactive Dashboard**: A user-friendly web interface built with Next.js for monitoring and managing transactions.

## Technology Stack

- **Backend**: FastAPI, TensorFlow, OpenCV, Dlib, Scikit-Learn
- **AI Model**: DeepFace, Face Recognition
- **Blockchain**: Hardhat, Solidity, Ethereum
- **Frontend**: Next.js, React, TailwindCSS
- **Notifications**: Twilio API

## Getting Started

### Prerequisites

- **Ubuntu**:
  ```sh
  sudo apt update
  sudo apt install -y build-essential cmake libopenblas-dev liblapack-dev libx11-dev libgtk-3-dev python3.10
  ```
- **Node.js**: v18.x or later
- **Python**: 3.10

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/aakash4dev/credit-card-fraud-detector.git
    cd credit-card-fraud-detector
    ```

2.  **Set up the AI Model:**
    ```sh
    cd ai_model
    python3.10 -m venv venv
    source venv/bin/activate
    pip install --no-cache-dir dlib fastapi uvicorn opencv-python numpy twilio joblib pandas pillow scikit-learn python-dotenv deepface tensorflow-cpu tf-keras python-multipart
    pip install git+https://github.com/ageitgey/face_recognition_models
    pip install dlib==19.21.1
    deactivate
    source venv/bin/activate
    ```

3.  **Set up Twilio:**
    - Create a [Twilio](https://twilio.com/) account.
    - Get your Phone Number, Account SID, and Auth Token from the [Twilio Console](https://console.twilio.com/).
    - Create a `.env` file in the `ai_model` directory and add your credentials:
      ```env
      TWILIO_ACCOUNT_SID=your_account_sid
      TWILIO_AUTH_TOKEN=your_auth_token
      TWILIO_PHONE_NUMBER=your_twilio_number
      ```

4.  **Set up the Blockchain API:**
    ```sh
    cd ../blockchain_api
    npm install
    ```

5.  **Set up the Frontend:**
    ```sh
    cd ../fraud-detection-frontend
    npm install
    ```

## Running the Application

1.  **Start the AI Model API:**
    ```sh
    cd ai_model
    source venv/bin/activate
    python3 train_fraud_model.py
    uvicorn all_apis:app --host 0.0.0.0 --port 8000
    ```

2.  **Start the local Blockchain:**
    (In a new terminal)
    ```sh
    cd blockchain_api
    npx hardhat node
    ```

3.  **Deploy the Smart Contract and Start the Blockchain API:**
    (In a new terminal)
    ```sh
    cd blockchain_api
    npx hardhat run --network localhost scripts/deploy.js
    node api.js
    ```

4.  **Start the Frontend:**
    (In a new terminal)
    ```sh
    cd fraud-detection-frontend
    npm run dev
    ```

5.  **Enable Camera Permissions in Chrome:**
    - Navigate to `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
    - Add `http://localhost:3000` to the list of origins.
    - Relaunch Chrome.

6.  **Access the application** at [http://localhost:3000](http://localhost:3000).

## Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.