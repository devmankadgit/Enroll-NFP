# Serves the NFP prototype and injects Figma's capture script into every HTML page.
# Source files are never modified. Usage: python3 serve.py <nfp_dir> [port]
import http.server, os, sys
from functools import partial

TAG = b'<script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>'
# Optional ?run=<js> in the URL: runs that JS after load, so a wizard step or hidden
# state can be shown before Figma captures it (e.g. ?run=obGoTo(3)).
RUN = b'''<script>window.addEventListener("load",function(){var r=new URLSearchParams(location.search).get("run");
if(r)setTimeout(function(){try{(0,eval)(r);window.scrollTo(0,0)}catch(e){console.error("run failed",e)}},300)})</script>'''

class Handler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            path = os.path.join(path, "index.html")
        if not path.endswith(".html") or not os.path.isfile(path):
            return super().send_head()
        with open(path, "rb") as f:
            body = f.read()
        body = body.replace(b"</head>", TAG + RUN + b"</head>", 1) if b"</head>" in body else TAG + RUN + body
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        import io
        return io.BytesIO(body)

root = os.path.abspath(sys.argv[1])
port = int(sys.argv[2]) if len(sys.argv) > 2 else 8090
http.server.ThreadingHTTPServer(("127.0.0.1", port), partial(Handler, directory=root)).serve_forever()
