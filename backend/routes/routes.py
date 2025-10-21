from flask import Flask, request, jsonify
from flask_cors import CORS
from db import conectar
from models.usuario_models import atualizar_usuario, buscar_usuario_por_id
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
    

@app.route("/historias", methods=["POST"])
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
        autor_artista = data.get("autor_artista")
        categoria_id = data.get("categoria_id")
        status = data.get("status", "Em análise")
        conteudo = data.get("conteudo")

        if not titulo:
            return jsonify({"message": "O campo 'título' é obrigatório."}), 400

        # inserir no banco
        conn = conectar()
        cursor = conn.cursor()
        sql = """
            INSERT INTO Historias (titulo, proponente, autor_artista, categoria_id, status, conteudo)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (titulo, proponente_id, autor_artista, categoria_id, status, conteudo))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "História enviada com sucesso!"}), 201

    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token expirado"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Token inválido"}), 401
    except Exception as e:
        print("Erro ao cadastrar história:", e)
        return jsonify({"message": "Erro ao cadastrar história."}), 500
    
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

if __name__ == "__main__":
    app.run(debug=True)