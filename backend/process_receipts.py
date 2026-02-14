import os
import glob
import shutil
import base64
import json
import csv
from datetime import datetime
from getpass import getpass
from typing import Optional, List, Dict, Any
import pandas as pd
from openai import OpenAI

# Initialize Client
_openai_client = None
_base_dir = os.path.dirname(__file__)
_env_file_path = os.path.join(_base_dir, ".env")
_error_log_jsonl = os.path.join(_base_dir, "processing_errors.jsonl")

def _read_dotenv_value(key, path):
    if not os.path.exists(path):
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                stripped = line.strip()
                if not stripped or stripped.startswith("#") or "=" not in stripped:
                    continue
                k, v = stripped.split("=", 1)
                if k.strip() != key:
                    continue
                value = v.strip().strip('"').strip("'")
                return value if value else None
    except OSError:
        return None
    return None

def _write_dotenv_value(key, value, path):
    lines = []
    found = False
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                lines = f.readlines()
        except OSError:
            lines = []
    new_lines = []
    for line in lines:
        if line.strip().startswith(f"{key}="):
            new_lines.append(f"{key}={value}\n")
            found = True
        else:
            new_lines.append(line)
    if not found:
        new_lines.append(f"{key}={value}\n")
    with open(path, "w", encoding="utf-8") as f:
        f.writelines(new_lines)

def set_openai_key(api_key):
    api_key = (api_key or "").strip()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set")
    os.environ["OPENAI_API_KEY"] = api_key
    _write_dotenv_value("OPENAI_API_KEY", api_key, _env_file_path)
    global _openai_client
    _openai_client = OpenAI(api_key=api_key)
    return _openai_client

def get_openai_client(allow_prompt: bool = True):
    global _openai_client
    if _openai_client is not None:
        return _openai_client

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        api_key = _read_dotenv_value("OPENAI_API_KEY", _env_file_path)
        if api_key:
            os.environ["OPENAI_API_KEY"] = api_key
    if not api_key:
        if not allow_prompt:
            raise RuntimeError("OPENAI_API_KEY is not set")
        try:
            api_key = getpass("Enter OPENAI_API_KEY: ").strip()
        except (EOFError, KeyboardInterrupt):
            raise RuntimeError("OPENAI_API_KEY is not set and prompt was cancelled")
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY is not set")
        set_openai_key(api_key)

    if _openai_client is not None:
        return _openai_client
    _openai_client = OpenAI(api_key=api_key)
    return _openai_client

# Configuration
INPUT_FOLDER = os.path.join(_base_dir, "receipts_input")
PROCESSED_FOLDER = os.path.join(_base_dir, "receipts_processed")
DATA_FILE = os.path.abspath(os.path.join(_base_dir, "..", "public", "data", "expenses.csv"))
ERROR_LOG = os.path.join(_base_dir, "processing_errors.log")
FAILED_FOLDER = os.path.join(_base_dir, "receipts_failed")

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
    if not os.path.exists(FAILED_FOLDER):
        os.makedirs(FAILED_FOLDER)
    
    # Ensure CSV exists with headers
    if not os.path.exists(DATA_FILE):
        os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
        with open(DATA_FILE, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['date', 'store', 'item', 'total_cost', 'units', 'unit_type', 'calculated_cost_per_unit', 'category'])

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def _parse_json_content(content):
    cleaned = content.replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        candidates = []
        if "{" in cleaned and "}" in cleaned:
            candidates.append(cleaned[cleaned.find("{"):cleaned.rfind("}") + 1])
        if "[" in cleaned and "]" in cleaned:
            candidates.append(cleaned[cleaned.find("["):cleaned.rfind("]") + 1])
        for candidate in candidates:
            try:
                return json.loads(candidate)
            except json.JSONDecodeError:
                continue
        raise

def _normalize_extraction(extracted_data):
    if isinstance(extracted_data, list):
        if not extracted_data:
            raise ValueError("AI returned an empty list")
        return extracted_data
    if isinstance(extracted_data, dict):
        return [extracted_data]
    raise ValueError("AI response was not a JSON object or list")

def real_ai_extraction(base64_image, allow_prompt: bool = True):
    client = get_openai_client(allow_prompt=allow_prompt)
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": SYSTEM_PROMPT},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    },
                ],
            }
        ],
        max_tokens=1000,
    )
    # Extract JSON string from response and parse it
    content = response.choices[0].message.content
    return _parse_json_content(content or "")

def _list_receipt_files(folder):
    extensions = ['*.jpg', '*.jpeg', '*.png', '*.heic']
    files = []
    for ext in extensions:
        files.extend(glob.glob(os.path.join(folder, ext)))
    return sorted(files)

def _write_error_log(filename, error):
    timestamp = datetime.now().isoformat()
    with open(ERROR_LOG, "a") as err_log:
        err_log.write(f"{timestamp}: Error processing {filename} - {str(error)}\n")
    with open(_error_log_jsonl, "a") as json_log:
        json_log.write(json.dumps({
            "timestamp": timestamp,
            "filename": filename,
            "error": str(error)
        }) + "\n")

def get_failed_receipts():
    failures = {}
    failed_files = {os.path.basename(p): p for p in _list_receipt_files(FAILED_FOLDER)}
    if os.path.exists(_error_log_jsonl):
        with open(_error_log_jsonl, "r", encoding="utf-8") as f:
            for line in f:
                try:
                    entry = json.loads(line)
                except json.JSONDecodeError:
                    continue
                filename = entry.get("filename")
                if not filename:
                    continue
                if filename not in failed_files:
                    continue
                failures[filename] = {
                    "filename": filename,
                    "error": entry.get("error", "Unknown error"),
                    "timestamp": entry.get("timestamp")
                }
    for filename in failed_files.keys():
        if filename not in failures:
            failures[filename] = {
                "filename": filename,
                "error": "Unknown error",
                "timestamp": None
            }
    return list(failures.values())

def _safe_move(src_path, dest_folder):
    os.makedirs(dest_folder, exist_ok=True)
    dest_path = os.path.join(dest_folder, os.path.basename(src_path))
    if os.path.abspath(src_path) == os.path.abspath(dest_path):
        return dest_path
    if os.path.exists(dest_path):
        base, ext = os.path.splitext(os.path.basename(src_path))
        dest_path = os.path.join(dest_folder, f"{base}_{int(datetime.now().timestamp())}{ext}")
    shutil.move(src_path, dest_path)
    return dest_path

def _resolve_specific_files(files: Optional[List[str]]):
    resolved = []
    if not files:
        return resolved
    for name in files:
        safe_name = os.path.basename(name)
        for folder in [INPUT_FOLDER, FAILED_FOLDER]:
            candidate = os.path.join(folder, safe_name)
            if os.path.exists(candidate):
                resolved.append(candidate)
                break
    return resolved

def process_images(retry_failed: bool = False, specific_files: Optional[List[str]] = None, allow_prompt: bool = True):
    # Find all images
    if specific_files:
        files = _resolve_specific_files(specific_files)
    else:
        files = _list_receipt_files(INPUT_FOLDER)
        if retry_failed:
            files.extend(_list_receipt_files(FAILED_FOLDER))
    
    print(f"Found {len(files)} receipts to process.")

    new_rows = []
    errors: List[Dict[str, Any]] = []
    processed_count = 0

    for file_path in files:
        filename = os.path.basename(file_path)
        print(f"Processing: {filename}")
        
        try:
            # 1. Encode Image
            base64_img = encode_image(file_path)
            
            # 2. Send to AI
            extracted_data = real_ai_extraction(base64_img, allow_prompt=allow_prompt)
            
            # 3. Append to list
            normalized = _normalize_extraction(extracted_data)
            new_rows.extend(normalized)
            
            # 4. Move file to processed
            _safe_move(file_path, PROCESSED_FOLDER)
            processed_count += 1
            print("  > Success. Moved to processed.")

        except Exception as e:
            print(f"  > Error processing {filename}: {e}")
            _write_error_log(filename, e)
            errors.append({"filename": filename, "error": str(e)})
            _safe_move(file_path, FAILED_FOLDER)

    # 5. Update CSV using Pandas
    if new_rows:
        print(f"Writing {len(new_rows)} new lines to CSV...")
        df_new = pd.DataFrame(new_rows)
        
        # Append mode, no header if file exists
        df_new.to_csv(DATA_FILE, mode='a', header=False, index=False)
        print("Done.")
    else:
        print("No new data to write.")

    return {
        "processed": processed_count,
        "failed": len(errors),
        "written_rows": len(new_rows),
        "errors": errors
    }

if __name__ == "__main__":
    setup_directories()
    process_images()
