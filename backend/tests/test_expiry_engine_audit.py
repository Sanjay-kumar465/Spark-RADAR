from datetime import date, timedelta
import pytest
from app.services.expiry_engine import calculate_document_status

def test_expiry_boundary_calculations():
    today = date(2026, 10, 29)

    # 1. 30 days remaining
    res30 = calculate_document_status(today + timedelta(days=30), threshold_days=30, reference_date=today)
    assert res30["status"] == "DUE_SOON"
    assert res30["label"] == "Expires in 30 days"
    assert res30["days_remaining"] == 30
    assert res30["is_expired"] is False
    assert res30["is_due_soon"] is True

    # 2. 15 days remaining
    res15 = calculate_document_status(today + timedelta(days=15), threshold_days=30, reference_date=today)
    assert res15["status"] == "DUE_SOON"
    assert res15["label"] == "Expires in 15 days"
    assert res15["days_remaining"] == 15

    # 3. 7 days remaining
    res7 = calculate_document_status(today + timedelta(days=7), threshold_days=30, reference_date=today)
    assert res7["status"] == "DUE_SOON"
    assert res7["label"] == "Expires in 7 days"

    # 4. 1 day remaining (singular check)
    res1 = calculate_document_status(today + timedelta(days=1), threshold_days=30, reference_date=today)
    assert res1["status"] == "DUE_SOON"
    assert res1["label"] == "Expires in 1 day"
    assert res1["days_remaining"] == 1

    # 5. On the expiry date (0 days remaining)
    res0 = calculate_document_status(today, threshold_days=30, reference_date=today)
    assert res0["status"] == "DUE_SOON"
    assert res0["label"] == "Expires today"
    assert res0["days_remaining"] == 0
    assert res0["is_expired"] is False
    assert res0["is_due_soon"] is True

    # 6. Expired 1 day ago (singular check)
    res_neg1 = calculate_document_status(today - timedelta(days=1), threshold_days=30, reference_date=today)
    assert res_neg1["status"] == "EXPIRED"
    assert res_neg1["label"] == "Expired 1 day ago"
    assert res_neg1["days_remaining"] == -1
    assert res_neg1["is_expired"] is True
    assert res_neg1["is_due_soon"] is False

    # 7. Expired 30 days ago (plural check)
    res_neg30 = calculate_document_status(today - timedelta(days=30), threshold_days=30, reference_date=today)
    assert res_neg30["status"] == "EXPIRED"
    assert res_neg30["label"] == "Expired 30 days ago"
    assert res_neg30["days_remaining"] == -30
    assert res_neg30["is_expired"] is True

    # 8. Beyond threshold (e.g. 60 days) -> ACTIVE
    res60 = calculate_document_status(today + timedelta(days=60), threshold_days=30, reference_date=today)
    assert res60["status"] == "ACTIVE"
    assert res60["label"] == "Valid for 60 days"
    assert res60["is_expired"] is False
    assert res60["is_due_soon"] is False

    # 9. Missing expiry date (None)
    res_none = calculate_document_status(None, threshold_days=30, reference_date=today)
    assert res_none["status"] == "NO_EXPIRY"
    assert res_none["label"] == "Recorded (No Expiry Date)"
    assert res_none["days_remaining"] is None
    assert res_none["is_expired"] is False
    assert res_none["is_due_soon"] is False


def test_dashboard_and_superseded_document_audit(client):
    # 1. Register new owner & business
    email = f"audit_expiry_{date.today().strftime('%Y%m%d%H%M%S')}@sparkradar.in"
    reg_resp = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "SecurePassword123!",
        "full_name": "Expiry Auditor",
        "workspace_name": "Precision Logistics Audit",
        "business_type": "lorry",
        "state_jurisdiction": "KA"
    })
    assert reg_resp.status_code == 200, reg_resp.text
    token = reg_resp.json()["access_token"]
    ws_id = reg_resp.json()["workspace"]["id"]
    headers = {"Authorization": f"Bearer {token}", "X-Workspace-Id": ws_id}

    # 2. Create vehicle A (Active)
    v_resp = client.post("/api/v1/vehicles", json={
        "registration_number": "KA 01 EX 1001",
        "make": "Ashok Leyland",
        "model": "Ecomet 1215",
        "manufacturing_year": 2023,
        "vehicle_category": "goods_carrier"
    }, headers=headers)
    assert v_resp.status_code == 200
    veh_a_id = v_resp.json()["id"]

    # 3. Create vehicle B (To be archived)
    v_resp_b = client.post("/api/v1/vehicles", json={
        "registration_number": "KA 01 EX 2002",
        "make": "Tata Motors",
        "model": "Prima 3530",
        "manufacturing_year": 2022,
        "vehicle_category": "heavy_goods"
    }, headers=headers)
    assert v_resp_b.status_code == 200
    veh_b_id = v_resp_b.json()["id"]

    # 4. Check initial dashboard summary
    dash_resp = client.get("/api/v1/dashboard/summary", headers=headers)
    assert dash_resp.status_code == 200
    dash_data = dash_resp.json()
    assert dash_data["total_vehicles"] == 2
    # Both have missing mandatory documents, so they are INCOMPLETE
    assert dash_data["vehicles_needing_attention"] == 2

    # 5. Archive Vehicle B
    arch_resp = client.delete(f"/api/v1/vehicles/{veh_b_id}", headers=headers)
    assert arch_resp.status_code == 200

    # Dashboard should now only count 1 vehicle (active)
    dash_resp2 = client.get("/api/v1/dashboard/summary", headers=headers)
    assert dash_resp2.status_code == 200
    assert dash_resp2.json()["total_vehicles"] == 1

    # 6. Upload an initial Insurance document to Vehicle A that expires tomorrow
    tomorrow = (date.today() + timedelta(days=1)).isoformat()
    doc1_resp = client.post(
        "/api/v1/documents/upload",
        headers=headers,
        data={
            "vehicle_id": veh_a_id,
            "category_code": "INSURANCE",
            "document_number": "POL-1001-A",
            "expiry_date": tomorrow
        },
        files={"file": ("insurance_v1.pdf", b"%PDF-1.4 initial insurance", "application/pdf")}
    )
    assert doc1_resp.status_code == 200, doc1_resp.text
    doc1_id = doc1_resp.json()["id"]

    # Verify dashboard reflects 1 upcoming renewal
    dash_resp3 = client.get("/api/v1/dashboard/summary", headers=headers)
    assert dash_resp3.json()["upcoming_renewals"] >= 1

    # 7. Supersede with renewal document that expires in 365 days
    next_year = (date.today() + timedelta(days=365)).isoformat()
    replace_resp = client.post(
        "/api/v1/documents/upload",
        headers=headers,
        data={
            "vehicle_id": veh_a_id,
            "category_code": "INSURANCE",
            "document_number": "POL-1001-B",
            "expiry_date": next_year,
            "replaces_document_id": doc1_id
        },
        files={"file": ("insurance_v2.pdf", b"%PDF-1.4 renewed insurance", "application/pdf")}
    )
    assert replace_resp.status_code == 200
    doc2_id = replace_resp.json()["id"]

    # 8. Check documents on Vehicle A: old document is marked superseded, new one is active
    veh_detail = client.get(f"/api/v1/vehicles/{veh_a_id}", headers=headers).json()
    docs_list = veh_detail["documents"]
    d1 = next(d for d in docs_list if d["id"] == doc1_id)
    d2 = next(d for d in docs_list if d["id"] == doc2_id)
    assert d1["is_superseded"] is True
    assert d2["is_superseded"] is False

    # 9. Dashboard should NO LONGER report Vehicle A's insurance as due soon!
    dash_resp4 = client.get("/api/v1/dashboard/summary", headers=headers)
    assert dash_resp4.status_code == 200
    # Insurance is valid for 365 days, so upcoming renewals from insurance is 0
    insurance_actions = [a for a in dash_resp4.json()["urgent_actions"] if a["title"] == "Renewal Due: Insurance Policy"]
    assert len(insurance_actions) == 0
