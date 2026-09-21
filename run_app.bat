@echo off
echo ======================================================================
echo Launching DIY Co. OTIF Diagnostic Platform (External Portability Mode)
echo ======================================================================

set PORT=8000
set HOST=0.0.0.0

cd /d "%~dp0"

echo [1/3] Checking Python Dependencies...
pip install -r requirements.txt

echo [2/3] Checking Frontend Build...
if not exist "frontend\dist" (
    echo Building React Frontend Distribution...
    cd frontend
    call npm install
    call npm run build
    cd ..
)

echo [3/3] Starting Production Server on 0.0.0.0:8000...
echo Application URL: http://0.0.0.0:8000 or http://localhost:8000 or http://^<YOUR_LAN_IP^>:8000
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
pause
