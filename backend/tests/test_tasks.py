from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app


def register_and_login(client: TestClient, username: str, email: str) -> None:
    registration = client.post(
        "/register",
        json={
            "username": username,
            "email": email,
            "password": "tasks-pass-123",
        },
    )
    assert registration.status_code == 201
    login = client.post(
        "/token",
        data={"username": username, "password": "tasks-pass-123"},
    )
    assert login.status_code == 200


def test_tasks_are_authenticated_and_scoped_to_the_current_user() -> None:
    suffix = uuid4().hex[:12]
    first_username = f"task_a_{suffix}"
    second_username = f"task_b_{suffix}"

    with TestClient(app) as first_client, TestClient(app) as second_client:
        unauthenticated = first_client.get("/tasks")
        assert unauthenticated.status_code == 401

        register_and_login(
            first_client, first_username, f"{first_username}@example.com"
        )
        register_and_login(
            second_client, second_username, f"{second_username}@example.com"
        )

        created = first_client.post(
            "/tasks",
            json={
                "title": "My private task",
                "description": "Only my account should see this.",
            },
        )
        assert created.status_code == 201
        task_id = created.json()["id"]

        first_tasks = first_client.get("/tasks")
        second_tasks = second_client.get("/tasks")
        foreign_update = second_client.patch(
            f"/tasks/{task_id}", json={"status": "completed"}
        )
        foreign_delete = second_client.delete(f"/tasks/{task_id}")
        own_update = first_client.patch(
            f"/tasks/{task_id}",
            json={
                "title": "Updated private task",
                "description": "Updated task details.",
                "status": "completed",
            },
        )
        updated_tasks = first_client.get("/tasks")
        own_delete = first_client.delete(f"/tasks/{task_id}")

    assert first_tasks.status_code == 200
    assert [task["title"] for task in first_tasks.json()] == ["My private task"]
    assert first_tasks.headers["cache-control"] == "no-store"
    assert second_tasks.status_code == 200
    assert second_tasks.json() == []
    assert foreign_update.status_code == 404
    assert foreign_delete.status_code == 404
    assert own_update.status_code == 200
    assert own_update.json()["status"] == "completed"
    assert own_update.json()["title"] == "Updated private task"
    assert own_update.json()["description"] == "Updated task details."
    assert updated_tasks.json()[0]["title"] == "Updated private task"
    assert updated_tasks.json()[0]["description"] == "Updated task details."
    assert own_delete.status_code == 204
