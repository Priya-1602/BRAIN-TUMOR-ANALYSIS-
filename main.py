from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os
import uuid
import matplotlib
matplotlib.use('Agg')  # Must be before importing pyplot
import matplotlib.pyplot as plt
from typing import Dict, Optional
from pydantic import BaseModel

# Import your model functions
from brain_tumor_api.utils.predict import predict_image, generate_gradcam

# Initialize FastAPI
app = FastAPI(
    title="Brain Tumor Detection API",
    description="API for detecting brain tumors in MRI scans",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create necessary directories
os.makedirs("static/uploads", exist_ok=True)
os.makedirs("static/results", exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Response Models
class PredictionResult(BaseModel):
    class_name: str
    confidence: float

class PredictionResponse(BaseModel):
    success: bool
    prediction: PredictionResult
    class_probabilities: Dict[str, float]
    gradcam_url: Optional[str] = None
    error: Optional[str] = None

# Routes
@app.get("/")
async def root():
    return {
        "message": "Brain Tumor Detection API",
        "status": "running",
        "documentation": "/docs"
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)):
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400, 
                detail="File must be an image (JPEG, PNG, etc.)"
            )

        # Generate unique filename
        file_ext = file.filename.split('.')[-1]
        filename = f"{uuid.uuid4()}.{file_ext}"
        filepath = f"static/uploads/{filename}"
        
        # Save uploaded file
        with open(filepath, "wb") as buffer:
            buffer.write(await file.read())

        # Make prediction
        pred_idx, confidence, probs = predict_image(filepath)
        
        # Map class indices to names
        class_names = {
            0: "Glioma",
            1: "Meningioma",
            2: "No Tumor",
            3: "Pituitary"
        }
        
        # Generate Grad-CAM
        try:
            gradcam, _ = generate_gradcam(filepath)
            gradcam_filename = f"gradcam_{filename}"
            gradcam_path = f"static/results/{gradcam_filename}"
            plt.imsave(gradcam_path, gradcam, cmap='jet', alpha=0.5)
            gradcam_url = f"/static/results/{gradcam_filename}"
        except Exception as e:
            print(f"Grad-CAM generation failed: {e}")
            gradcam_url = None
        
        # Prepare response
        return {
            "success": True,
            "prediction": {
                "class_name": class_names[pred_idx],
                "confidence": float(confidence)
            },
            "class_probabilities": {
                class_names[i]: float(probs[i]) 
                for i in range(len(class_names))
            },
            "gradcam_url": gradcam_url
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "prediction": None,
            "class_probabilities": {},
            "gradcam_url": None
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
