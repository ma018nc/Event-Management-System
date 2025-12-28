import uvicorn
from backend.app.main import app

if __name__ == "__main__":
    # Hugging Face Spaces expects apps to listen on port 7860
    uvicorn.run(app, host="0.0.0.0", port=7860)
