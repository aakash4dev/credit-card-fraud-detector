"use client";

import { useRef, useState, useEffect } from "react";
import axios from "axios";
import styles from "./page.module.css";

export default function Home() {
    const [isClient, setIsClient] = useState(false);
    const [step, setStep] = useState(1);
    const [message, setMessage] = useState("");
    const [transaction, setTransaction] = useState({
        card_number: "",
        cvv: "",
        amount: "",
        location: "",
        ip_address: "",
        merchant: "Amazon",
        transaction_type: "Online",
        time_of_day: "",
        phone: "",
        otp: "",
    });

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(null);

    // Ensure component is mounted before accessing the browser APIs
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient) {
            navigator.mediaDevices
            .getUserMedia({ video: { facingMode: "user" } })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch((err) => {
                console.error("Error accessing webcam: ", err);
                alert("Please allow camera access.");
            });

            // Auto-detect IP and time
            const currentHour = new Date().getHours();
            setTransaction((prev) => ({ ...prev, time_of_day: currentHour.toString() }));

            axios
                .get("https://api.ipify.org?format=json")
                .then((response) => {
                    setTransaction((prev) => ({ ...prev, ip_address: response.data.ip }));
                })
                .catch((error) => {
                    console.error("Error fetching IP:", error);
                    setTransaction((prev) => ({ ...prev, ip_address: "192.168.1.1" }));
                });
        }
    }, [isClient]);

        // Capture the photo from video stream
    const capturePhoto = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const context = canvasRef.current.getContext("2d");
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

        const imageData = canvasRef.current.toDataURL("image/png");
        setCapturedImage(imageData); // Store the captured image
        sendToAPI(imageData);
    };

    // Send captured image to FastAPI backend
    const sendToAPI = async (imageData) => {
        try {
            const blob = await fetch(imageData).then(res => res.blob());
            const formData = new FormData();
            formData.append("image", blob, "photo.png"); // Ensure "image" matches backend

            const response = await fetch("http://localhost:8000/match_face", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            setMessage(data.message);

            if (data.verified) {
                setStep(2); // Move to next step
            } else {
                setMessage("Verification failed. Retrying in 3 seconds...");
            }
        } catch (error) {
            console.error("Error:", error);
            setMessage("Error verifying face.");
        }
    };


    // Handle input changes for transaction
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTransaction((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckFraud = async () => {
        try {
            const response = await axios.post(
                "http://localhost:8000/check_fraud",
                {
                    card_number: transaction.card_number,
                    cvv: transaction.cvv,
                    location: transaction.location,
                    ip_address: transaction.ip_address,
                    merchant: transaction.merchant,
                    amount: parseFloat(transaction.amount),
                    transaction_type: transaction.transaction_type,
                    time_of_day: parseInt(transaction.time_of_day),
                },
                { headers: { "Content-Type": "application/json" } }
            );

            setMessage(response.data.prediction);
            if (response.data.prediction === "Legitimate Transaction") {
                setStep(3);
            }
        } catch (error) {
            console.error("Axios error:", error);
            setMessage("Network Error: Could not reach the server.");
        }
    };
const handleSendOtp = async () => {
        if (!transaction.phone) {
            setMessage("Please enter a phone number.");
            return;
        }
        try {
            const response = await axios.post(
                "http://localhost:8000/send_otp",
                { phone_number: transaction.phone },
                { headers: { "Content-Type": "application/json" } }
            );
            setMessage(response.data.message || "OTP sent to your phone!");
            setStep(4);
        } catch (error) {
            console.error("Axios error:", error.message, error.code);
            setMessage(error.response?.data?.error || "Error sending OTP.");
        }
    };

    // Handle OTP verification
    const handleVerifyOtp = async () => {
        if (!transaction.otp) {
            setMessage("Please enter the OTP.");
            return;
        }
        try {
            const response = await axios.post(
                "http://localhost:8000/verify_otp",
                {
                    phone_number: transaction.phone,
                    otp: transaction.otp,
                },
                { headers: { "Content-Type": "application/json" } }
            );
            setMessage(response.data.status || "OTP verified successfully!");
            setStep(5); // Move to transaction completed step
        } catch (error) {
            console.error("Error verifying OTP:", error);
            setMessage(error.response?.data?.error || "Invalid OTP.");
        }
    };

    // Reset transaction to start over
    const handleReset = () => {
        setStep(1);
        setMessage("");
        setTransaction({
            card_number: "",
            cvv: "",
            amount: "",
            location: "",
            ip_address: transaction.ip_address, // Keep auto-detected values
            merchant: "Amazon",
            transaction_type: "Online",
            time_of_day: transaction.time_of_day, // Keep auto-detected values
            phone: "",
            otp: "",
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {step === 1 && isClient && (
                    <div className={styles.step}>
                        <h2>Step 1: Face Verification</h2>
                        <div className={styles.videoContainer}>
                            <video ref={videoRef} autoPlay className={styles.video} />
                            {capturedImage && (
                                <img
                                    src={capturedImage}
                                    alt="Captured"
                                    className={styles.capturedImage}
                                />
                            )}
                        </div>
                        <canvas ref={canvasRef} className={styles.hidden} />
                        <button onClick={capturePhoto} className={styles.button}>
                            Capture & Verify
                        </button>
                        {message && <p className={styles.message}>{message}</p>}
                    </div>
                )}

                {step === 2 && (
                    <div className={styles.creditCard}>
                        <div className={styles.cardFront}>
                            <h2 className={styles.cardTitle}>Credit Card Transaction</h2>
                            <input
                                type="text"
                                name="card_number"
                                placeholder="•••• •••• •••• ••••"
                                value={transaction.card_number}
                                onChange={handleInputChange}
                                className={styles.cardNumber}
                                maxLength="16"
                            />
                            <div className={styles.cardDetails}>
                                <input
                                    type="text"
                                    name="cvv"
                                    placeholder="CVV"
                                    value={transaction.cvv}
                                    onChange={handleInputChange}
                                    className={styles.cvv}
                                    maxLength="3"
                                />
                                <input
                                    type="text"
                                    name="location"
                                    placeholder="Location"
                                    value={transaction.location}
                                    onChange={handleInputChange}
                                    className={styles.location}
                                />
                            </div>
                            <input
                                type="number"
                                name="amount"
                                placeholder="Amount"
                                value={transaction.amount}
                                onChange={handleInputChange}
                                className={styles.amount}
                            />
                            <button onClick={handleCheckFraud} className={styles.button}>
                                Check Fraud
                            </button>
                            {message && <p className={styles.message}>{message}</p>}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className={styles.step}>
                        <h2>Step 3: Phone Number for OTP</h2>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number"
                            value={transaction.phone}
                            onChange={handleInputChange}
                            className={styles.input}
                        />
                        <button onClick={handleSendOtp} className={styles.button}>
                            Send OTP
                        </button>
                        {message && <p className={styles.message}>{message}</p>}
                    </div>
                )}

                {step === 4 && (
                    <div className={styles.step}>
                        <h2>Step 4: Verify OTP</h2>
                        <input
                            type="text"
                            name="otp"
                            placeholder="Enter OTP"
                            value={transaction.otp}
                            onChange={handleInputChange}
                            className={styles.input}
                            maxLength="6"
                        />
                        <button onClick={handleVerifyOtp} className={styles.button}>
                            Verify OTP
                        </button>
                        {message && <p className={styles.message}>{message}</p>}
                    </div>
                )}

                {step === 5 && (
                    <div className={styles.step}>
                        <h2>Transaction Completed</h2>
                        <p className={styles.successMessage}>
                            Your transaction of ${transaction.amount} to {transaction.merchant} has been successfully completed!
                        </p>
                        <button onClick={handleReset} className={styles.button}>
                            Start New Transaction
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
