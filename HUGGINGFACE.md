# Deploying backend to Hugging Face Spaces

1. Go to https://huggingface.co/spaces and create a new Space (choose `Gradio` or `Static` by default — the type is ignored when you provide a Python entrypoint).
2. For the repository source, choose "From existing repo" and enter your GitHub repository: `https://github.com/ma018nc/Event-Management-System`.
3. Set the hardware to `CPU` and the visibility as you prefer.
4. The Space will run `python app.py` by default; `app.py` in the repo root starts the FastAPI app on port `7860`.
5. The `requirements.txt` at the repository root will be installed by Spaces (it contains `fastapi` and `uvicorn`).

Notes:
- Make sure any sensitive keys (like `GOOGLE_PLACES_API_KEY`) are added in the Space's secret environment variables UI, not committed to the repo.
- If you want only the backend running, set the Space to use the repo and it will execute `app.py` which mounts the backend app.
