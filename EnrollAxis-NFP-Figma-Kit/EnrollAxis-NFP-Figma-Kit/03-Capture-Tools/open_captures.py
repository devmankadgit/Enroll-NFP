# Captures NFP pages into Figma using headless Chrome (background tabs in a normal
# browser pause, so captures never fire there). One Chrome per page, run in parallel.
# Needs serve.py running on port 8090.
# Usage: python3 open_captures.py "<path?run=js>|<captureId>" ...
import os, shutil, subprocess, sys, tempfile, time, urllib.parse

def find_chrome():
    candidates = [
        os.environ.get("CHROME_PATH", ""),
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        os.path.expandvars(r"%ProgramFiles%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%LocalAppData%\Google\Chrome\Application\chrome.exe"),
    ]
    for name in ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "chrome"):
        found = shutil.which(name)
        if found:
            candidates.append(found)
    for c in candidates:
        if c and os.path.isfile(c):
            return c
    sys.exit("Google Chrome not found. Install it or set CHROME_PATH to chrome's full path.")

CHROME = find_chrome()
BASE = "http://localhost:8090/"
procs = []
for arg in sys.argv[1:]:
    page, cid = arg.rsplit("|", 1)
    ep = urllib.parse.quote(f"https://mcp.figma.com/mcp/capture/{cid}/submit?bindVariables=true", safe="")
    url = f"{BASE}{page}#figmacapture={cid}&figmaendpoint={ep}&figmadelay=3000"
    procs.append(subprocess.Popen([CHROME, "--headless=new", "--disable-gpu", "--window-size=1440,900",
        f"--user-data-dir={tempfile.mkdtemp(prefix='figcap-')}", url],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL))
    print("started", page)
    time.sleep(1)
time.sleep(30)
for p in procs:
    p.terminate()
print("done")
