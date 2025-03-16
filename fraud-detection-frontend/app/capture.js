 "use client";
 import { useRef, useState, useEffect } from "react";

 export default function Capture() {
     const videoRef = useRef(null);
     const canvasRef = useRef(null);
     const [result, setResult] = useState("Detection Result will be here soom");
     const [capturedImage, setCapturedImage] = useState(null);

     useEffect(() => {
         // Access the camera when component mounts
         navigator.mediaDevices.getUserMedia({ video: true })
             .then((stream) => {
                 if (videoRef.current) {
                     videoRef.current.srcObject = stream;
                 }
             })
             .catch((err) => {
                 console.error("Error accessing webcam: ", err);
                 alert("Please allow camera access.");
             });
     }, []);

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

     const sendToAPI = async (imageData) => {
         try {
             const blob = await fetch(imageData).then(res => res.blob());
             const formData = new FormData();
             formData.append("image", blob, "photo.png");

             const response = await fetch("http://localhost:8000/match_face", {
                 method: "POST",
                 body: formData,
             });

             const data = await response.json();
             setResult(data.message);
         } catch (error) {
             console.error("Error:", error);
         }
     };


     return (
         <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
             <h1 className="text-2xl font-bold mb-4">Face Verification</h1>
             <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg flex items-center justify-center">
             <p className="mt-4 text-lg font-semibold">{result}</p>
                 <video ref={videoRef} autoPlay className="w-full h-full object-cover" />
             </div>
             <canvas ref={canvasRef} className="hidden" />
             <button
                 onClick={capturePhoto}
                 className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
             >
                 Capture & Verify
             </button>
             {capturedImage && (
                 <img src={capturedImage} alt="Captured" className="mt-4 w-32 h-32 rounded-full border-2 border-green-500 shadow-md" />
             )}
         </div>
     );
 }