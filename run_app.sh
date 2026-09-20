#!/bin/bash
echo "======================================================================"
echo "Launching DIY Co. OTIF Diagnostic Platform (External Portability Mode)"
echo "======================================================================"

export PORT=${PORT:-8000}
export HOST=${HOST:-0.0.0.0}

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "[1/3] Checking Python Dependencies..."
pip install -r requirements.txt

echo "[2/3] Checking Frontend Build..."
if [ ! -d "frontend/dist" ]; then
    echo "Building React Frontend Distribution..."
    cd frontend
    npm install && npm run build
    cd ..
fi

echo "[3/3] Starting Production Server on 0.0.0.0:$PORT..."
echo "Application URL: http://0.0.0.0:$PORT or http://localhost:$PORT or http://<YOUR_LAN_IP>:$PORT"
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
