@echo off
REM Double-click to start the NFP preview server on http://localhost:8090 (close the window to stop).
cd /d "%~dp0"
echo NFP preview running at http://localhost:8090/auth/login.html  (close this window to stop)
python serve.py "..\05-NFP-Prototype" 8090
pause
