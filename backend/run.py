#!/usr/bin/env python3
"""
Simple script to run the Flask backend server
"""
import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    print("Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Requirements installed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing requirements: {e}")
        sys.exit(1)

def run_server():
    """Run the Flask server"""
    print("Starting Flask server...")
    try:
        subprocess.run([sys.executable, "app.py"])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error running server: {e}")

if __name__ == "__main__":
    # Check if we're in the backend directory
    if not os.path.exists("app.py"):
        print("❌ Please run this script from the backend directory")
        sys.exit(1)
    
    # Install requirements if needed
    if not os.path.exists("venv") and "--skip-install" not in sys.argv:
        install_requirements()
    
    # Run the server
    run_server()