# ChefSight Backend

## Setup

1. Create and activate a virtual environment:
   ```bash
   python3 -m venv .venv
   .venv/bin/pip install -r requirements.txt
   ```

2. Configure your OpenAI key:
   ```bash
   cp .env.example .env
   # set OPENAI_API_KEY in backend/.env
   ```

3. Run the processor:
   ```bash
   .venv/bin/python process_receipts.py
   ```

Notes:
- If OPENAI_API_KEY is not set, the script will prompt you and save it to backend/.env.

## API Server (for UI trigger)

Run the local API so the dashboard button can trigger scans:

```bash
.venv/bin/python server.py
```

The Vite dev server proxies `/api` to `http://localhost:8000`.
