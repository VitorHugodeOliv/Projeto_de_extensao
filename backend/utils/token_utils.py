import jwt
from flask import request, jsonify
from datetime import datetime, timedelta, UTC
from config import settings

SECRET_KEY = settings.SECRET_KEY

def gerar_tokens(usuario):
    payload_access = {
        "id": usuario["id"],
        "nome": usuario["nome"],
        "tipo_usuario": usuario["tipo_usuario"],
        "exp": datetime.now(UTC) + timedelta(minutes=30)
    }

    payload_refresh = {
        "id": usuario["id"],
        "nome": usuario["nome"],  # adicionado
        "tipo_usuario": usuario["tipo_usuario"],  # adicionado
        "type": "refresh",
        "exp": datetime.now(UTC) + timedelta(days=7)
    }


    access_token = jwt.encode(payload_access, SECRET_KEY, algorithm="HS256")
    refresh_token = jwt.encode(payload_refresh, SECRET_KEY, algorithm="HS256")

    return access_token, refresh_token

def validar_token(requer_admin=False):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Token ausente"}), 401, None

    token = auth_header.split(" ")[1]
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        if requer_admin and decoded.get("tipo_usuario") != "admin":
            return jsonify({"message": "Acesso negado"}), 403, None
        return None, 200, decoded
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token expirado"}), 401, None
    except jwt.InvalidTokenError:
        return jsonify({"message": "Token inválido"}), 401, None