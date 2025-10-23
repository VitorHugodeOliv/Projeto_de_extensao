import json
import time

def test_registro_usuario(client):
    email_teste = f"teste_{int(time.time())}@example.com"

    data = {
        "nome": "Usuário Teste",
        "email": email_teste,
        "senha": "senha123",
        "tipo_usuario": "comum"
    }

    response = client.post("/register", json=data)
    assert response.status_code in (200, 201)

    json_data = response.get_json()
    msg = json_data.get("message", "").lower()

    assert "access_token" in json_data
    assert "refresh_token" in json_data
    assert "sucesso" in msg or "usuário" in msg

def test_login_usuario(client):
    data = {"email": "teste@example.com", "senha": "senha123"}

    response = client.post("/login", json=data)
    assert response.status_code == 200

    json_data = response.get_json()
    msg = json_data.get("message", "").lower()

    assert "access_token" in json_data
    assert "refresh_token" in json_data
    assert "sucesso" in msg or "login" in msg


def test_registro_usuario_duplicado(client):
    data = {
        "nome": "Usuário Teste Duplicado",
        "email": "teste@example.com",
        "senha": "senha123",
        "tipo_usuario": "comum"
    }

    response = client.post("/register", json=data)
    json_data = response.get_json()

    assert response.status_code in (400, 409)
    assert "usuário já existe" in json_data.get("message", "").lower()
