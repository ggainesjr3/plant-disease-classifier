import subprocess
import time
import sys
import os

def start_app():
    # 1. Start the Backend (Flask)
    print("Starting Backend...")
    backend_process = subprocess.Popen(
        [sys.executable, "backend/app.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )

    # Give the backend a second to breathe
    time.sleep(2)

    # 2. Start the Frontend (React)
    print("Starting Frontend...")
    # 'shell=True' is needed for npm commands on most systems
    frontend_process = subprocess.Popen(
        "npm start",
        cwd="frontend",
        shell=True
    )

    print("\n--- Both systems are launching! ---")
    print("Backend: http://127.0.0.1:5000")
    print("Frontend: http://localhost:3000")
    print("Press Ctrl+C to stop both.")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down...")
        backend_process.terminate()
        frontend_process.terminate()

if __name__ == "__main__":
    start_app()