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

@admin_bp.route("/admin/solicitacoes", methods=["GET", "PATCH", "DELETE"])
def gerenciar_solicitacoes():
    token_header = request.headers.get("Authorization")

    if not token_header or not token_header.startswith("Bearer "):
        return jsonify({"message": "Token não fornecido"}), 401

    token = token_header.split(" ")[1]
    usuario = verificar_admin(token)

    if not usuario:
        return jsonify({"message": "Acesso negado: apenas administradores podem acessar esta rota."}), 403

    conn = conectar()
    cursor = conn.cursor(dictionary=True)

    if request.method == "GET":
        cursor.execute("""
            SELECT 
                h.id,
                h.titulo,
                h.autor_artista,
                h.status,
                h.conteudo,
                h.data_criacao,
                c.nome AS categoria_nome,
                u.nome AS nome_usuario
            FROM Historias h
            JOIN Categorias c ON h.categoria_id = c.id
            JOIN Usuarios u ON h.proponente = u.id
            ORDER BY h.data_criacao DESC
        """)
        historias = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify({
            "message": "Solicitações recuperadas com sucesso.",
            "total": len(historias),
            "historias": historias
        }), 200

    if request.method == "PATCH":
        historia_id = request.json.get("historia_id")
        if not historia_id:
            return jsonify({"message": "ID da história não informado"}), 400

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

    if request.method == "DELETE":
        historia_id = request.args.get("historia_id") or request.json.get("historia_id")
        if not historia_id:
            return jsonify({"message": "ID da história não informado"}), 400

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
