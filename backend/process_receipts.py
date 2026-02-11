import os
import glob
import shutil
import base64
import json
import csv
from datetime import datetime
import pandas as pd
# In a real scenario, you would import the OpenAI client
# from openai import OpenAI

# Configuration
INPUT_FOLDER = "receipts_input"
PROCESSED_FOLDER = "receipts_processed"
DATA_FILE = "../public/data/expenses.csv" # Path relative to where script is run, usually in 'backend'
ERROR_LOG = "processing_errors.log"

# Define the Prompt for the AI
SYSTEM_PROMPT = """
You are a highly accurate data extraction assistant for a professional chef. 
Extract the following fields from the receipt image provided. 
Return ONLY valid JSON. No markdown formatting.

Fields to extract:
- date: (YYYY-MM-DD)
- store: (Normalized Name, e.g., 'Costco')
- item: (Product name)
- total_cost: (Float)
- units: (Float, e.g., 2.5)
- unit_type: (String, e.g., 'lbs', 'ea', 'oz')
- calculated_cost_per_unit: (Float = total_cost / units)
- category: One of [Proteins, Produce, Dairy, Dry Goods, Spices/Oils, Packaging/Disposables, Equipment, Alcohol, Beverages, Overhead]

If there are multiple line items, return a list of objects.
"""

def setup_directories():
    if not os.path.exists(INPUT_FOLDER):
        os.makedirs(INPUT_FOLDER)
    if not os.path.exists(PROCESSED_FOLDER):
        os.makedirs(PROCESSED_FOLDER)
    
    # Ensure CSV exists with headers
    if not os.path.exists(DATA_FILE):
        os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
        with open(DATA_FILE, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['date', 'store', 'item', 'total_cost', 'units', 'unit_type', 'calculated_cost_per_unit', 'category'])

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def mock_ai_extraction(base64_image):
    """
    MOCK FUNCTION: Simulating an OpenAI GPT-4o API call.
    In production, replace this with actual API client code.
    """
    print("  > Simulating AI extraction...")
    
    # Simulating a delay
    import time
    time.sleep(1)
    
    # Simulating a response based on the "file" (randomly)
    # In reality, you would send the base64_image to the API
    
    mock_response = [
        {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "store": "Costco",
            "item": "Ribeye Steaks",
            "total_cost": 45.00,
            "units": 3.0,
            "unit_type": "lbs",
            "calculated_cost_per_unit": 15.00,
            "category": "Proteins"
        },
        {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "store": "Costco",
            "item": "Olive Oil",
            "total_cost": 22.00,
            "units": 2.0,
            "unit_type": "liters",
            "calculated_cost_per_unit": 11.00,
            "category": "Spices/Oils"
        }
    ]
    
    return mock_response

def process_images():
    # Find all images
    extensions = ['*.jpg', '*.jpeg', '*.png', '*.heic']
    files = []
    for ext in extensions:
        files.extend(glob.glob(os.path.join(INPUT_FOLDER, ext)))
    
    print(f"Found {len(files)} receipts to process.")

    new_rows = []

    for file_path in files:
        filename = os.path.basename(file_path)
        print(f"Processing: {filename}")
        
        try:
            # 1. Encode Image
            base64_img = encode_image(file_path)
            
            # 2. Send to AI (Mocked)
            extracted_data = mock_ai_extraction(base64_img)
            
            # 3. Append to list
            if isinstance(extracted_data, list):
                new_rows.extend(extracted_data)
            else:
                new_rows.append(extracted_data)
            
            # 4. Move file to processed
            shutil.move(file_path, os.path.join(PROCESSED_FOLDER, filename))
            print("  > Success. Moved to processed.")

        except Exception as e:
            print(f"  > Error processing {filename}: {e}")
            with open(ERROR_LOG, "a") as err_log:
                err_log.write(f"{datetime.now()}: Error processing {filename} - {str(e)}\n")

    # 5. Update CSV using Pandas
    if new_rows:
        print(f"Writing {len(new_rows)} new lines to CSV...")
        df_new = pd.DataFrame(new_rows)
        
        # Append mode, no header if file exists
        df_new.to_csv(DATA_FILE, mode='a', header=False, index=False)
        print("Done.")
    else:
        print("No new data to write.")

if __name__ == "__main__":
    setup_directories()
    process_images()
