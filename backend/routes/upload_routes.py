from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
import jwt
from db import conectar
from config import settings

SECRET_KEY = settings.SECRET_KEY
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "mp4", "mp3", "wav"}

upload_bp = Blueprint("upload_bp", __name__)

def allowed_file(filename: str):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route("/upload", methods=["POST"])
def upload_arquivo():
    token = request.headers.get("Authorization")
    if not token or not token.startswith("Bearer "):
        return jsonify({"message": "Token não fornecido"}), 401

    token = token.split(" ")[1]

    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        usuario_id = decoded["id"]
        tipo_usuario = decoded.get("tipo_usuario", "comum")
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Token expirado"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"message": "Token inválido"}), 401


    if "arquivos" not in request.files:
        return jsonify({"message": "Nenhum arquivo enviado"}), 400

    arquivos = request.files.getlist("arquivos")
    historia_id = request.form.get("historia_id")

    if not historia_id:
        return jsonify({"message": "ID da história não encontrado"}), 400
    
    qtd_imagens = 0
    qtd_videos = 0
    qtd_audios = 0

    arquivos_enviados = []

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    conn = conectar()
    cursor = conn.cursor()

    for arquivo in arquivos:
        if arquivo.filename == "":
            continue
        if allowed_file(arquivo.filename):
            filename = secure_filename(arquivo.filename)
            caminho = os.path.join(UPLOAD_FOLDER, filename)
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            arquivo.save(caminho)

            tipo_arquivo = arquivo.filename.rsplit(".", 1)[1].lower()

            cursor.execute("""
                INSERT INTO Arquivos (tipo, url_armazenamento, historia_id)
                VALUES (%s, %s, %s)
            """, (tipo_arquivo, caminho, historia_id))
            arquivos_enviados.append(filename)
        else:
            print(f"Tipo de arquivo não permitido: {arquivo.filename}")

    conn.commit()
    cursor.close()
    conn.close()

    print("=== [UPLOAD LOG] ===")
    print(f"Usuário ID: {usuario_id}, Tipo: {tipo_usuario}")
    print(f"História ID: {historia_id}")
    print(f"Arquivos enviados: {arquivos_enviados}")
    print("====================")

    if not arquivos_enviados:
        return jsonify({"message": "Nenhum arquivo válido enviado"}), 400

    return jsonify({
        "message": f"Arquivos enviados com sucesso: {arquivos_enviados}",
        "user_id": usuario_id,
        "tipo_usuario": tipo_usuario
    }), 201


@upload_bp.route("/upload/teste", methods=["POST"])
def teste_upload():
    print("=== [TESTE DE UPLOAD] ===")

    if 'arquivos' not in request.files:
        print("Nenhum arquivo recebido!")
        return jsonify({"erro": "Nenhum arquivo encontrado em 'arquivos'"}), 400

    arquivos = request.files.getlist("arquivos")
    historia_id = request.form.get("historia_id")
    print(f"Total de arquivos recebidos: {len(arquivos)}")
    print(f"historia_id recebido: {historia_id}")

    token = request.headers.get("Authorization")
    if token:
        print(f"Token recebido: {token[:30]}...")
    else:
        print("Nenhum token recebido no cabeçalho!")

    for i, arquivo in enumerate(arquivos):
        print(f"Arquivo {i+1}: {arquivo.filename} ({arquivo.content_type})")

    print("===========================")

    return jsonify({
        "mensagem": "Teste de upload recebido com sucesso!",
        "quantidade_arquivos": len(arquivos),
        "historia_id": historia_id
    }), 200
