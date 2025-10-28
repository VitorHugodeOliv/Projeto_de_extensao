from flask import Blueprint, jsonify, request
import jwt
from db import conectar
from config import settings

SECRET_KEY = settings.SECRET_KEY

admin_bp = Blueprint("admin_bp", __name__)

def verificar_admin(token: str):
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        if decoded.get("tipo_usuario") != "admin":
            return None
        return decoded
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

@admin_bp.route("/admin/solicitacoes", methods=["GET"])
def listar_solicitacoes():
    token_header = request.headers.get("Authorization")

    if not token_header or not token_header.startswith("Bearer "):
        return jsonify({"message": "Token não fornecido"}), 401

    token = token_header.split(" ")[1]
    usuario = verificar_admin(token)

    if not usuario:
        return jsonify({"message": "Acesso negado: apenas administradores podem acessar esta rota."}), 403

    conn = conectar()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT 
            h.id,
            h.titulo,
            h.subtitulo,
            h.autor_artista,
            h.conteudo,
            h.status,
            h.data_criacao,
            c.nome AS categoria_nome,
            u.nome AS nome_usuario,
            a.id AS arquivo_id,
            a.nome_arquivo,
            a.tipo AS tipo_arquivo,
            a.url_armazenamento AS caminho_arquivo,
            a.tamanho
        FROM Historias h
        JOIN Categorias c ON h.categoria_id = c.id
        JOIN Usuarios u ON h.proponente = u.id
        LEFT JOIN Arquivos a ON h.id = a.historia_id
        ORDER BY h.data_criacao DESC
    """)
    
    registros = cursor.fetchall()
    historias = {}
    for row in registros:
        h_id = row["id"]
        if h_id not in historias:
            historias[h_id] = {
                "id": h_id,
                "titulo": row["titulo"],
                "subtitulo": row.get("subtitulo"),
                "autor_artista": row["autor_artista"],
                "conteudo": row["conteudo"],
                "status": row["status"],
                "data_criacao": row["data_criacao"],
                "categoria_nome": row["categoria_nome"],
                "nome_usuario": row["nome_usuario"],
                "arquivos": [],
            }
        if row["arquivo_id"]:
            historias[h_id]["arquivos"].append({
                "id": row["arquivo_id"],
                "nome": row["nome_arquivo"],
                "tipo": row["tipo_arquivo"],
                "caminho": row["caminho_arquivo"],
                "tamanho": row["tamanho"],
            })

    cursor.close()
    conn.close()

    return jsonify({
        "message": "Solicitações recuperadas com sucesso.",
        "total": len(historias),
        "historias": list(historias.values())
    }), 200

@admin_bp.route("/admin/solicitacoes/aprovar", methods=["PATCH"])
def aprovar_solicitacao():
    token_header = request.headers.get("Authorization")

    if not token_header or not token_header.startswith("Bearer "):
        return jsonify({"message": "Token não fornecido"}), 401

    token = token_header.split(" ")[1]
    usuario = verificar_admin(token)

    if not usuario:
        return jsonify({"message": "Acesso negado: apenas administradores podem acessar esta rota."}), 403

    historia_id = request.json.get("historia_id")
    if not historia_id:
        return jsonify({"message": "ID da história não informado"}), 400

    conn = conectar()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM Historias WHERE id = %s", (historia_id,))
    historia = cursor.fetchone()
    if not historia:
        cursor.close()
        conn.close()
        return jsonify({"message": "História não encontrada"}), 404

    cursor.execute("UPDATE Historias SET status = 'Aprovada' WHERE id = %s", (historia_id,))
    cursor.execute("""
        INSERT INTO LogsAdmin (admin_id, historia_id, acao)
        VALUES (%s, %s, %s)
    """, (usuario["id"], historia_id, "Aprovou"))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": f"História ID {historia_id} aprovada e log registrada."}), 200

@admin_bp.route("/admin/solicitacoes/rejeitar", methods=["DELETE"])
def rejeitar_solicitacao():
    token_header = request.headers.get("Authorization")

    if not token_header or not token_header.startswith("Bearer "):
        return jsonify({"message": "Token não fornecido"}), 401

    token = token_header.split(" ")[1]
    usuario = verificar_admin(token)

    if not usuario:
        return jsonify({"message": "Acesso negado: apenas administradores podem acessar esta rota."}), 403

    historia_id = request.args.get("historia_id") or request.json.get("historia_id")
    if not historia_id:
        return jsonify({"message": "ID da história não informado"}), 400

    conn = conectar()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM Historias WHERE id = %s", (historia_id,))
    historia = cursor.fetchone()
    if not historia:
        cursor.close()
        conn.close()
        return jsonify({"message": "História não encontrada"}), 404

    cursor.execute("DELETE FROM Arquivos WHERE historia_id = %s", (historia_id,))
    
    cursor.execute("""
        INSERT INTO LogsAdmin (admin_id, historia_id, acao)
        VALUES (%s, %s, %s)
    """, (usuario["id"], historia_id, "Rejeitou"))

    cursor.execute("DELETE FROM Historias WHERE id = %s", (historia_id,))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": f"História ID {historia_id} rejeitada e log registrada."}), 200

