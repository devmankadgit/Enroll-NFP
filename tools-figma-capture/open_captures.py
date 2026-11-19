# Captures pages into Figma using headless Chrome.
import os, shutil, subprocess, sys, tempfile, time, urllib.parse

def find_chrome():
    candidates = [
        os.environ.get("CHROME_PATH", ""),
        os.path.expandvars(r"%ProgramFiles%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"),
        os.path.expandvars(r"%LocalAppData%\Google\Chrome\Application\chrome.exe"),
    ]
    for name in ("google-chrome", "chrome"):
        found = shutil.which(name)
        if found: candidates.append(found)
    for c in candidates:
        if c and os.path.isfile(c): return c
    sys.exit("Google Chrome not found.")

if len(sys.argv) < 2:
    sys.exit('Usage: open_captures.py "<page?run=js>|<captureId>" ...')

CHROME = find_chrome()
PORT = os.environ.get("CAPTURE_PORT", "8090")
DELAY = os.environ.get("CAPTURE_DELAY_MS", "3000")
WAIT = int(os.environ.get("CAPTURE_WAIT_S", "30"))
PROMPT_ID = os.environ.get("CAPTURE_PROMPT_ID", "").strip()
BASE = f"http://localhost:{PORT}/"
procs = []
for arg in sys.argv[1:]:
    page, cid = arg.rsplit("|", 1)
    submit = f"https://mcp.figma.com/mcp/capture/{cid}/submit?bindVariables=true"
    if PROMPT_ID:
        submit += f"&promptId={PROMPT_ID}"
    ep = urllib.parse.quote(submit, safe="")
    url = f"{BASE}{page}#figmacapture={cid}&figmaendpoint={ep}&figmadelay={DELAY}"
    procs.append(subprocess.Popen([CHROME, "--headless=new", "--disable-gpu", "--window-size=1440,900",
        f"--user-data-dir={tempfile.mkdtemp(prefix='figcap-')}", url],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL))
    print("started", page)
    time.sleep(1)
time.sleep(WAIT)
for p in procs: p.terminate()
print("done")
