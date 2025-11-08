import jwt
from flask import Blueprint, request, jsonify
from flask import redirect
from datetime import datetime, timedelta, UTC
from db import conectar
from config import settings
from utils.token_utils import gerar_tokens
from middlewares.limiter_config import limiter
from controllers.controllers import cadastrar_usuario, login_usuario
from controllers.email_controller import processar_confirmacao_cadastro, confirmar_email

auth_bp = Blueprint("auth_bp", __name__)
SECRET_KEY = settings.SECRET_KEY


@auth_bp.route("/register", methods=["POST"])
@limiter.limit("3 per minute")
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

    try:
        email_ok, _ = processar_confirmacao_cadastro(usuario)
        if not email_ok:
            return jsonify({
                "message": "Usuário cadastrado, mas houve erro ao enviar o e-mail de confirmação."
            }), 500
    except Exception as e:
        print(f"❌ Erro ao enviar e-mail de confirmação: {e}")

    return jsonify({
        "message": "Usuário cadastrado com sucesso! Verifique seu e-mail para ativar a conta antes de fazer login."
    }), 201


@auth_bp.route("/confirmar-email/<token>", methods=["GET"])
def confirmar_email_rota(token):
    sucesso, msg = confirmar_email(token)

    if not sucesso:
        return redirect("http://localhost:5173/erro-confirmacao", code=302)

    from db import conectar
    conn = conectar()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Usuarios WHERE conta_ativa = TRUE ORDER BY id DESC LIMIT 1")
    usuario = cursor.fetchone()
    cursor.close()
    conn.close()

    if not usuario:
        return redirect("http://localhost:5173/login", code=302)

    access, refresh = gerar_tokens(usuario)

    url_front = f"http://localhost:5173/confirmado?access={access}&refresh={refresh}"
    return redirect(url_front, code=302)


@auth_bp.route("/login", methods=["POST"])
@limiter.limit("5 per minute")
def login():
    data = request.get_json()
    if not data or "email" not in data or "senha" not in data:
        return jsonify({"message": "Dados incompletos"}), 400

    sucesso, msg, usuario = login_usuario(data["email"], data["senha"])
    if not sucesso:
        return jsonify({"message": msg}), 401

    if not usuario.get("conta_ativa", False):
        return jsonify({"message": "Conta ainda não ativada. Verifique seu e-mail."}), 403

    access, refresh = gerar_tokens(usuario)
    return jsonify({"message": msg, "access_token": access, "refresh_token": refresh}), 200

@auth_bp.route("/resend-confirmation", methods=["POST"])
@limiter.limit("3 per minute")
def resend_confirmation():
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"message": "E-mail não fornecido"}), 400

    conn = conectar()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Usuarios WHERE email = %s", (email,))
    usuario = cursor.fetchone()
    cursor.close()
    conn.close()

    if not usuario:
        return jsonify({"message": "Usuário não encontrado"}), 404

    if usuario.get("conta_ativa"):
        return jsonify({"message": "Conta já está ativa!"}), 400

    sucesso, msg = processar_confirmacao_cadastro(usuario)
    status = 200 if sucesso else 500
    return jsonify({"message": msg}), status


@auth_bp.route("/refresh", methods=["POST"])
@limiter.limit("10 per minute")
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
