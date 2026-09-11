import uvicorn
import sys
import os

# Ensure the root directory is on the python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

if __name__ == "__main__":
    port = int(os.getenv("PYTHON_PORT", "8000"))
    host = os.getenv("PYTHON_HOST", "0.0.0.0")
    print(f"Starting VeritasSupply Python Intelligence Engine on http://{host}:{port}")
    uvicorn.run(
        "backend.python.app.main:app",
        host=host,
        port=port,
        reload=True
    )
