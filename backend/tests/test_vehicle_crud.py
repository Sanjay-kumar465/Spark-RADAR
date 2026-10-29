def test_vehicle_complete_crud_and_operations(client):
    # 1. Register fleet workspace
    res = client.post("/api/v1/auth/register", json={
        "full_name": "Karan Singhania",
        "email": "karan@singhlogistics.in",
        "password": "Password123!",
        "workspace_name": "Singhania Multimodal Fleet",
        "business_type": "mixed_fleet",
        "state_jurisdiction": "MH"
    })
    assert res.status_code == 200, res.text
    token = res.json()["access_token"]
    ws_id = res.json()["workspace"]["id"]
    headers = {"Authorization": f"Bearer {token}", "X-Workspace-Id": ws_id}

    # 2. Add Tourist Transport vehicle (Tempo Traveller)
    veh1_payload = {
        "registration_number": "MH 12 TT 8899",
        "vehicle_category": "tempo_traveller",
        "vehicle_use": "passenger_commercial",
        "make": "Force Motors",
        "model": "Traveller 3350",
        "manufacturing_year": 2024,
        "fuel_type": "Diesel",
        "ownership_type": "Owned",
        "seating_capacity": 17,
        "permit_type": "All India Tourist Permit (AITP)",
        "notes": "Premium AC 17-seater tourist vehicle"
    }
    create_res1 = client.post("/api/v1/vehicles", json=veh1_payload, headers=headers)
    assert create_res1.status_code == 200, create_res1.text
    veh1 = create_res1.json()
    assert veh1["registration_number"] == "MH 12 TT 8899"
    assert veh1["normalized_registration_number"] == "MH12TT8899"
    assert veh1["seating_capacity"] == 17
    assert veh1["permit_type"] == "All India Tourist Permit (AITP)"
    assert veh1["attention_status"] == "INCOMPLETE"
    veh1_id = veh1["id"]

    # 3. Add Lorry Fleet vehicle (Heavy Goods Truck)
    veh2_payload = {
        "registration_number": "MH 04 GD 7711",
        "vehicle_category": "goods_truck",
        "vehicle_use": "goods_carrier",
        "make": "Tata Motors",
        "model": "Signa 4825.TK",
        "manufacturing_year": 2023,
        "fuel_type": "Diesel",
        "ownership_type": "Financed",
        "gross_vehicle_weight_kg": 47500,
        "permit_type": "National Permit (Goods)",
        "notes": "16-wheeler long haul container truck"
    }
    create_res2 = client.post("/api/v1/vehicles", json=veh2_payload, headers=headers)
    assert create_res2.status_code == 200, create_res2.text
    veh2 = create_res2.json()
    assert veh2["registration_number"] == "MH 04 GD 7711"
    assert veh2["gross_vehicle_weight_kg"] == 47500
    veh2_id = veh2["id"]

    # 4. Duplicate registration check (with different casing and whitespace)
    dup_payload = {
        "registration_number": "mh-12-tt-8899", # Different formatting of veh1
        "vehicle_category": "tempo_traveller",
        "make": "Force",
        "model": "Traveller"
    }
    dup_res = client.post("/api/v1/vehicles", json=dup_payload, headers=headers)
    assert dup_res.status_code == 400
    assert "already exists in this workspace" in dup_res.json()["detail"]

    # 5. Search vehicles
    # Search by registration substring
    s1 = client.get("/api/v1/vehicles?search=8899", headers=headers).json()
    assert len(s1) == 1
    assert s1[0]["registration_number"] == "MH 12 TT 8899"

    # Search by make/model substring
    s2 = client.get("/api/v1/vehicles?search=Tata", headers=headers).json()
    assert len(s2) == 1
    assert s2[0]["registration_number"] == "MH 04 GD 7711"

    # 6. Filter by category
    f_passenger = client.get("/api/v1/vehicles?category=tempo_traveller", headers=headers).json()
    assert len(f_passenger) == 1
    assert f_passenger[0]["id"] == veh1_id

    f_goods = client.get("/api/v1/vehicles?category=goods_truck", headers=headers).json()
    assert len(f_goods) == 1
    assert f_goods[0]["id"] == veh2_id

    # 7. Sort vehicles by registration
    s_reg = client.get("/api/v1/vehicles?sort_by=registration", headers=headers).json()
    assert len(s_reg) >= 2
    assert s_reg[0]["registration_number"] == "MH 04 GD 7711" # MH 04 before MH 12

    # 8. Update vehicle
    upd_res = client.put(f"/api/v1/vehicles/{veh1_id}", json={
        "model": "Traveller 3350 Luxury",
        "seating_capacity": 18,
        "notes": "Updated with recliner seats"
    }, headers=headers)
    assert upd_res.status_code == 200
    assert upd_res.json()["model"] == "Traveller 3350 Luxury"
    assert upd_res.json()["seating_capacity"] == 18

    # 9. Register a driver and assign to vehicle
    driver_res = client.post("/api/v1/drivers", json={
        "full_name": "Ramesh Pawar",
        "phone": "+91 98200 55443",
        "licence_number": "MH12 20180045678",
        "licence_category": "TRANS",
        "status": "active"
    }, headers=headers)
    assert driver_res.status_code == 200
    driver_id = driver_res.json()["id"]

    # Assign driver to vehicle
    assign_res = client.post(f"/api/v1/vehicles/{veh1_id}/assign-driver?driver_id={driver_id}", headers=headers)
    assert assign_res.status_code == 200
    detail = assign_res.json()
    assert detail["assigned_driver_name"] == "Ramesh Pawar"
    assert len(detail["driver_assignments"]) >= 1

    # 10. Add FASTag record to vehicle
    fastag_res = client.post("/api/v1/operations/fastag", json={
        "vehicle_id": veh1_id,
        "tag_id": "607417-001-99882233",
        "issuer_bank": "ICICI Bank FASTag",
        "recorded_status": "active",
        "notes": "Linked to Singhania fleet wallet"
    }, headers=headers)
    assert fastag_res.status_code == 200

    # 11. Add Maintenance service record to vehicle
    maint_res = client.post("/api/v1/operations/maintenance", json={
        "vehicle_id": veh1_id,
        "service_date": "2026-10-15",
        "service_type": "Scheduled 40,000 KM Periodic Service",
        "description": "Engine oil replacement, brake pads inspection, AC filter renewal",
        "odometer_km": 40250,
        "service_provider": "Force Authorized Workshop Pune",
        "cost": 14500.00
    }, headers=headers)
    assert maint_res.status_code == 200

    # 12. Check complete vehicle detail endpoint
    v_detail = client.get(f"/api/v1/vehicles/{veh1_id}", headers=headers).json()
    assert v_detail["id"] == veh1_id
    assert len(v_detail["document_summaries"]) >= 6 # Applicable documents checklist
    assert len(v_detail["fastag_records"]) == 1
    assert len(v_detail["maintenance_records"]) == 1
    assert v_detail["fastag_records"][0]["tag_id"] == "607417-001-99882233"

    # 13. Archive vehicle
    del_res = client.delete(f"/api/v1/vehicles/{veh1_id}", headers=headers)
    assert del_res.status_code == 200

    # Verify not listed in active vehicles
    active_list = client.get("/api/v1/vehicles", headers=headers).json()
    active_ids = [v["id"] for v in active_list]
    assert veh1_id not in active_ids

    # Verify listed when include_archived=True
    all_list = client.get("/api/v1/vehicles?include_archived=true", headers=headers).json()
    all_ids = [v["id"] for v in all_list]
    assert veh1_id in all_ids

    # 14. Unarchive vehicle
    unarchive_res = client.post(f"/api/v1/vehicles/{veh1_id}/unarchive", headers=headers)
    assert unarchive_res.status_code == 200
    assert unarchive_res.json()["is_archived"] is False

    # Verify active again
    restored_list = client.get("/api/v1/vehicles", headers=headers).json()
    restored_ids = [v["id"] for v in restored_list]
    assert veh1_id in restored_ids

