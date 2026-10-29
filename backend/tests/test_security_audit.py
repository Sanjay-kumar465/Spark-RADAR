import os
import pytest
from app.core.config import settings

def test_comprehensive_security_and_workspace_isolation(client):
    # Setup Workspace Alpha
    res_a = client.post("/api/v1/auth/register", json={
        "full_name": "Arjun Singhal",
        "email": "arjun@singhaltrans.in",
        "password": "PasswordAlpha123!",
        "workspace_name": "Singhal Transport MH",
        "business_type": "travel_agency",
        "state_jurisdiction": "MH"
    })
    assert res_a.status_code == 200
    token_a = res_a.json()["access_token"]
    ws_id_a = res_a.json()["workspace"]["id"]
    headers_a = {"Authorization": f"Bearer {token_a}", "X-Workspace-Id": ws_id_a}

    # Setup Workspace Beta
    res_b = client.post("/api/v1/auth/register", json={
        "full_name": "Bikram Gill",
        "email": "bikram@gilllogistics.in",
        "password": "PasswordBeta123!",
        "workspace_name": "Gill Heavy Freight PB",
        "business_type": "goods_transport",
        "state_jurisdiction": "PB"
    })
    assert res_b.status_code == 200
    token_b = res_b.json()["access_token"]
    ws_id_b = res_b.json()["workspace"]["id"]
    headers_b = {"Authorization": f"Bearer {token_b}", "X-Workspace-Id": ws_id_b}

    # Alpha creates resources
    v_a = client.post("/api/v1/vehicles", headers=headers_a, json={
        "registration_number": "MH 12 AA 1111",
        "vehicle_category": "tempo_traveller",
        "make": "Force",
        "model": "Traveller"
    }).json()
    veh_id_a = v_a["id"]

    drv_a = client.post("/api/v1/drivers", headers=headers_a, json={
        "full_name": "Deepak Driver",
        "phone": "+91 98000 11111",
        "licence_number": "MH12 20190011111"
    }).json()
    drv_id_a = drv_a["id"]

    # Upload genuine PDF document for Alpha's vehicle
    pdf_content = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
    doc_res_a = client.post(
        "/api/v1/documents/upload",
        headers=headers_a,
        data={
            "category_code": "INSURANCE",
            "vehicle_id": veh_id_a,
            "document_number": "POL-ALPHA-999",
            "issue_date": "2026-01-01",
            "expiry_date": "2026-12-31"
        },
        files={"file": ("insurance.pdf", pdf_content, "application/pdf")}
    )
    assert doc_res_a.status_code == 200, doc_res_a.text
    doc_id_a = doc_res_a.json()["id"]

    # 1. Cross-Workspace Resource Reference Injection Attacks
    # Beta tries to create a task in Beta referencing Alpha's vehicle
    bad_task_veh = client.post("/api/v1/renewals", headers=headers_b, json={
        "title": "Malicious Task for Alpha Vehicle",
        "due_date": "2026-11-01",
        "vehicle_id": veh_id_a
    })
    assert bad_task_veh.status_code == 404, "Beta was allowed to link Alpha's vehicle to a task!"

    # Beta tries to create a task referencing Alpha's driver
    bad_task_drv = client.post("/api/v1/renewals", headers=headers_b, json={
        "title": "Malicious Task for Alpha Driver",
        "due_date": "2026-11-01",
        "driver_id": drv_id_a
    })
    assert bad_task_drv.status_code == 404, "Beta was allowed to link Alpha's driver to a task!"

    # Beta tries to create a task referencing Alpha's document
    bad_task_doc = client.post("/api/v1/renewals", headers=headers_b, json={
        "title": "Malicious Task for Alpha Document",
        "due_date": "2026-11-01",
        "document_id": doc_id_a
    })
    assert bad_task_doc.status_code == 404, "Beta was allowed to link Alpha's document to a task!"

    # Beta tries to upload a document attached to Alpha's vehicle
    bad_upload = client.post(
        "/api/v1/documents/upload",
        headers=headers_b,
        data={
            "category_code": "PUC",
            "vehicle_id": veh_id_a,
            "document_number": "FAKE-PUC"
        }
    )
    assert bad_upload.status_code == 404, "Beta was allowed to upload a document to Alpha's vehicle!"

    # Beta tries to assign Alpha's driver to Beta's vehicle
    v_b = client.post("/api/v1/vehicles", headers=headers_b, json={
        "registration_number": "PB 02 BB 2222",
        "vehicle_category": "goods_truck",
        "make": "Tata",
        "model": "Prima"
    }).json()
    veh_id_b = v_b["id"]

    bad_assign = client.post(f"/api/v1/vehicles/{veh_id_b}/assign-driver?driver_id={drv_id_a}", headers=headers_b)
    assert bad_assign.status_code == 404, "Beta was allowed to assign Alpha's driver!"

    # 2. File Download Authorization & Isolation
    # Beta tries to download Alpha's document file
    bad_dl = client.get(f"/api/v1/documents/{doc_id_a}/download", headers=headers_b)
    assert bad_dl.status_code == 404, "Beta was allowed to download Alpha's document!"

    # Unauthenticated download attempt without token
    anon_dl = client.get(f"/api/v1/documents/{doc_id_a}/download")
    assert anon_dl.status_code == 401, "Anonymous user was allowed to download private document!"

    # Authorized download with token in query param
    auth_dl_query = client.get(f"/api/v1/documents/{doc_id_a}/download?token={token_a}&workspace_id={ws_id_a}")
    assert auth_dl_query.status_code == 200
    assert auth_dl_query.content == pdf_content

    # 3. File Upload Content & Magic Byte Validation
    # Attempting to upload fake PDF (executable or plain text disguised as PDF)
    fake_pdf = b"This is not a real PDF file at all"
    spoofed_res = client.post(
        "/api/v1/documents/upload",
        headers=headers_a,
        data={"category_code": "PUC", "vehicle_id": veh_id_a},
        files={"file": ("fake.pdf", fake_pdf, "application/pdf")}
    )
    assert spoofed_res.status_code == 400
    assert "File content does not match" in spoofed_res.json()["detail"]

    # Attempting to upload disallowed mime type
    exe_content = b"MZ\x90\x00\x03\x00\x00\x00"
    exe_res = client.post(
        "/api/v1/documents/upload",
        headers=headers_a,
        data={"category_code": "PUC", "vehicle_id": veh_id_a},
        files={"file": ("malware.exe", exe_content, "application/x-msdownload")}
    )
    assert exe_res.status_code == 400
    assert "Unsupported file type" in exe_res.json()["detail"]

    # Genuine PNG upload
    png_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
    png_res = client.post(
        "/api/v1/documents/upload",
        headers=headers_a,
        data={"category_code": "PUC", "vehicle_id": veh_id_a, "document_number": "PUC-PNG-1"},
        files={"file": ("puc.png", png_content, "image/png")}
    )
    assert png_res.status_code == 200

    # Genuine JPEG upload
    jpg_content = b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00"
    jpg_res = client.post(
        "/api/v1/documents/upload",
        headers=headers_a,
        data={"category_code": "FITNESS", "vehicle_id": veh_id_a, "document_number": "FIT-JPG-1"},
        files={"file": ("fitness.jpg", jpg_content, "image/jpeg")}
    )
    assert jpg_res.status_code == 200

