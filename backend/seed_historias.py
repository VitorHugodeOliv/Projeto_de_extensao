# seed_historias.py
import mysql.connector
from db import db_config

def inserir_historias_iniciais():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        historias_iniciais = [
            {
                "titulo": "A Nossa Comédia Dell’Arte",
                "subtitulo": "Projeto criado com Ajuda da Lei Paulo Gustavo",
                "proponente": 1,
                "autor_artista": "Vitor Hugo, Roberto Vitor, Jassandra Helena",
                "categoria": "Teatro",
                "status": "Aprovada",
                "conteudo": (
                    "A Nossa Comédia Dell’Arte é uma montagem teatral autoral inspirada na tradição italiana da Commedia dell’Arte,"
                    "adaptada à realidade brasileira e nordestina. O espetáculo, escrito e dirigido por Roberto Vitor, com produção executiva de Vitor Hugo e Jassandra Helena, resgata arquétipos clássicos como Pantalone, Arlecchino, Colombina e Capitano,"
                    "inserindo-os em uma narrativa contemporânea que combina humor popular, crítica social e poesia."
                    "A trama acompanha a jovem Colombina, filha do rígido senhor Pantalone, que tenta impor-lhe um casamento arranjado com o pomposo Capitano."
                    "O conflito se intensifica com a chegada da trupe de artistas mambembes “Trupe ao Vento”, cujo integrante Arlecchino desperta em Colombina o desejo de liberdade e amor verdadeiro. "
                    "O texto explora, por meio de diálogos ágeis e linguagem poética, temas como o amor como força de emancipação, a opressão patriarcal, a autonomia feminina e a arte como expressão de resistência. "
                    "A encenação valoriza elementos da cultura popular, mesclando música ao vivo, poesia clássica (Shakespeare, Camões, Drummond) e canções da MPB (Oswaldo Montenegro, Hermes Aquino, Geraldo Vandré), em uma composição estética que une o cômico e o lírico. "
                    "Com figurinos coloridos, máscaras leves e cenografia simples e simbólica, a peça prioriza o corpo do ator e a interação direta com o público, reafirmando o caráter coletivo e itinerante do teatro popular."
                    "O desfecho celebra o triunfo do amor e da liberdade sobre a rigidez das convenções sociais, transformando a história em uma metáfora sobre a importância da arte e da sensibilidade na construção de uma sociedade mais humana e afetiva."
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
