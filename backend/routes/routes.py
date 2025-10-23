import jwt
from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.token_utils import validar_token
from db import conectar
from models.usuario_models import atualizar_usuario, buscar_usuario_por_id
from config import settings
from routes.upload_routes import upload_bp
from routes.admin_bp import admin_bp
from routes.auth_bp import auth_bp

app = Flask(__name__)
CORS(app)

SECRET_KEY = settings.SECRET_KEY

# TESTANDO BLUEPRINTS
# SE FUNCIONAR
# TROCAR TODAS AS ROTAS PARA ESSE PADRÃO

app.register_blueprint(upload_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(auth_bp)

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

        conn = conectar()
        cursor = conn.cursor()
        sql = """
            INSERT INTO Historias (titulo, proponente, autor_artista, categoria_id, status, conteudo)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (titulo, proponente_id, autor_artista, categoria_id, status, conteudo))
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