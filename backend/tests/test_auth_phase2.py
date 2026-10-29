from app.models.user import User

def test_auth_full_lifecycle(client, db_session):
    # 1. Register new user
    reg_payload = {
        "full_name": "Suresh Patel",
        "email": "suresh@pateltrans.com",
        "password": "SecurePassword123!",
        "phone": "+91 99887 76655",
        "workspace_name": "Patel Roadlines",
        "business_type": "goods_transport",
        "state_jurisdiction": "GJ"
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["access_token"]
    assert data["user"]["email"] == "suresh@pateltrans.com"
    assert data["workspace"]["name"] == "Patel Roadlines"
    assert data["workspace"]["role"] == "owner"

    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Check /me session endpoint
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["full_name"] == "Suresh Patel"

    # 3. Test duplicate registration prevention
    dup_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert dup_res.status_code == 400
    assert "already exists" in dup_res.json()["detail"]

    # 4. Test login with correct password
    login_res = client.post("/api/v1/auth/login", json={
        "email": "suresh@pateltrans.com",
        "password": "SecurePassword123!"
    })
    assert login_res.status_code == 200
    assert login_res.json()["access_token"]

    # 5. Test login with wrong password
    bad_login = client.post("/api/v1/auth/login", json={
        "email": "suresh@pateltrans.com",
        "password": "WrongPassword999!"
    })
    assert bad_login.status_code == 401

    # 6. Test change password
    change_res = client.post("/api/v1/auth/change-password", headers=headers, json={
        "current_password": "SecurePassword123!",
        "new_password": "BrandNewPassword456!"
    })
    assert change_res.status_code == 200

    # Verify old password no longer works
    old_login = client.post("/api/v1/auth/login", json={
        "email": "suresh@pateltrans.com",
        "password": "SecurePassword123!"
    })
    assert old_login.status_code == 401

    # Verify new password works
    new_login = client.post("/api/v1/auth/login", json={
        "email": "suresh@pateltrans.com",
        "password": "BrandNewPassword456!"
    })
    assert new_login.status_code == 200
    new_token = new_login.json()["access_token"]
    new_headers = {"Authorization": f"Bearer {new_token}"}

    # 7. Test forgot password flow
    forgot_res = client.post("/api/v1/auth/forgot-password", json={
        "email": "suresh@pateltrans.com"
    })
    assert forgot_res.status_code == 200
    reset_token = forgot_res.json()["reset_token"]
    assert reset_token is not None

    # 8. Test reset password with reset_token
    reset_res = client.post("/api/v1/auth/reset-password", json={
        "token": reset_token,
        "new_password": "RecoveredPassword789!"
    })
    assert reset_res.status_code == 200

    # 9. Verify reset_token cannot be reused
    reuse_res = client.post("/api/v1/auth/reset-password", json={
        "token": reset_token,
        "new_password": "AnotherPassword!"
    })
    assert reuse_res.status_code == 400

    # 10. Verify login with recovered password
    recov_login = client.post("/api/v1/auth/login", json={
        "email": "suresh@pateltrans.com",
        "password": "RecoveredPassword789!"
    })
    assert recov_login.status_code == 200

    # 11. Test logout
    logout_res = client.post("/api/v1/auth/logout", headers=new_headers)
    assert logout_res.status_code == 200
