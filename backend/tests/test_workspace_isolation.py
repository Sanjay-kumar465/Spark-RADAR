def test_strict_cross_tenant_isolation(client):
    # 1. Register Workspace Alpha (Alpha Travel Hub)
    res_a = client.post("/api/v1/auth/register", json={
        "full_name": "Arun Verma",
        "email": "arun@alphahub.in",
        "password": "PasswordAlpha123!",
        "workspace_name": "Alpha Travel Hub",
        "business_type": "travel_agency",
        "state_jurisdiction": "MH"
    })
    assert res_a.status_code == 200
    token_a = res_a.json()["access_token"]
    ws_id_a = res_a.json()["workspace"]["id"]
    headers_a = {"Authorization": f"Bearer {token_a}", "X-Workspace-Id": ws_id_a}

    # 2. Register Workspace Beta (Beta Logistics Corp)
    res_b = client.post("/api/v1/auth/register", json={
        "full_name": "Balwinder Singh",
        "email": "balwinder@betalogistics.in",
        "password": "PasswordBeta123!",
        "workspace_name": "Beta Logistics Corp",
        "business_type": "goods_transport",
        "state_jurisdiction": "PB"
    })
    assert res_b.status_code == 200
    token_b = res_b.json()["access_token"]
    ws_id_b = res_b.json()["workspace"]["id"]
    headers_b = {"Authorization": f"Bearer {token_b}", "X-Workspace-Id": ws_id_b}

    # 3. Alpha creates a vehicle
    res_v_a = client.post("/api/v1/vehicles", headers=headers_a, json={
        "registration_number": "MH 02 AB 1111",
        "vehicle_category": "sedan_taxi",
        "vehicle_use": "passenger_commercial",
        "make": "Maruti Suzuki",
        "model": "Dzire Tour",
        "manufacturing_year": 2024,
        "fuel_type": "CNG",
        "ownership_type": "Owned"
    })
    assert res_v_a.status_code == 200
    veh_id_a = res_v_a.json()["id"]

    # 4. Beta creates a vehicle
    res_v_b = client.post("/api/v1/vehicles", headers=headers_b, json={
        "registration_number": "PB 10 CD 2222",
        "vehicle_category": "goods_truck",
        "vehicle_use": "goods_carrier",
        "make": "Tata Motors",
        "model": "Prima 3530.K",
        "manufacturing_year": 2023,
        "fuel_type": "Diesel",
        "ownership_type": "Owned"
    })
    assert res_v_b.status_code == 200
    veh_id_b = res_v_b.json()["id"]

    # 5. Verify list isolation
    # Alpha only sees Alpha's vehicle
    list_a = client.get("/api/v1/vehicles", headers=headers_a).json()
    reg_numbers_a = [v["registration_number"] for v in list_a]
    assert "MH 02 AB 1111" in reg_numbers_a
    assert "PB 10 CD 2222" not in reg_numbers_a

    # Beta only sees Beta's vehicle
    list_b = client.get("/api/v1/vehicles", headers=headers_b).json()
    reg_numbers_b = [v["registration_number"] for v in list_b]
    assert "PB 10 CD 2222" in reg_numbers_b
    assert "MH 02 AB 1111" not in reg_numbers_b

    # 6. Verify cross-tenant direct resource access rejection
    # Beta tries to read Alpha's vehicle with Beta's valid token and workspace header
    peek_res = client.get(f"/api/v1/vehicles/{veh_id_a}", headers=headers_b)
    assert peek_res.status_code == 404, "Beta was able to view Alpha's vehicle!"

    # Beta tries to modify Alpha's vehicle
    tamper_res = client.put(f"/api/v1/vehicles/{veh_id_a}", headers=headers_b, json={
        "make": "Hacked Make"
    })
    assert tamper_res.status_code == 404

    # Beta tries to archive Alpha's vehicle
    del_res = client.delete(f"/api/v1/vehicles/{veh_id_a}", headers=headers_b)
    assert del_res.status_code == 404

    # 7. Verify cross-tenant header spoofing rejection (Tenant Isolation)
    # Beta attempts to impersonate Alpha's workspace by sending Alpha's workspace ID with Beta's token
    spoofed_headers = {"Authorization": f"Bearer {token_b}", "X-Workspace-Id": ws_id_a}
    spoof_res = client.get("/api/v1/vehicles", headers=spoofed_headers)
    assert spoof_res.status_code == 403, "Beta was allowed to access Alpha's workspace via spoofed header!"
    assert "You do not have access to this workspace" in spoof_res.json()["detail"]

    # Alpha attempts to impersonate Beta's workspace
    spoofed_headers_a = {"Authorization": f"Bearer {token_a}", "X-Workspace-Id": ws_id_b}
    spoof_res_a = client.get("/api/v1/vehicles", headers=spoofed_headers_a)
    assert spoof_res_a.status_code == 403
