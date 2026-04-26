import os
import tempfile
from fastapi.testclient import TestClient


def build_client():
    fd, db_file = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    os.environ["DATABASE_URL"] = f"sqlite:///{db_file}"

    from app.main import app

    return TestClient(app), db_file


def test_signup_login_and_expense_idempotency():
    client, db_file = build_client()

    signup = client.post(
        "/auth/signup",
        json={"email": "john@example.com", "full_name": "John", "password": "strongpass1"},
    )
    assert signup.status_code == 201
    token = signup.json()["access_token"]

    payload = {
        "amount": "100.50",
        "category": "Food",
        "description": "Dinner",
        "date": "2026-01-01",
    }

    headers = {"Authorization": f"Bearer {token}", "Idempotency-Key": "abc123"}

    first = client.post("/expenses", json=payload, headers=headers)
    second = client.post("/expenses", json=payload, headers=headers)

    assert first.status_code == 201
    assert second.status_code == 201
    assert first.json()["id"] == second.json()["id"]

    listing = client.get("/expenses?sort=date_desc", headers={"Authorization": f"Bearer {token}"})
    assert listing.status_code == 200
    data = listing.json()
    assert data["total"] == "100.50"
    assert len(data["expenses"]) == 1

    os.remove(db_file)
