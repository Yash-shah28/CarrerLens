# Start with FastAPI

## Step-1
1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
5. Access the interactive API documentation (Swagger UI):
   Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) in your browser.

