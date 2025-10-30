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
                "subtitulo": "Projeto criado com ajuda da Lei Paulo Gustavo",
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
                    "uploads/imagens (4).png",
                    "uploads/imagens (5).png",
                    "uploads/imagens (14).png",
                    "uploads/imagens (15).png",
                    "uploads/imagens (21).jpeg",
                ]
            },
            {
                "titulo": "Espetáculo:  Nossos Forros",
                "subtitulo": "Projeto criado com ajuda da Lei Paulo Gustavo",
                "proponente": 1,
                "autor_artista": "Jassandra Helena, Roberto Vitor",
                "categoria": "Teatro",
                "status": "Aprovada",
                "conteudo": (
                    "Nossos Forros é um espetáculo cênico-musical que celebra a história, a diversidade e a afetividade do forró nordestino, unindo teatro, dança e música em uma narrativa leve, popular e interativa."
                    "Ambientado em um bar fictício, o enredo inicia-se com um grupo de amigos discutindo quais artistas e estilos de forró deveriam tocar no local, desencadeando uma viagem no tempo e na memória cultural."
                    "Sob a condução da personagem Jassandra, dona do estabelecimento, o público é transportado desde o forró tradicional das décadas de 1950 — com sanfoneiro, zabumba e triângulo — "
                    "até as sonoridades contemporâneas que misturam o autêntico pé-de-serra com o forró eletrônico e o brega-romântico."
                    "Ao longo das cenas, o espetáculo costura humor, crítica social e nostalgia através de diálogos espontâneos e coreografias que homenageiam ícones como Luiz Gonzaga, Flávio José, Dorgival Dantas, Mastruz com Leite, Aviões do Forró, Calcinha Preta, Saia Rodada e tantos outros."
                    "Cada quadro musical é construído como um retrato vivo da cultura popular, alternando momentos de dança, dramatizações e performances ao vivo."
                ),
                "imagens": [
                    "uploads/image (9).png",
                    "uploads/image (18).png",
                    "uploads/image (19).png"
                ]
            },
            {
                "titulo": "A Mulher Cavalo",
                "subtitulo": "Projeto criado com ajuda da Lei Paulo Gustavo",
                "proponente": 1,
                "autor_artista": "Vitor Hugo, Jassandra Helena, Roberto Vitor",
                "categoria": "Audiovisual",
                "status": "Aprovada",
                "conteudo": (
                    "A Mulher Cavalo é um curta-metragem de terror psicológico ambientado no Nordeste brasileiro, onde um grupo de amigos decide passar um fim de semana em uma casa isolada."
                    "O filme inicia em tom leve e cotidiano. O roteiro constrói gradualmente a atmosfera de medo por meio de pequenas anormalidades: barulhos do lado de fora, sensações de ser observado"
                    "A narrativa avança para o caos quando os personagens decidem pregar uma peça em um dos amigos, mas a brincadeira toma um rumo trágico."
                    "Um dos integrantes, Emanuel, desaparece misteriosamente e seu corpo é encontrado pendurado em uma árvore. A partir desse momento, o grupo mergulha em desespero: o pânico, a desconfiança e a falta de comunicação com o mundo exterior tornam o ambiente claustrofóbico e paranoico."
                ),
                "imagens": [
                    "uploads/imagens (22).jpg",
                    "uploads/imagens (11).png",
                    "uploads/imagens (17).png",
                    "uploads/imagens (23).jpg",
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
