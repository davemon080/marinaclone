import urllib.request
import json

base_url = "http://localhost:3000"

def make_req(path, method="GET", body=None):
    url = base_url + path
    data = None
    headers = {}
    if body is not None:
        if isinstance(body, dict):
            data = json.dumps(body).encode("utf-8")
            headers["Content-Type"] = "application/json"
        elif isinstance(body, str):
            data = body.encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            ct = resp.getheader("Content-Type") or ""
            return resp.status, resp.read().decode("utf-8", errors="ignore"), ct
    except urllib.error.HTTPError as e:
        ct = e.headers.get("Content-Type") or ""
        return e.code, e.read().decode("utf-8", errors="ignore"), ct

def run_tests():
    pages = [
        ("/", "Home / Landing"),
        ("/verify-id-certificate", "Verify ID / Certificate Page"),
        ("/verify-qr-code", "Verify QR Code Page"),
        ("/verify-recaptcha", "Verify reCAPTCHA Page"),
        ("/signin", "Sign In Page"),
        ("/register-type", "Register Type Page"),
        ("/examination-schedules", "Examination Schedules Page"),
        ("/done", "Done Page"),
    ]

    print("=== 1. HTML Page Routes ===")
    all_pages_pass = True
    for path, desc in pages:
        status, body, ct = make_req(path)
        passed = (status == 200 and "text/html" in ct)
        if not passed:
            all_pages_pass = False
        print(f"[{'PASS' if passed else 'FAIL'}] {desc} ({path}) -> {status} (Content-Type: {ct})")

    print("\n=== 2. API Endpoints & Verification Logic ===")
    # Health check
    s, b, ct = make_req("/api/health")
    p1 = (s == 200 and "ok" in b)
    print(f"[{'PASS' if p1 else 'FAIL'}] Health check (/api/health) -> {s} (Body: {b.strip()})")

    # Missing serial number / parameter validation
    s, b, ct = make_req("/api/verify-certificate", "POST", {})
    p2 = (s == 400 and "required" in b.lower())
    print(f"[{'PASS' if p2 else 'FAIL'}] Missing serial number validation on /api/verify-certificate (HTTP 400) -> {s}")

    # Certificate not found (MISMO ISSUED)
    s, b, ct = make_req("/api/verify-certificate", "POST", {"serial_number": "NON_EXISTENT_999", "type": "certificate"})
    p3 = (s == 404 and "Document not found" in b)
    print(f"[{'PASS' if p3 else 'FAIL'}] Certificate Not Found on /api/verify-certificate (HTTP 404: Document not found) -> {s}")

    # ID Card not found (MARINA ID)
    s, b, ct = make_req("/api/verify-certificate", "POST", {"srn": "NON_EXISTENT_999", "type": "id"})
    p4 = (s == 404 and "Invalid SRN" in b)
    print(f"[{'PASS' if p4 else 'FAIL'}] ID Card Not Found on /api/verify-certificate (HTTP 404: Invalid SRN) -> {s}")

    # SIRB not found (SIRB)
    s, b, ct = make_req("/api/verify-certificate", "POST", {"sirb_number": "NON_EXISTENT_999", "type": "sirb"})
    p5 = (s == 404 and "SIRB not found" in b)
    print(f"[{'PASS' if p5 else 'FAIL'}] SIRB Not Found on /api/verify-certificate (HTTP 404: SIRB not found) -> {s}")

    # reCAPTCHA API verification
    s, b, ct = make_req("/api/verify-recaptcha", "POST", {"token": "valid-token"})
    p6 = (s == 200 and "true" in b)
    print(f"[{'PASS' if p6 else 'FAIL'}] reCAPTCHA POST validation -> {s} (Body: {b.strip()})")

    print("\n=== 3. Static Bundle Scripts & Shims ===")
    static_files = [
        "/static/js/12.40516b25.chunk.js",
        "/static/js/15.ad2ec10e.chunk.js",
        "/static/js/4.a3ac6bca.chunk.js",
    ]
    all_static_pass = True
    for sf in static_files:
        status, body, ct = make_req(sf)
        passed = (status == 200 and ("javascript" in ct or len(body) > 1000))
        if not passed:
            all_static_pass = False
        print(f"[{'PASS' if passed else 'FAIL'}] Static bundle {sf} -> {status} (Bytes: {len(body)})")

    overall = all_pages_pass and p1 and p2 and p3 and p4 and p5 and p6 and all_static_pass
    print(f"\nOVERALL RESULT: {'ALL SYSTEMS OPERATIONAL (PASS)' if overall else 'SOME CHECKS FAILED'}")

if __name__ == "__main__":
    run_tests()
