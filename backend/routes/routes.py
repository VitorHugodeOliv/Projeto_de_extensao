from flask import Flask, request, jsonify
from flask_cors import CORS
from controllers.controllers import cadastrar_usuario, login_usuario
import jwt
from config import settings

app = Flask(__name__)
CORS(app)

SECRET_KEY = settings.SECRET_KEY

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    campos_obrigatorios = ["nome", "email", "senha"]
    if not data or not all(campo in data for campo in campos_obrigatorios):
        return jsonify({"message": "Dados incompletos"}), 400

    nome = data["nome"]
    email = data["email"]
    senha = data["senha"]
    tipo_usuario = data.get("tipo_usuario", "usuario")
    endereco = data.get("endereco")
    idade = data.get("idade")
    apelido = data.get("apelido")
    area_artistica = data.get("area_artistica")

    sucesso, msg, token = cadastrar_usuario(
        nome, email, senha, tipo_usuario, endereco, idade, apelido, area_artistica
    )

    status_code = 200 if sucesso else 400
    return jsonify({"message": msg, "token": token}), status_code

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or "email" not in data or "senha" not in data:
        return jsonify({"message": "Dados incompletos"}), 400

    sucesso, msg, token = login_usuario(data["email"], data["senha"])
    status_code = 200 if sucesso else 401
    return jsonify({"message": msg, "token": token}), status_code

@app.route("/dashboard", methods=["GET"])
def dashboard():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Token ausente"}), 401

    token = auth_header.split(" ")[1]

    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return jsonify({
            "message": f"Bem-vindo ao dashboard, {decoded['nome']}!",
            "user_id": decoded["id"],
            "tipo_usuario": decoded["tipo_usuario"]
        }), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token expirado"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Token inválido"}), 401

if __name__ == "__main__":
    app.run(debug=True)