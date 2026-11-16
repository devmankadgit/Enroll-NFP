#!/bin/bash
# Double-click to start the NFP preview server on http://localhost:8090 (close the window to stop).
cd "$(dirname "$0")"
echo "NFP preview running at http://localhost:8090/auth/login.html  (close this window to stop)"
python3 serve.py "../05-NFP-Prototype" 8090
