"""通过真实 HTTP 接口和 PostgreSQL 验证用户能观察到的行为。"""

import pytest


def test_health_checks_database(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "connected"}


def test_note_lifecycle(client):
    response = client.post(
        "/api/notes", json={"title": "  理解事务  ", "content": "commit 提交修改"}
    )
    assert response.status_code == 201
    note = response.json()
    assert note["title"] == "理解事务"
    assert note["created_at"]
    note_id = note["id"]

    assert client.get(f"/api/notes/{note_id}").json()["content"] == "commit 提交修改"
    page = client.get("/api/notes").json()
    assert page["total"] == 1
    assert page["items"][0]["id"] == note_id

    response = client.put(
        f"/api/notes/{note_id}", json={"title": "理解回滚", "content": "rollback 撤销修改"}
    )
    assert response.status_code == 200
    assert client.get(f"/api/notes/{note_id}").json()["title"] == "理解回滚"

    response = client.delete(f"/api/notes/{note_id}")
    assert response.status_code == 204
    assert response.content == b""
    assert client.get(f"/api/notes/{note_id}").status_code == 404
    assert client.get("/api/notes").json()["total"] == 0


@pytest.mark.parametrize("title", ["", "   ", "字" * 101])
def test_invalid_title_is_not_saved(client, title):
    response = client.post("/api/notes", json={"title": title, "content": "测试"})
    assert response.status_code == 422
    assert client.get("/api/notes").json()["total"] == 0


def test_invalid_content_and_unknown_fields_are_rejected(client):
    assert (
        client.post("/api/notes", json={"title": "测试", "content": "字" * 10001}).status_code
        == 422
    )
    assert client.post("/api/notes", json={"title": "测试", "id": 123}).status_code == 422


def test_missing_note_returns_404(client):
    assert client.get("/api/notes/999999").status_code == 404
    assert client.put("/api/notes/999999", json={"title": "不存在"}).status_code == 404
    assert client.delete("/api/notes/999999").status_code == 404


def test_pagination_and_bounds(client):
    first = client.post("/api/notes", json={"title": "第一条"}).json()
    second = client.post("/api/notes", json={"title": "第二条"}).json()
    page = client.get("/api/notes?limit=1&offset=0").json()
    assert page["total"] == 2
    assert page["items"][0]["id"] == second["id"]
    assert client.get("/api/notes?limit=1&offset=1").json()["items"][0]["id"] == first["id"]
    for query in ["limit=0", "limit=101", "offset=-1"]:
        assert client.get(f"/api/notes?{query}").status_code == 422
