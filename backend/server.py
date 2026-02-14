from flask import Flask, jsonify, request
from process_receipts import setup_directories, process_images, get_failed_receipts, set_openai_key

app = Flask(__name__)

@app.get("/api/health")
def health():
    return jsonify({"ok": True})

@app.get("/api/failures")
def failures():
    setup_directories()
    return jsonify({"failures": get_failed_receipts()})

@app.post("/api/process")
def process():
    setup_directories()
    payload = request.get_json(silent=True) or {}
    retry_failed = bool(payload.get("retry_failed", False))
    files = payload.get("files")
    try:
        result = process_images(retry_failed=retry_failed, specific_files=files, allow_prompt=False)
        return jsonify(result)
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        return jsonify({"error": "Processing failed"}), 500

@app.post("/api/config/openai-key")
def set_key():
    payload = request.get_json(silent=True) or {}
    api_key = (payload.get("api_key") or "").strip()
    if not api_key:
        return jsonify({"error": "api_key is required"}), 400
    try:
        set_openai_key(api_key)
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    return jsonify({"ok": True})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
