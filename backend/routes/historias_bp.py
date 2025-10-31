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

        token_header = request.headers.get("Authorization")
        user_id = None
        if token_header and token_header.startswith("Bearer "):
            try:
                decoded = jwt.decode(token_header.split(" ")[1], SECRET_KEY, algorithms=["HS256"])
                user_id = decoded.get("id")
            except Exception:
                pass

        curtidas_usuario = []
        if user_id:
            cursor.execute("SELECT historia_id FROM Curtidas WHERE usuario_id = %s", (user_id,))
            curtidas_usuario = [row["historia_id"] for row in cursor.fetchall()]

        for h in historias:
            h["curtido"] = h["id"] in curtidas_usuario

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
    
@historias_bp.route("/usuarios/<int:id_usuario>/historias", methods=["GET"])
def listar_historias_usuario(id_usuario):
    token_header = request.headers.get("Authorization")
    if not token_header or not token_header.startswith("Bearer "):
        return jsonify({"message": "Token não fornecido"}), 401

    token = token_header.split(" ")[1]

    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        usuario_id = decoded.get("id")
        tipo_usuario = decoded.get("tipo_usuario")

        if tipo_usuario != "admin" and usuario_id != id_usuario:
            return jsonify({"message": "Acesso negado"}), 403

        conn = conectar()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                h.id,
                h.titulo,
                h.subtitulo,
                h.status,
                h.data_criacao,
                c.nome AS categoria_nome,
                h.autor_artista
            FROM Historias h
            LEFT JOIN Categorias c ON h.categoria_id = c.id
            WHERE h.proponente = %s
            ORDER BY h.data_criacao DESC
        """, (id_usuario,))

        historias = cursor.fetchall()

        cursor.execute("""
            SELECT 
                COUNT(*) AS total,
                SUM(status = 'Aprovada') AS aprovadas,
                SUM(status = 'Rejeitada') AS rejeitadas,
                SUM(status = 'Em análise') AS em_analise
            FROM Historias
            WHERE proponente = %s
        """, (id_usuario,))
        resumo = cursor.fetchone()

        cursor.close()
        conn.close()

        return jsonify({
            "usuario_id": id_usuario,
            "resumo": resumo,
            "historias": historias
        }), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token expirado"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Token inválido"}), 401
    except Exception as e:
        print("Erro ao listar histórias do usuário:", e)
        return jsonify({"message": "Erro ao buscar histórias do usuário."}), 500

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
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT COUNT(*) AS total FROM Curtidas WHERE historia_id=%s", (historia_id,))
        total = cursor.fetchone()["total"]

        auth_header = request.headers.get("Authorization")
        usuario_curtiu = False
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            usuario_id = decoded["id"]

            cursor.execute(
                "SELECT 1 FROM Curtidas WHERE usuario_id=%s AND historia_id=%s",
                (usuario_id, historia_id)
            )
            usuario_curtiu = cursor.fetchone() is not None

        cursor.close()
        conn.close()

        return jsonify({
            "total_curtidas": total,
            "usuario_curtiu": usuario_curtiu
        }), 200

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