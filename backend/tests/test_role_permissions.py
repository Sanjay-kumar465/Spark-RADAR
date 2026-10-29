def test_role_based_access_control(client):
    # 1. Register Workspace Owner
    res_owner = client.post("/api/v1/auth/register", json={
        "full_name": "Devendra Joshi",
        "email": "devendra@joshi-trans.in",
        "password": "OwnerPassword123!",
        "workspace_name": "Joshi Transport Solutions",
        "business_type": "mixed_fleet",
        "state_jurisdiction": "RJ"
    })
    assert res_owner.status_code == 200
    owner_token = res_owner.json()["access_token"]
    ws_id = res_owner.json()["workspace"]["id"]
    owner_headers = {"Authorization": f"Bearer {owner_token}", "X-Workspace-Id": ws_id}

    # 2. Owner invites Admin, Manager, and Staff
    inv_admin = client.post("/api/v1/workspaces/members", headers=owner_headers, json={
        "email": "admin@joshi-trans.in",
        "role": "admin",
        "full_name": "Aditya Admin",
        "temporary_password": "AdminPassword123!"
    })
    assert inv_admin.status_code == 200
    admin_member_id = inv_admin.json()["id"]

    inv_mgr = client.post("/api/v1/workspaces/members", headers=owner_headers, json={
        "email": "manager@joshi-trans.in",
        "role": "manager",
        "full_name": "Manish Manager",
        "temporary_password": "MgrPassword123!"
    })
    assert inv_mgr.status_code == 200

    inv_staff = client.post("/api/v1/workspaces/members", headers=owner_headers, json={
        "email": "staff@joshi-trans.in",
        "role": "staff",
        "full_name": "Sunil Staff",
        "temporary_password": "StaffPassword123!"
    })
    assert inv_staff.status_code == 200
    staff_member_id = inv_staff.json()["id"]

    # 3. Log in as Staff
    login_staff = client.post("/api/v1/auth/login", json={
        "email": "staff@joshi-trans.in",
        "password": "StaffPassword123!"
    })
    assert login_staff.status_code == 200
    staff_token = login_staff.json()["access_token"]
    staff_headers = {"Authorization": f"Bearer {staff_token}", "X-Workspace-Id": ws_id}

    # 4. Log in as Manager
    login_mgr = client.post("/api/v1/auth/login", json={
        "email": "manager@joshi-trans.in",
        "password": "MgrPassword123!"
    })
    assert login_mgr.status_code == 200
    mgr_token = login_mgr.json()["access_token"]
    mgr_headers = {"Authorization": f"Bearer {mgr_token}", "X-Workspace-Id": ws_id}

    # 5. Log in as Admin
    login_admin = client.post("/api/v1/auth/login", json={
        "email": "admin@joshi-trans.in",
        "password": "AdminPassword123!"
    })
    assert login_admin.status_code == 200
    admin_token = login_admin.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}", "X-Workspace-Id": ws_id}

    # 6. Verify STAFF permissions
    # Staff can view vehicles
    staff_view = client.get("/api/v1/vehicles", headers=staff_headers)
    assert staff_view.status_code == 200

    # Staff CANNOT create a vehicle (403)
    veh_payload = {
        "registration_number": "RJ 14 TA 1234",
        "vehicle_category": "sedan_taxi",
        "vehicle_use": "passenger_commercial",
        "make": "Toyota",
        "model": "Etios",
        "manufacturing_year": 2022,
        "fuel_type": "Diesel",
        "ownership_type": "Owned"
    }
    staff_create = client.post("/api/v1/vehicles", headers=staff_headers, json=veh_payload)
    assert staff_create.status_code == 403, "Staff was allowed to create a vehicle!"

    # Staff CANNOT invite members (403)
    staff_invite = client.post("/api/v1/workspaces/members", headers=staff_headers, json={
        "email": "intruder@joshi-trans.in",
        "role": "staff"
    })
    assert staff_invite.status_code == 403

    # Staff CANNOT update workspace settings (403)
    staff_ws_upd = client.put("/api/v1/workspaces/current", headers=staff_headers, json={
        "name": "Hacked Transport"
    })
    assert staff_ws_upd.status_code == 403

    # 7. Verify MANAGER permissions
    # Manager CAN create vehicles (200)
    mgr_create = client.post("/api/v1/vehicles", headers=mgr_headers, json=veh_payload)
    assert mgr_create.status_code == 200, mgr_create.text
    veh_id = mgr_create.json()["id"]

    # Manager CAN update vehicles (200)
    mgr_update = client.put(f"/api/v1/vehicles/{veh_id}", headers=mgr_headers, json={
        "notes": "Updated by manager"
    })
    assert mgr_update.status_code == 200

    # Manager CANNOT archive vehicles (403 - requires owner or admin)
    mgr_archive = client.delete(f"/api/v1/vehicles/{veh_id}", headers=mgr_headers)
    assert mgr_archive.status_code == 403, "Manager was allowed to delete/archive vehicle!"

    # Manager CANNOT invite members (403)
    mgr_inv = client.post("/api/v1/workspaces/members", headers=mgr_headers, json={
        "email": "test@test.com",
        "role": "staff"
    })
    assert mgr_inv.status_code == 403

    # 8. Verify ADMIN permissions
    # Admin CAN update workspace settings (200)
    admin_ws_upd = client.put("/api/v1/workspaces/current", headers=admin_headers, json={
        "name": "Joshi Transport Solutions Ltd."
    })
    assert admin_ws_upd.status_code == 200
    assert admin_ws_upd.json()["name"] == "Joshi Transport Solutions Ltd."

    # Admin CAN archive vehicles (200)
    admin_archive = client.delete(f"/api/v1/vehicles/{veh_id}", headers=admin_headers)
    assert admin_archive.status_code == 200

    # Admin CANNOT promote someone to owner (403 - only owner can)
    admin_promote = client.put(f"/api/v1/workspaces/members/{staff_member_id}", headers=admin_headers, json={
        "role": "owner"
    })
    assert admin_promote.status_code == 403

    # 9. Verify OWNER permissions
    # Owner CAN promote staff to manager
    owner_promote = client.put(f"/api/v1/workspaces/members/{staff_member_id}", headers=owner_headers, json={
        "role": "manager"
    })
    assert owner_promote.status_code == 200
    assert owner_promote.json()["role"] == "manager"

    # Owner CAN remove members
    owner_del = client.delete(f"/api/v1/workspaces/members/{staff_member_id}", headers=owner_headers)
    assert owner_del.status_code == 200
