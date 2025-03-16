from fastapi import FastAPI, File, UploadFile
import cv2
import numpy as np
import os

app = FastAPI()

# Load OpenCV Face Detector (DNN)
face_net = cv2.dnn.readNetFromCaffe("models/deploy.prototxt", "models/res10_300x300_ssd_iter_140000.caffemodel")

# Load Known Faces Database
known_faces = []
known_names = []

def detect_faces(image):
    """ Detect faces using OpenCV DNN """
    h, w = image.shape[:2]
    blob = cv2.dnn.blobFromImage(image, scalefactor=1.0, size=(300, 300), mean=(104.0, 177.0, 123.0))
    face_net.setInput(blob)
    detections = face_net.forward()

    faces = []
    for i in range(detections.shape[2]):
        confidence = detections[0, 0, i, 2]
        if confidence > 0.5:
            box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
            (startX, startY, endX, endY) = box.astype("int")
            face = image[startY:endY, startX:endX]
            faces.append(face)
    
    return faces

def load_known_faces():
    """ Load faces from ./known_faces/ folder """
    global known_faces, known_names
    known_faces.clear()
    known_names.clear()

    for file in os.listdir("./known_faces"):
        if file.endswith(".jpg") or file.endswith(".png"):
            name = file.split(".")[0]  # Use filename as person's name
            img = cv2.imread(f"./known_faces/{file}")
            faces = detect_faces(img)
            
            if len(faces) > 0:
                gray_face = cv2.cvtColor(faces[0], cv2.COLOR_BGR2GRAY)
                known_faces.append(gray_face)
                known_names.append(name)

# Load Faces at Startup
load_known_faces()

@app.post("/recognize_face")
async def recognize_face(image: UploadFile = File(...)):
    """ Recognizes a face against stored faces """
    contents = await image.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    faces = detect_faces(img)
    if len(faces) == 0:
        return {"recognized_person": "No face detected"}

    # Convert to grayscale for comparison
    gray_face = cv2.cvtColor(faces[0], cv2.COLOR_BGR2GRAY)

    # Compare with known faces using LBPH Recognizer
    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognizer.train(known_faces, np.array(range(len(known_names))))

    label, confidence = recognizer.predict(gray_face)

    if confidence < 100:
        return {"recognized_person": known_names[label], "confidence": confidence}
    else:
        return {"recognized_person": "Unknown"}

