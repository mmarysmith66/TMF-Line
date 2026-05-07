"""
Iteration 2 tests: AI assistant (Claude Sonnet 4.5) + PWA / static assets.

Covers:
  - POST /api/assistant/chat new session returns reply
  - POST /api/assistant/chat multi-turn memory (revenue mentioned in turn 1 referenced in turn 2)
  - GET  /api/assistant/history/{session_id}
  - POST /api/assistant/chat empty message rejection (422)
  - Static assets: /manifest.json, /service-worker.js, /favicon.ico, /og-image.jpg,
    /icon-192.png, /icon-512.png, /offline.html
"""
import os
import time
import uuid
import json
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    env_path = "/app/frontend/.env"
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip()
                    break
BASE_URL = (BASE_URL or "").rstrip("/")
assert BASE_URL, "REACT_APP_BACKEND_URL must be set"


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Assistant ----------
class TestAssistantChat:
    def test_new_session_returns_reply(self, api):
        sid = f"TEST_sess_{uuid.uuid4().hex[:8]}"
        r = api.post(f"{BASE_URL}/api/assistant/chat",
                     json={"session_id": sid, "message": "Hi, what products do you offer?"},
                     timeout=60)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("session_id") == sid
        assert isinstance(body.get("reply"), str)
        assert len(body["reply"].strip()) > 0

    def test_empty_message_rejected(self, api):
        sid = f"TEST_sess_{uuid.uuid4().hex[:8]}"
        r = api.post(f"{BASE_URL}/api/assistant/chat",
                     json={"session_id": sid, "message": "   "},
                     timeout=30)
        assert r.status_code == 422

    def test_multi_turn_memory(self, api):
        sid = f"TEST_sess_{uuid.uuid4().hex[:8]}"
        # Turn 1: declare a specific revenue
        r1 = api.post(f"{BASE_URL}/api/assistant/chat", json={
            "session_id": sid,
            "message": "My retail store does $87,500 in monthly revenue. Remember that number.",
        }, timeout=60)
        assert r1.status_code == 200, r1.text
        time.sleep(0.5)

        # Turn 2: ask without re-stating
        r2 = api.post(f"{BASE_URL}/api/assistant/chat", json={
            "session_id": sid,
            "message": "Based on what I just told you, roughly what monthly revenue did I mention?",
        }, timeout=60)
        assert r2.status_code == 200, r2.text
        reply = r2.json()["reply"].lower()
        # Acceptance: assistant should reference $87,500 / 87500 / 87.5K / 87,500
        memory_signals = ["87,500", "87500", "87.5", "87,500.00", "$87"]
        assert any(s.lower() in reply for s in memory_signals), \
            f"Assistant did not recall revenue. Reply: {r2.json()['reply']}"

    def test_history_persisted(self, api):
        sid = f"TEST_sess_{uuid.uuid4().hex[:8]}"
        r = api.post(f"{BASE_URL}/api/assistant/chat",
                     json={"session_id": sid, "message": "What is MCA?"},
                     timeout=60)
        assert r.status_code == 200
        h = api.get(f"{BASE_URL}/api/assistant/history/{sid}")
        assert h.status_code == 200
        msgs = h.json().get("messages", [])
        assert len(msgs) >= 2
        # role/content/ts shape
        roles = {m["role"] for m in msgs}
        assert "user" in roles and "assistant" in roles
        for m in msgs:
            assert "role" in m and "content" in m and "ts" in m
            assert isinstance(m["content"], str) and len(m["content"]) > 0

    def test_history_empty_for_unknown_session(self, api):
        sid = f"TEST_unknown_{uuid.uuid4().hex[:8]}"
        r = api.get(f"{BASE_URL}/api/assistant/history/{sid}")
        assert r.status_code == 200
        assert r.json() == {"messages": []}


# ---------- Static / PWA assets ----------
PWA_ASSETS = [
    ("/manifest.json", "application/json"),
    ("/service-worker.js", None),     # served as JS or octet-stream depending on host
    ("/favicon.ico", None),
    ("/og-image.jpg", "image"),
    ("/icon-192.png", "image"),
    ("/icon-512.png", "image"),
    ("/offline.html", "text/html"),
]


@pytest.mark.parametrize("path,ctype", PWA_ASSETS)
def test_pwa_asset_serves_200(path, ctype):
    r = requests.get(f"{BASE_URL}{path}", timeout=20)
    assert r.status_code == 200, f"{path} -> {r.status_code}"
    if ctype:
        assert ctype in r.headers.get("content-type", ""), \
            f"{path} content-type was {r.headers.get('content-type')}"


def test_manifest_is_valid_pwa():
    r = requests.get(f"{BASE_URL}/manifest.json", timeout=20)
    assert r.status_code == 200
    m = r.json()
    for k in ("name", "short_name", "start_url", "display", "theme_color", "icons"):
        assert k in m, f"manifest missing {k}"
    assert m["display"] == "standalone"
    sizes = {i.get("sizes") for i in m["icons"]}
    assert "192x192" in sizes and "512x512" in sizes, f"icons sizes={sizes}"


def test_index_html_meta_and_no_emergent_badge_text():
    r = requests.get(f"{BASE_URL}/", timeout=20)
    assert r.status_code == 200
    html = r.text
    # Title contains TMF Line and not the default Emergent template
    assert "TMF Line" in html
    assert "Emergent | Fullstack App" not in html
    # OG meta present
    assert 'property="og:title"' in html
    assert 'property="og:image"' in html
    assert 'property="og:description"' in html
    # Manifest + favicon links present
    assert 'rel="manifest"' in html
    assert "favicon.ico" in html
    # No literal "Made with Emergent" copy in static markup
    assert "Made with Emergent" not in html
