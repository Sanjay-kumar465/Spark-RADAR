from datetime import date, timedelta

def test_register_login_and_fleet_flow(client):
    # 1. Register user
    reg_payload = {
        "full_name": "Rajesh Sharma",
        "email": "rajesh@sharmatours.in",
        "password": "Password123!",
        "phone": "+91 98765 43210",
        "workspace_name": "Sharma Tourist Services",
        "business_type": "travel_agency",
        "state_jurisdiction": "MH"
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 200, res.text
    auth_data = res.json()
    token = auth_data["access_token"]
    workspace = auth_data["workspace"]
    assert token is not None
    assert workspace["name"] == "Sharma Tourist Services"
    ws_id = workspace["id"]

    headers = {
        "Authorization": f"Bearer {token}",
        "X-Workspace-Id": ws_id
    }

    # 2. Check /me
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "rajesh@sharmatours.in"

    # 3. Add Vehicle 1 (Tempo Traveller)
    veh_payload = {
        "registration_number": "MH 12 QW 9988",
        "vehicle_category": "tempo_traveller",
        "vehicle_use": "passenger_commercial",
        "make": "Force Motors",
        "model": "Traveller 3050",
        "manufacturing_year": 2023,
        "fuel_type": "Diesel",
        "ownership_type": "Owned"
    }
    veh_res = client.post("/api/v1/vehicles", json=veh_payload, headers=headers)
    assert veh_res.status_code == 200, veh_res.text
    veh_data = veh_res.json()
    veh_id = veh_data["id"]
    assert veh_data["registration_number"] == "MH 12 QW 9988"
    assert veh_data["attention_status"] == "INCOMPLETE" # Missing mandatory documents initially

    # 4. Duplicate vehicle registration check
    dup_res = client.post("/api/v1/vehicles", json=veh_payload, headers=headers)
    assert dup_res.status_code == 400
    assert "already exists" in dup_res.json()["detail"]

    # 5. Add Document (Insurance with future expiry - 180 days)
    today = date.today()
    ins_expiry = str(today + timedelta(days=180))
    doc_form = {
        "category_code": "INSURANCE",
        "vehicle_id": veh_id,
        "document_number": "POL-ICICI-2026-9988",
        "issuing_authority": "ICICI Lombard General Insurance",
        "issue_date": str(today - timedelta(days=180)),
        "expiry_date": ins_expiry,
    }
    doc_res = client.post("/api/v1/documents/upload", data=doc_form, headers=headers)
    assert doc_res.status_code == 200, doc_res.text
    doc_data = doc_res.json()
    assert doc_data["status"] == "ACTIVE"

    # 6. Add Document with Expiry in 10 days (Due Soon)
    puc_expiry = str(today + timedelta(days=10))
    puc_form = {
        "category_code": "PUC",
        "vehicle_id": veh_id,
        "document_number": "PUC-MH12-5544",
        "issuing_authority": "Shivaji Nagar Emission Testing",
        "issue_date": str(today - timedelta(days=170)),
        "expiry_date": puc_expiry,
    }
    puc_res = client.post("/api/v1/documents/upload", data=puc_form, headers=headers)
    assert puc_res.status_code == 200
    puc_data = puc_res.json()
    assert puc_data["status"] == "DUE_SOON"

    # 7. Add Renewal Task
    task_payload = {
        "title": "Renew PUC Certificate for MH 12 QW 9988",
        "due_date": puc_expiry,
        "vehicle_id": veh_id,
        "priority": "high"
    }
    task_res = client.post("/api/v1/renewals", json=task_payload, headers=headers)
    assert task_res.status_code == 200
    task_data = task_res.json()
    task_id = task_data["id"]

    # 8. Complete Renewal Task
    complete_res = client.put(f"/api/v1/renewals/{task_id}", json={
        "status": "completed",
        "completion_notes": "Tested emissions at Vahan center, certificate renewed for 6 months."
    }, headers=headers)
    assert complete_res.status_code == 200
    assert complete_res.json()["status"] == "completed"

    # 9. Dashboard summary verification (real persisted data)
    dash_res = client.get("/api/v1/dashboard/summary", headers=headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["total_vehicles"] == 1
    assert dash_data["vehicles_needing_attention"] >= 1
