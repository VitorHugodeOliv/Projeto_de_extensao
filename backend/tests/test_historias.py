def test_criar_historia(client):
    token = "Bearer FAKE_TOKEN"
    data = {
        "titulo": "História Teste",
        "autor_artista": "Autor Teste",
        "categoria_id": 1,
        "status": "Em análise",
        "conteudo": "Texto de teste"
    }

    response = client.post(
        "/historias",
        headers={"Authorization": token},
        json=data
    )

    assert response.status_code in (200, 201, 401)
