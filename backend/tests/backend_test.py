"""
Backend API tests for TMF Line.

Covers:
  - Root health
  - /api/calc/funding-estimate (funding calculator logic)
  - /api/calc/heloc (HELOC calculator logic)
  - /api/leads/funding-calculator (lead persistence)
  - /api/leads/contact (lead persistence + email validation)
  - /api/leads (listing - no _id leak)
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL")
if not BASE_URL:
    # Fallback: read from frontend .env (CI agent context)
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


# ---------- health ----------
def test_root_ok(api):
    r = api.get(f"{BASE_URL}/api/")
    assert r.status_code == 200
    body = r.json()
    assert "message" in body
    assert "TMF" in body["message"]


# ---------- funding estimator ----------
class TestFundingEstimate:
    def test_basic_estimate_rounded_to_250(self, api):
        payload = {
            "monthly_revenue": 50000,
            "industry": "Retail",
            "time_in_business": "2 – 5 years",
            "credit_score": "700 – 749",
            "existing_positions": "None",
        }
        r = api.post(f"{BASE_URL}/api/calc/funding-estimate", json=payload)
        assert r.status_code == 200
        est = r.json()["estimate"]
        # Compute expected average per server logic:
        # 50000 * 1.1 (2-5y) * 1.15 (700-749) * 1.15 (None) * 1.05 (Retail)
        expected_avg_raw = 50000 * 1.1 * 1.15 * 1.15 * 1.05
        expected_avg = round(expected_avg_raw / 250) * 250
        assert est["average"] == expected_avg
        # rounding to 250
        assert est["conservative"] % 250 == 0
        assert est["average"] % 250 == 0
        assert est["aggressive"] % 250 == 0
        # ordering
        assert est["conservative"] <= est["average"] <= est["aggressive"]

    def test_zero_revenue_returns_zero(self, api):
        r = api.post(f"{BASE_URL}/api/calc/funding-estimate", json={"monthly_revenue": 0})
        assert r.status_code == 200
        est = r.json()["estimate"]
        assert est == {"conservative": 0, "average": 0, "aggressive": 0}

    def test_aggressive_higher_than_conservative(self, api):
        r = api.post(f"{BASE_URL}/api/calc/funding-estimate", json={
            "monthly_revenue": 100000,
            "industry": "Healthcare",
            "time_in_business": "5+ years",
            "credit_score": "750+",
            "existing_positions": "None",
        })
        est = r.json()["estimate"]
        assert est["aggressive"] > est["average"] > est["conservative"] > 0


# ---------- HELOC ----------
class TestHelocCalc:
    def test_qualified_case(self, api):
        payload = {
            "home_value": 600000,
            "mortgage_balance": 200000,
            "ltv": 80,
            "credit_score": "excellent",
            "monthly_income": 12000,
            "monthly_debt": 2000,
        }
        r = api.post(f"{BASE_URL}/api/calc/heloc", json=payload)
        assert r.status_code == 200
        result = r.json()["result"]
        # 600000 * 0.8 = 480000 max debt; available = 280000 * 1.0
        assert result["max_loan"] == 480000
        assert result["equity"] == 400000
        assert result["available_credit"] == 280000
        # dti = 2000/12000*100 = 16.7
        assert abs(result["dti"] - 16.7) < 0.2
        assert result["qualified"] is True

    def test_zero_home_value(self, api):
        r = api.post(f"{BASE_URL}/api/calc/heloc", json={"home_value": 0})
        assert r.status_code == 200
        result = r.json()["result"]
        assert result["max_loan"] == 0
        assert result["available_credit"] == 0
        assert result["qualified"] is False

    def test_underwater_mortgage_no_equity(self, api):
        # mortgage > home_value -> equity 0, available_credit 0, not qualified
        r = api.post(f"{BASE_URL}/api/calc/heloc", json={
            "home_value": 300000, "mortgage_balance": 350000, "ltv": 80,
            "credit_score": "good", "monthly_income": 5000, "monthly_debt": 1000,
        })
        result = r.json()["result"]
        assert result["equity"] == 0
        assert result["available_credit"] == 0
        assert result["qualified"] is False


# ---------- leads ----------
class TestLeads:
    def test_funding_lead_persists(self, api):
        payload = {
            "first_name": "TEST_John",
            "last_name": "Doe",
            "business_name": "TEST_Acme Inc",
            "monthly_revenue": 75000,
            "industry": "Technology",
            "time_in_business": "1 – 2 years",
            "credit_score": "650 – 699",
            "existing_positions": "1 position",
            "email": "test_john@example.com",
            "phone": "5551234567",
            "desired_amount": 150000,
            "notes": "TEST_funding lead",
        }
        r = api.post(f"{BASE_URL}/api/leads/funding-calculator", json=payload)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["ok"] is True
        assert "id" in body and isinstance(body["id"], str) and len(body["id"]) > 0
        assert "estimate" in body
        est = body["estimate"]
        assert all(k in est for k in ("conservative", "average", "aggressive"))

        # verify persisted via /api/leads (admin-gated; skip if secret not configured)
        secret = os.environ.get("ADMIN_SECRET", "")
        if not secret:
            pytest.skip("ADMIN_SECRET not set – /api/leads is gated, persistence verified via 200 response")
        r2 = api.get(f"{BASE_URL}/api/leads?limit=200&secret={secret}")
        assert r2.status_code == 200
        items = r2.json()["items"]
        ids = [i.get("id") for i in items]
        assert body["id"] in ids
        for item in items:
            assert "_id" not in item

    def test_contact_lead_valid_email(self, api):
        payload = {
            "full_name": "TEST_Jane Smith",
            "company": "TEST_Co",
            "email": "test_jane@example.com",
            "phone": "5559876543",
            "desired_amount": 50000,
            "product_interest": "MCA",
            "notes": "TEST_contact lead",
        }
        r = api.post(f"{BASE_URL}/api/leads/contact", json=payload)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["ok"] is True
        assert body["id"]

    def test_contact_lead_invalid_email_rejected(self, api):
        payload = {
            "full_name": "TEST_Bad Email",
            "email": "not-an-email",
        }
        r = api.post(f"{BASE_URL}/api/leads/contact", json=payload)
        assert r.status_code == 422

    def test_leads_list_no_objectid_leak(self, api):
        # Endpoint is admin-gated; verify both: (a) unauthorized denied, (b) authorized has no _id
        r_un = api.get(f"{BASE_URL}/api/leads")
        assert r_un.status_code == 401, "Listing should be gated"
        secret = os.environ.get("ADMIN_SECRET", "")
        if not secret:
            pytest.skip("ADMIN_SECRET not set – cannot verify _id exclusion in admin response")
        r = api.get(f"{BASE_URL}/api/leads?secret={secret}")
        assert r.status_code == 200
        body = r.json()
        assert "items" in body and "count" in body
        for item in body["items"]:
            assert "_id" not in item
