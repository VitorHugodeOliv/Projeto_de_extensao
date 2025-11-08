import os
import jwt
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_limiter.util import get_remote_address
from middlewares.limiter_config import limiter
from utils.email_utils import mail
import logging
from logging.handlers import RotatingFileHandler
from utils.token_utils import validar_token
from db import conectar
from models.models import atualizar_usuario, buscar_usuario_por_id
from config import settings
from routes.upload_routes import upload_bp
from routes.admin_bp import admin_bp
from routes.auth_bp import auth_bp
from routes.historias_bp import historias_bp
from middlewares.error_handler import register_error_handlers

app = Flask(__name__)
CORS(app)

limiter.init_app(app)

if not os.path.exists("logs"):
    os.makedirs("logs")

log_handler = RotatingFileHandler(
    "logs/app.log", maxBytes=5_000_000, backupCount=3, encoding="utf-8"
)
log_formatter = logging.Formatter(
    "%(asctime)s [%(levelname)s] %(message)s in %(pathname)s:%(lineno)d"
)
log_handler.setFormatter(log_formatter)
log_handler.setLevel(logging.ERROR)

app.logger.addHandler(log_handler)
app.logger.setLevel(logging.ERROR)

app.config["MAIL_SERVER"] = settings.MAIL_SERVER
app.config["MAIL_PORT"] = settings.MAIL_PORT
app.config["MAIL_USE_TLS"] = settings.MAIL_USE_TLS
app.config["MAIL_USE_SSL"] = settings.MAIL_USE_SSL
app.config["MAIL_USERNAME"] = settings.MAIL_USERNAME
app.config["MAIL_PASSWORD"] = settings.MAIL_PASSWORD
app.config["MAIL_DEFAULT_SENDER"] = settings.MAIL_DEFAULT_SENDER

mail.init_app(app)

SECRET_KEY = settings.SECRET_KEY

UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")

app.register_blueprint(upload_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(historias_bp)

register_error_handlers(app)

@app.before_request
def log_requisicoes():
    print(f"\n🔍 [LOG REQUEST] Método: {request.method} | Rota: {request.path}")
    print(f"Headers: {dict(request.headers)}")
    if request.method in ["POST", "PUT", "PATCH"]:
        try:
            print(f"Corpo da requisição: {request.get_json()}")
        except Exception:
            print("Corpo da requisição: (não JSON ou vazio)")
    print("-" * 80)

@app.route("/dashboard", methods=["GET"])
def dashboard():
    resposta, status, decoded = validar_token()
    if not decoded:
        return resposta, status
    return jsonify({
        "message": f"Bem-vindo ao dashboard, {decoded['nome']}!",
        "user_id": decoded["id"],
        "tipo_usuario": decoded["tipo_usuario"]
    }), 200
    

@app.route("/perfil", methods=["GET", "PUT"])
def perfil():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Token ausente"}), 401

    token = auth_header.split(" ")[1]

    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = decoded["id"]

        if request.method == "GET":
            usuario = buscar_usuario_por_id(user_id)
            if not usuario:
                return jsonify({"message": "Usuário não encontrado"}), 404
            return jsonify(usuario), 200
        
        if request.method == "GET":
            usuario = buscar_usuario_por_id(1)
            if not usuario:
                return jsonify({"message": "O usuário admin não pode ser alterado."}), 404
            return jsonify(usuario), 200

        elif request.method == "PUT":
            data = request.get_json()
            sucesso = atualizar_usuario(user_id, data)
            if sucesso:
                return jsonify({"message": "Perfil atualizado com sucesso!"}), 200
            else:
                return jsonify({"message": "Erro ao atualizar perfil"}), 400

    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token expirado"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Token inválido"}), 401
    

@app.route("/uploads/<path:filename>")
def servir_arquivos(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)
    
@app.route("/categorias", methods=["GET"])
def listar_categorias():
    try:
        conexao = conectar()
        cursor = conexao.cursor(dictionary=True)
        cursor.execute("SELECT id, nome FROM Categorias")
        categorias = cursor.fetchall()
        cursor.close()
        conexao.close()
        return jsonify(categorias)
    except Exception as e:
        return jsonify({"erro": str(e)}), 500
    
@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({
        "status": "error",
        "message": "Limite de requisições excedido. Tente novamente mais tarde.",
        "details": str(e.description)
    }), 429

if __name__ == "__main__":
    app.run(debug=True)