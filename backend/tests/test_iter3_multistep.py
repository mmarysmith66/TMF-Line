"""Iteration 3 — MultiStep calculator backend changes.
- outstanding_balance reduces the funding estimate
- text_opt_in flag is accepted and persisted alongside outstanding_balance.
"""
import os
import requests

BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or open("/app/frontend/.env").read().split("REACT_APP_BACKEND_URL=")[1].splitlines()[0]).rstrip("/")


def _payload(**over):
    p = {
        "monthly_revenue": 100000,
        "industry": "Retail",
        "time_in_business": "2 – 5 years",
        "credit_score": "700 – 749",
        "existing_positions": "1 position",
    }
    p.update(over)
    return p


def test_outstanding_balance_lowers_estimate():
    r0 = requests.post(f"{BASE_URL}/api/calc/funding-estimate", json=_payload(outstanding_balance=0))
    r1 = requests.post(f"{BASE_URL}/api/calc/funding-estimate", json=_payload(outstanding_balance=50000))
    assert r0.status_code == 200 and r1.status_code == 200
    e0, e1 = r0.json()["estimate"], r1.json()["estimate"]
    assert e1["average"] < e0["average"], (e0, e1)
    # Spec says net = gross - 0.5*ob; with ob=50k -> ~25k drop in raw avg
    assert e0["average"] - e1["average"] >= 20000


def test_outstanding_balance_ignored_when_zero_revenue():
    r = requests.post(f"{BASE_URL}/api/calc/funding-estimate", json={"monthly_revenue": 0, "outstanding_balance": 1000000})
    assert r.status_code == 200
    assert r.json()["estimate"] == {"conservative": 0, "average": 0, "aggressive": 0}


def test_lead_persists_new_fields():
    payload = {
        "first_name": "TEST_Iter3",
        "last_name": "Wizard",
        "business_name": "TEST_Wiz Co",
        "monthly_revenue": 80000,
        "industry": "Technology",
        "time_in_business": "1 – 2 years",
        "credit_score": "650 – 699",
        "existing_positions": "2 positions",
        "outstanding_balance": 30000,
        "email": "test_iter3@example.com",
        "phone": "5550001111",
        "text_opt_in": True,
    }
    r = requests.post(f"{BASE_URL}/api/leads/funding-calculator", json=payload)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["ok"] is True and body["id"]
    est = body["estimate"]
    assert all(k in est for k in ("conservative", "average", "aggressive"))
    # outstanding_balance > 0 should reduce average vs same payload with 0
    payload_no_ob = {**payload, "outstanding_balance": 0}
    r2 = requests.post(f"{BASE_URL}/api/leads/funding-calculator", json=payload_no_ob)
    assert r2.json()["estimate"]["average"] > est["average"]


def test_text_opt_in_false_default_works():
    # text_opt_in omitted should still succeed
    r = requests.post(f"{BASE_URL}/api/leads/funding-calculator", json={
        "first_name": "TEST_NoOpt", "last_name": "X", "business_name": "TEST_X",
        "monthly_revenue": 25000, "industry": "Other", "time_in_business": "Under 6 months",
        "credit_score": "550 – 599", "existing_positions": "None",
        "email": "test_noopt@example.com", "phone": "5550000000",
    })
    assert r.status_code == 200
    assert r.json()["ok"] is True


def test_huge_revenue_accepted():
    # cap is display-only on the frontend; backend should accept >= 2M
    r = requests.post(f"{BASE_URL}/api/calc/funding-estimate", json=_payload(monthly_revenue=5_000_000))
    assert r.status_code == 200
    est = r.json()["estimate"]
    assert est["average"] > 0
