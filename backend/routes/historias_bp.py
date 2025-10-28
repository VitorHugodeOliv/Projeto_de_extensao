from flask import Blueprint, jsonify, request
import jwt
from db import conectar
from config import settings

historias_bp = Blueprint("historias", __name__)

SECRET_KEY = settings.SECRET_KEY

@historias_bp.route("/historias", methods=["POST"])
def cadastrar_historia():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Token ausente"}), 401

    token = auth_header.split(" ")[1]
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        proponente_id = decoded["id"]

        data = request.get_json()
        titulo = data.get("titulo")
        subtitulo = data.get("subtitulo")
        autor_artista = data.get("autor_artista")
        categoria_id = data.get("categoria_id")
        status = data.get("status", "Em análise")
        conteudo = data.get("conteudo")

        if not titulo:
            return jsonify({"message": "O campo 'título' é obrigatório."}), 400

        conn = conectar()
        cursor = conn.cursor()
        sql = """
            INSERT INTO Historias (titulo, subtitulo, proponente, autor_artista, categoria_id, status, conteudo)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (titulo, subtitulo, proponente_id, autor_artista, categoria_id, status, conteudo))
        conn.commit()

        historia_id = cursor.lastrowid

        cursor.close()
        conn.close()

        return jsonify({
            "message": "História enviada com sucesso!",
            "id": historia_id
        }), 201

    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token expirado"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Token inválido"}), 401
    except Exception as e:
        print("Erro ao cadastrar história:", e)
        return jsonify({"message": "Erro ao cadastrar história."}), 500

@historias_bp.route("/historias", methods=["GET"])
def listar_historias():
    try:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)

        sql_historias = """
            SELECT 
                h.id,
                h.titulo,
                h.subtitulo,
                h.autor_artista,
                h.status,
                h.conteudo,
                h.categoria_id,
                c.nome AS categoria_nome,
                h.data_criacao,
                h.proponente
            FROM Historias h
            LEFT JOIN Categorias c ON h.categoria_id = c.id
            ORDER BY h.data_criacao DESC
        """
        cursor.execute(sql_historias)
        historias = cursor.fetchall()

        historia_ids = [h["id"] for h in historias]

        arquivos_map = {}
        if historia_ids:
            formato = ",".join(["%s"] * len(historia_ids))
            sql_arquivos = f"""
                SELECT historia_id, tipo, url_armazenamento
                FROM Arquivos
                WHERE historia_id IN ({formato})
            """
            cursor.execute(sql_arquivos, tuple(historia_ids))
            arquivos = cursor.fetchall()

            for arq in arquivos:
                hid = arq["historia_id"]
                if hid not in arquivos_map:
                    arquivos_map[hid] = []
                arquivos_map[hid].append({
                    "tipo": arq["tipo"],
                    "url": arq["url_armazenamento"]
                })

        for h in historias:
            h["arquivos"] = arquivos_map.get(h["id"], [])

        cursor.close()
        conn.close()

        return jsonify(historias), 200

    except Exception as e:
        print("Erro ao buscar histórias:", e)
        return jsonify({"message": "Erro ao buscar histórias."}), 500

@historias_bp.route("/historias/<int:historia_id>/curtir", methods=["POST"])
def curtir_historia(historia_id):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Token ausente"}), 401

    token = auth_header.split(" ")[1]
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        usuario_id = decoded["id"]

        conn = conectar()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM Curtidas WHERE usuario_id = %s AND historia_id = %s",
            (usuario_id, historia_id)
        )
        ja_curtiu = cursor.fetchone()

        if ja_curtiu:
            cursor.execute(
                "DELETE FROM Curtidas WHERE usuario_id = %s AND historia_id = %s",
                (usuario_id, historia_id)
            )
            conn.commit()
            mensagem = "Curtida removida."
        else:
            cursor.execute(
                "INSERT INTO Curtidas (usuario_id, historia_id) VALUES (%s, %s)",
                (usuario_id, historia_id)
            )
            conn.commit()
            mensagem = "História curtida!"

        cursor.close()
        conn.close()

        return jsonify({"message": mensagem}), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token expirado"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Token inválido"}), 401
    except Exception as e:
        print("Erro ao curtir história:", e)
        return jsonify({"message": "Erro ao curtir história."}), 500

@historias_bp.route("/historias/<int:historia_id>/curtidas", methods=["GET"])
def contar_curtidas(historia_id):
    try:
        conn = conectar()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM Curtidas WHERE historia_id=%s", (historia_id,))
        total = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        return jsonify({"total_curtidas": total}), 200
    except Exception as e:
        print("Erro ao contar curtidas:", e)
        return jsonify({"message": "Erro ao contar curtidas."}), 500

@historias_bp.route("/historias/<int:historia_id>/comentarios", methods=["POST"])
def comentar_historia(historia_id):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Token ausente"}), 401

    token = auth_header.split(" ")[1]
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        usuario_id = decoded["id"]

        data = request.get_json()
        texto = data.get("texto")
        if not texto:
            return jsonify({"message": "Comentário vazio."}), 400

        conn = conectar()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO Comentarios (usuario_id, historia_id, texto) VALUES (%s, %s, %s)", (usuario_id, historia_id, texto))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Comentário adicionado com sucesso."}), 201

    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token expirado"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Token inválido"}), 401

@historias_bp.route("/historias/<int:historia_id>/comentarios", methods=["GET"])
def listar_comentarios(historia_id):
    try:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT c.id, c.texto, c.data_criacao, u.nome AS autor
            FROM Comentarios c
            JOIN Usuarios u ON c.usuario_id = u.id
            WHERE c.historia_id = %s
            ORDER BY c.data_criacao DESC
        """, (historia_id,))
        comentarios = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(comentarios), 200
    except Exception as e:
        print("Erro ao listar comentários:", e)
        return jsonify({"message": "Erro ao buscar comentários."}), 500