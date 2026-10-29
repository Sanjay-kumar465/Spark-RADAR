import uuid
import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from main import app
from app.core.database import Base, engine, SessionLocal
from app.models.user import User

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.create_all(bind=engine)
    yield

def test_google_login_missing_credential():
    resp = client.post("/api/v1/auth/google", json={"credential": ""})
    assert resp.status_code == 400
    assert "Google credential token is required" in resp.json()["detail"]

def test_google_login_invalid_credential():
    with patch("httpx.Client.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 400
        mock_resp.json.return_value = {"error": "invalid_token"}
        mock_get.return_value = mock_resp

        resp = client.post("/api/v1/auth/google", json={"credential": "invalid-token-12345"})
        assert resp.status_code == 401
        assert "Invalid or expired Google credential" in resp.json()["detail"]

def test_google_login_new_user_success():
    unique_suffix = uuid.uuid4().hex[:8]
    unique_email = f"chennai.{unique_suffix}@sparkradar.in"
    unique_sub = f"google-user-{unique_suffix}"

    mock_token_info = {
        "sub": unique_sub,
        "email": unique_email,
        "email_verified": "true",
        "name": "Karthik Raja",
        "iss": "https://accounts.google.com"
    }

    with patch("httpx.Client.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = mock_token_info
        mock_get.return_value = mock_resp

        resp = client.post("/api/v1/auth/google", json={
            "credential": "valid-simulated-token",
            "workspace_name": f"Karthik Transports {unique_suffix}",
            "business_type": "goods_transport",
            "state_jurisdiction": "TN"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == unique_email
        assert data["user"]["full_name"] == "Karthik Raja"
        assert data["workspace"] is not None
        assert data["workspace"]["name"] == f"Karthik Transports {unique_suffix}"
        assert data["workspace"]["role"] == "owner"

def test_google_login_existing_user_linking():
    unique_suffix = uuid.uuid4().hex[:8]
    unique_email = f"linked.{unique_suffix}@sparkradar.in"
    unique_sub = f"google-sub-{unique_suffix}"
    user_id = f"user-{unique_suffix}"

    db = SessionLocal()
    existing_user = User(
        id=user_id,
        email=unique_email,
        hashed_password="some_hashed_password",
        full_name="Murugan Express",
        is_active=True
    )
    db.add(existing_user)
    db.commit()
    db.close()

    mock_token_info = {
        "sub": unique_sub,
        "email": unique_email,
        "email_verified": "true",
        "name": "Murugan Express",
        "iss": "https://accounts.google.com"
    }

    with patch("httpx.Client.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = mock_token_info
        mock_get.return_value = mock_resp

        resp = client.post("/api/v1/auth/google", json={
            "credential": "valid-linking-token"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["user"]["email"] == unique_email

    db2 = SessionLocal()
    updated = db2.query(User).filter(User.email == unique_email).first()
    assert updated.google_id == unique_sub
    db2.close()
