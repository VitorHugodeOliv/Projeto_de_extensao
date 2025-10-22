import io
import jwt
import json
from config import settings

SECRET_KEY = settings.SECRET_KEY


def registrar_e_logar_usuario(client):
    email = "upload_tester@example.com"
    senha = "senha123"

    client.post(
        "/register",
        json={
            "nome": "Usuário Upload Teste",
            "email": email,
            "senha": senha,
            "tipo_usuario": "comum",
        },
    )

    response = client.post("/login", json={"email": email, "senha": senha})
    assert response.status_code == 200, f"Falha no login ({response.status_code})"
    token = response.get_json().get("token")
    assert token, "Token não retornado no login"
    return token


def criar_historia_para_teste(client, token):
    """Cria uma história simples no banco e retorna o ID."""
    data = {
        "titulo": "História de teste upload",
        "autor_artista": "Autor Teste",
        "categoria_id": 1,
        "status": "Em análise",
        "conteudo": "Conteúdo de teste",
    }

    response = client.post(
        "/historias",
        headers={"Authorization": f"Bearer {token}"},
        json=data,
    )

    assert response.status_code in (200, 201), f"Erro ao criar história: {response.status_code}"
    return response.get_json().get("id", 1)


def test_upload_imagem_valida(client):
    token = registrar_e_logar_usuario(client)

    historia_id = criar_historia_para_teste(client, token)

    data = {
        "historia_id": str(historia_id),
        "arquivos": (io.BytesIO(b"fake image data"), "imagem.jpg"),
    }

    response = client.post(
        "/upload",
        headers={"Authorization": f"Bearer {token}"},
        data=data,
        content_type="multipart/form-data",
    )

    assert response.status_code in (200, 201), f"Falha no upload: {response.status_code}"
    msg = response.get_json().get("message", "").lower()
    assert "enviados" in msg or "sucesso" in msg
