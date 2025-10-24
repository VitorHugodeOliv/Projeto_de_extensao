# seed_historias.py
import mysql.connector
from db import db_config

def inserir_historias_iniciais():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        historias_iniciais = [
            {
                "titulo": "O Som do Sertão",
                "subtitulo": "Uma lembrança das festas de vaquejada",
                "proponente": 1,
                "autor_artista": "Zé do Acordeon",
                "categoria": "Audiovisual",
                "status": "Aprovada",
                "conteudo": (
                    "Entre risos, poeira e aboios, o som do sertão ecoava pelas madrugadas de Baraúna. "
                    "A sanfona, o triângulo e o pandeiro embalavam histórias de amor, fé e coragem."
                ),
                "imagens": [
                    "uploads/imagens (1).png",
                    "uploads/imagens (2).png",
                ]
            },
            {
                "titulo": "O Espetáculo da Praça",
                "subtitulo": "O teatro popular que encantava Baraúna",
                "proponente": 1,
                "autor_artista": "Grupo Raízes",
                "categoria": "Teatro",
                "status": "Aprovada",
                "conteudo": (
                    "Durante anos, o coreto da praça serviu de palco para o grupo Raízes, "
                    "que trazia alegria e reflexão por meio do teatro de rua."
                ),
                "imagens": [
                    "uploads/imagens (20).png",
                ]
            },
            {
                "titulo": "O Passo da Tradição",
                "subtitulo": "A dança que atravessou gerações",
                "proponente": 1,
                "autor_artista": "Mestre Chico",
                "categoria": "Dança",
                "status": "Aprovada",
                "conteudo": (
                    "Mestre Chico ensinava que a dança era mais do que movimento: "
                    "era a forma de manter viva a história e o orgulho do povo nordestino."
                ),
                "imagens": [
                    "uploads/imagens (15).png",
                    "uploads/imagens (18).png",
                ]
            },
        ]

        for historia in historias_iniciais:
            cursor.execute("SELECT id FROM Categorias WHERE nome = %s", (historia["categoria"],))
            categoria = cursor.fetchone()

            if not categoria:
                print(f"⚠️ Categoria '{historia['categoria']}' não encontrada. História ignorada.")
                continue

            categoria_id = categoria[0]

            cursor.execute("""
                INSERT INTO Historias (titulo, subtitulo, proponente, autor_artista, categoria_id, status, conteudo)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                historia["titulo"],
                historia["subtitulo"],
                historia["proponente"],
                historia["autor_artista"],
                categoria_id,
                historia["status"],
                historia["conteudo"]
            ))

            historia_id = cursor.lastrowid

            for caminho in historia["imagens"]:
                tipo = caminho.split(".")[-1].lower()
                cursor.execute("""
                    INSERT INTO Arquivos (tipo, url_armazenamento, historia_id)
                    VALUES (%s, %s, %s)
                """, (tipo, caminho, historia_id))

            print(f"📖 História '{historia['titulo']}' inserida com {len(historia['imagens'])} imagem(ns).")

        conn.commit()
        print("✅ Histórias iniciais e imagens vinculadas com sucesso!")

    except mysql.connector.Error as err:
        print(f"Erro ao inserir histórias: {err}")
    finally:
        cursor.close()
        conn.close()
