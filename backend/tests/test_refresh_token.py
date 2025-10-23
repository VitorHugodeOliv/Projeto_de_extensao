import time

def test_refresh_token(client):
    email_teste = f"refresh_{int(time.time())}@example.com"
    data = {
        "nome": "Usuário Refresh",
        "email": email_teste,
        "senha": "senha123",
        "tipo_usuario": "comum"
    }

    res_registro = client.post("/register", json=data)
    assert res_registro.status_code in (200, 201)

    tokens = res_registro.get_json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens

    access_token = tokens["access_token"]
    refresh_token = tokens["refresh_token"]

    res_dash = client.get(
        "/dashboard",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    assert res_dash.status_code == 200
    assert "Bem-vindo" in res_dash.get_json()["message"]

    res_refresh = client.post("/refresh", json={"refresh_token": refresh_token})
    assert res_refresh.status_code == 200

    novo_access_token = res_refresh.get_json().get("access_token")
    assert novo_access_token is not None and isinstance(novo_access_token, str)

    res_dash2 = client.get(
        "/dashboard",
        headers={"Authorization": f"Bearer {novo_access_token}"}
    )
    assert res_dash2.status_code == 200
    assert "Bem-vindo" in res_dash2.get_json()["message"]
