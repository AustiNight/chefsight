# ChefSight: Kitchen Finance Automation

A complete system for processing receipt photos using AI and visualizing kitchen expenses via a React dashboard.

## Overview

1.  **Input:** Drop receipt images into `backend/receipts_input`.
2.  **Process:** Run `python process_receipts.py`.
3.  **Output:** Data is extracted to `public/data/expenses.csv`.
4.  **Visualize:** The React Dashboard reads the CSV and updates charts.

## Setup

### 1. Dashboard (Frontend)

Prerequisites: Node.js 18+

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start development server:
    ```bash
    npm start
    ```

### 2. Receipt Processor (Backend)

Prerequisites: Python 3.9+

1.  Navigate to backend:
    ```bash
    cd backend
    ```
2.  Install requirements:
    ```bash
    pip install -r requirements.txt
    ```
3.  Configure OpenAI API key:
    ```bash
    cp .env.example .env
    # then set OPENAI_API_KEY in backend/.env
    ```
4.  Run the script:
    ```bash
    python process_receipts.py
    ```
5.  (Optional) Start the API server so the dashboard button can trigger scans:
    ```bash
    python server.py
    ```

## Google Drive Sync

To automate the ingestion of receipts:

1.  Install the Google Drive for Desktop app.
2.  Configure `backend/process_receipts.py` so that `INPUT_FOLDER` points to your Google Drive synced folder (e.g., `/Users/Chef/Google Drive/Receipts`).
3.  Set up a Cron job (Linux/Mac) or Task Scheduler (Windows) to run the python script daily.

## AI Configuration

`process_receipts.py` uses OpenAI for receipt extraction. The script reads `OPENAI_API_KEY` from `backend/.env`, and will prompt you if it is missing (then saves it to `.env`).
