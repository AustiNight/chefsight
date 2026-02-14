# ChefSight User Guide

Welcome to **ChefSight**, your automated kitchen finance intelligence system. This guide covers installation, daily usage, configuration, and ongoing software maintenance.

---

## 🚀 1. Installation & Setup

### Prerequisites
1.  **Node.js** (v18 or higher) for the dashboard.
2.  **Python** (v3.9 or higher) for the receipt processor.
3.  **Git** to clone the repository.

### Step-by-Step Install

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/chefsight.git
    cd chefsight
    ```

2.  **Setup the Backend (Python)**
    ```bash
    cd backend
    pip install -r requirements.txt
    ```
    1. Configure your OpenAI key:
        ```bash
        cp .env.example .env
        # set OPENAI_API_KEY in backend/.env
        ```
    *Note: This installs `pandas`, `requests`, and `pillow`.*

3.  **Setup the Frontend (React)**
    ```bash
    # Return to root directory if you are in backend
    cd .. 
    npm install
    ```

---

## 🧾 2. Daily Workflow

### Phase A: Input Receipts
1.  Take photos of your invoices or receipts.
2.  Place the image files (`.jpg`, `.png`, `.heic`) into the `backend/receipts_input` folder.
    *   *Tip: You can sync this folder with Google Drive or Dropbox to allow uploading directly from your phone.*

### Phase B: Process Data
1.  Open your terminal.
2.  Run the processing script:
    ```bash
    cd backend
    python process_receipts.py
    ```
    *Tip: If you run `python server.py` in the backend, you can trigger scans from the dashboard using the "Scan New Receipts" button and retry failed receipts directly in the UI.*
3.  **What happens next?**
    *   The script reads images from `receipts_input`.
    *   It extracts date, store, item, cost, and category data.
    *   It appends this data to `public/data/expenses.csv`.
    *   It moves the images to `receipts_processed` so they aren't processed twice.

### Phase C: View Dashboard
1.  Start the dashboard (if not running):
    ```bash
    npm start
    ```
2.  Open `http://localhost:5173` (or the port shown in your terminal).
3.  The dashboard will automatically load the new data from the CSV file.

---

## 🧠 3. AI Configuration (OpenAI GPT-4o)

The processor reads `OPENAI_API_KEY` from `backend/.env`. If it is missing, the script will prompt you and save it to `.env`.

1.  **Get an API Key**: Sign up at platform.openai.com and generate a new secret key.
2.  **Set the Key**:
    ```bash
    cd backend
    cp .env.example .env
    # set OPENAI_API_KEY in backend/.env
    ```
    *If `OPENAI_API_KEY` is missing, the script will prompt you and save it to `backend/.env`.*

---

## 📊 4. Understanding the Charts

1.  **Spending Distribution (Pie Chart)**:
    *   Shows where your money is going (e.g., 40% on Proteins, 20% on Produce).
    *   *Action:* Use this to set budgets for specific categories.

2.  **Cash Flow Trend (Line Chart)**:
    *   **Blue Line:** Daily spending.
    *   **Green Dashed Line:** Cumulative spending for the period.
    *   *Action:* Watch the green line slope. A steep upward slope means you are burning cash quickly.

3.  **Vendor Volatility (Bar Chart)**:
    *   Compares the "Cost Per Unit" of your top 5 items across different stores.
    *   *Action:* If "Ribeye" is $29/lb at Costco but $36/lb at Local Butcher, the chart will highlight this price gap.

4.  **Cost Drivers (Horizontal Bar)**:
    *   Lists the specific items costing you the most money.
    *   *Action:* These are the items you should negotiate prices on or find cheaper alternatives for.

---

## 🛠 5. SDLC & Maintenance (Code Changes)

This project is configured with **GitHub Actions** to automatically deploy changes to the live website (GitHub Pages).

### How to Update the App

1.  **Make Changes Locally**:
    Edit the files in VS Code. For example, to change the chart colors, edit `constants.ts`.
    
    Test your changes:
    ```bash
    npm run dev
    ```

2.  **Commit and Push**:
    Once satisfied, push your changes to the `main` branch.
    ```bash
    git add .
    git commit -m "Updated chart colors"
    git push origin main
    ```

3.  **Automated Deployment**:
    *   Pushing to `main` triggers the workflow file `.github/workflows/deploy.yml`.
    *   GitHub will build the React app (`npm run build`).
    *   It will deploy the contents of the `dist` folder to the `gh-pages` branch.

4.  **Verify**:
    *   Go to your GitHub Repository > **Actions** tab to see the build progress.
    *   Once green, visit `https://yourusername.github.io/chefsight/` to see the live update.

### Updating Data on the Live Site
Since the data (`expenses.csv`) is part of the repository:
1.  Run the Python script locally.
2.  The script updates `public/data/expenses.csv`.
3.  Commit and push the updated CSV file to GitHub.
4.  The site will rebuild and the new data will be live in ~2 minutes.

---

## ❓ 6. Troubleshooting

*   **"Live CSV not found"**: Ensure you have run `python process_receipts.py` at least once. The Python script creates the CSV file.
*   **Receipts not processing**: Check the `backend/processing_errors.log` file for details. Ensure images are valid JPG/PNG files.
*   **Dashboard not updating**: Refresh the web page. If running locally, you might need to restart `npm start` if the build caching is aggressive.
*   **GitHub Pages 404**: Ensure your repository Settings > Pages is set to deploy from the `gh-pages` branch.
