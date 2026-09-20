import os
import sys
import time
import urllib.request
import webbrowser
import uvicorn

def is_server_running(url="http://127.0.0.1:8000/api/health"):
    try:
        req = urllib.request.urlopen(url, timeout=1)
        return req.status == 200
    except Exception:
        return False

def main():
    print("=" * 70)
    print(" DIY Home Improvement Co. - OTIF Diagnostic Platform v1.1")
    print("=" * 70)
    
    target_url = "http://localhost:8000"
    
    if is_server_running():
        print(f"\n[+] Server is already active on {target_url}!")
        print(f"[+] Opening browser now...")
        webbrowser.open(target_url)
        return

    print(f"\n[+] Starting background server on {target_url} ...")
    
    def open_browser():
        time.sleep(1.2)
        webbrowser.open(target_url)

    import threading
    threading.Thread(target=open_browser, daemon=True).start()

    backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
    sys.path.insert(0, backend_dir)

    from app.main import app
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")

if __name__ == "__main__":
    main()
