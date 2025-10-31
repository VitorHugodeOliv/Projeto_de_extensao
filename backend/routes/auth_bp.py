import jwt
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta, UTC
from config import settings
from utils.token_utils import gerar_tokens
from controllers.controllers import cadastrar_usuario, login_usuario

auth_bp = Blueprint("auth_bp", __name__)
SECRET_KEY = settings.SECRET_KEY

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    campos_obrigatorios = ["nome", "email", "senha"]
    if not data or not all(campo in data for campo in campos_obrigatorios):
        return jsonify({"message": "Dados incompletos"}), 400

    sucesso, msg, usuario = cadastrar_usuario(
        data["nome"],
        data["email"],
        data["senha"],
        data.get("tipo_usuario", "usuario"),
        data.get("endereco"),
        data.get("idade"),
        data.get("apelido"),
        data.get("area_artistica"),
    )

    if not sucesso:
        return jsonify({"message": msg}), 400

    access, refresh = gerar_tokens(usuario)
    return jsonify({"message": msg, "access_token": access, "refresh_token": refresh}), 200

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or "email" not in data or "senha" not in data:
        return jsonify({"message": "Dados incompletos"}), 400

    sucesso, msg, usuario = login_usuario(data["email"], data["senha"])
    if not sucesso:
        return jsonify({"message": msg}), 401

    access, refresh = gerar_tokens(usuario)
    return jsonify({"message": msg, "access_token": access, "refresh_token": refresh}), 200


@auth_bp.route("/refresh", methods=["POST"])
def refresh_token():
    data = request.get_json()
    token = data.get("refresh_token")

    if not token:
        return jsonify({"message": "Token não fornecido"}), 401

    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        if decoded.get("type") != "refresh":
            return jsonify({"message": "Token inválido"}), 401

        novo_access = jwt.encode({
            "id": decoded["id"],
            "nome": decoded.get("nome"),
            "tipo_usuario": decoded.get("tipo_usuario", "usuario"),
            "exp": datetime.now(UTC) + timedelta(minutes=30)
        }, SECRET_KEY, algorithm="HS256")

        return jsonify({"access_token": novo_access}), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Refresh token expirado, faça login novamente"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Token inválido"}), 401
