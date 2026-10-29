def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "Spark Radar API"

def test_reference_data(client):
    response = client.get("/api/v1/reference-data")
    assert response.status_code == 200
    data = response.json()
    assert "vehicle_categories" in data
    assert "document_categories" in data
    assert "indian_states" in data
    assert len(data["vehicle_categories"]) > 0
