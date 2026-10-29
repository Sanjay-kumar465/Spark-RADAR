from datetime import date, timedelta
import pytest

def test_duplicate_normalized_registration_within_and_across_workspaces(client):
    # Register Workspace Alpha
    reg_a = client.post("/api/v1/auth/register", json={
        "email": "alpha_owner@fleetalpha.in",
        "password": "Password123!",
        "full_name": "Alpha Owner",
        "workspace_name": "Fleet Alpha",
        "business_type": "travel_agency",
        "state_jurisdiction": "DL"
    })
    assert reg_a.status_code == 200
    token_a = reg_a.json()["access_token"]
    ws_id_a = reg_a.json()["workspace"]["id"]
    headers_a = {"Authorization": f"Bearer {token_a}", "X-Workspace-Id": ws_id_a}

    # Register Workspace Beta
    reg_b = client.post("/api/v1/auth/register", json={
        "email": "beta_owner@fleetbeta.in",
        "password": "Password123!",
        "full_name": "Beta Owner",
        "workspace_name": "Fleet Beta",
        "business_type": "lorry",
        "state_jurisdiction": "HR"
    })
    assert reg_b.status_code == 200
    token_b = reg_b.json()["access_token"]
    ws_id_b = reg_b.json()["workspace"]["id"]
    headers_b = {"Authorization": f"Bearer {token_b}", "X-Workspace-Id": ws_id_b}

    # 1. Create vehicle in Workspace Alpha
    v1_res = client.post("/api/v1/vehicles", json={
        "registration_number": "DL 01 AB 1234",
        "make": "Force Motors",
        "model": "Urbania",
        "manufacturing_year": 2024,
        "vehicle_category": "tempo_traveller"
    }, headers=headers_a)
    assert v1_res.status_code == 200
    veh_a_id = v1_res.json()["id"]

    # 2. Attempt duplicate vehicle in Workspace Alpha with different spacing/hyphens/casing
    v2_res = client.post("/api/v1/vehicles", json={
        "registration_number": "dl-01-ab-1234",
        "make": "Force Motors",
        "model": "Traveller 3350",
        "manufacturing_year": 2023,
        "vehicle_category": "tempo_traveller"
    }, headers=headers_a)
    assert v2_res.status_code == 400
    assert "already exists" in v2_res.json()["detail"].lower()

    # 3. Create the exact same registration in Workspace Beta -> MUST SUCCEED (Multi-tenant coexistence)
    v3_res = client.post("/api/v1/vehicles", json={
        "registration_number": "DL 01 AB 1234",
        "make": "Ashok Leyland",
        "model": "Partner",
        "manufacturing_year": 2024,
        "vehicle_category": "goods_carrier"
    }, headers=headers_b)
    assert v3_res.status_code == 200
    veh_b_id = v3_res.json()["id"]
    assert veh_a_id != veh_b_id


def test_renewal_task_completion_audit_and_idempotency(client):
    reg = client.post("/api/v1/auth/register", json={
        "email": "task_owner@fleetflow.in",
        "password": "Password123!",
        "full_name": "Task Auditor",
        "workspace_name": "Task Audit Fleet",
        "business_type": "travel_agency",
        "state_jurisdiction": "MH"
    })
    token = reg.json()["access_token"]
    ws_id = reg.json()["workspace"]["id"]
    headers = {"Authorization": f"Bearer {token}", "X-Workspace-Id": ws_id}

    # Create vehicle
    v = client.post("/api/v1/vehicles", json={
        "registration_number": "MH 12 CD 5678",
        "make": "Tata Motors",
        "model": "Winger",
        "manufacturing_year": 2023,
        "vehicle_category": "tempo_traveller"
    }, headers=headers).json()
    v_id = v["id"]

    # Create renewal task
    task_res = client.post("/api/v1/renewals", json={
        "vehicle_id": v_id,
        "title": "Renew Fitness Certificate",
        "due_date": (date.today() + timedelta(days=5)).isoformat(),
        "priority": "high",
        "description": "Book RTO inspection slot"
    }, headers=headers)
    assert task_res.status_code == 200
    task_id = task_res.json()["id"]

    # 1. Complete the task
    comp_res1 = client.put(f"/api/v1/renewals/{task_id}", json={
        "status": "completed",
        "completion_notes": "RTO inspection passed. New CF issued."
    }, headers=headers)
    assert comp_res1.status_code == 200
    task_done = comp_res1.json()
    assert task_done["status"] == "completed"
    assert task_done["completed_at"] is not None
    assert "RTO inspection passed" in task_done["completion_notes"]

    # 2. Repeated / concurrent completion call is idempotent and safe
    comp_res2 = client.put(f"/api/v1/renewals/{task_id}", json={
        "status": "completed",
        "completion_notes": "RTO inspection passed. Verified certificate on VAHAN portal."
    }, headers=headers)
    assert comp_res2.status_code == 200
    task_done2 = comp_res2.json()
    assert task_done2["status"] == "completed"
    assert "Verified certificate on VAHAN portal" in task_done2["completion_notes"]
