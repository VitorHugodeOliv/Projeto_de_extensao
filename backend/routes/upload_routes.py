import os
import jwt
from flask import Blueprint, request, jsonify
from db import conectar
from config import settings
from werkzeug.utils import secure_filename

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
        return jsonify({"message": "É necessário informar o ID da história"}), 400

    qtd_imagens, qtd_videos, qtd_audios = 0, 0, 0
    arquivos_enviados = []

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    conn = conectar()
    cursor = conn.cursor()

    for arquivo in arquivos:
        if not allowed_file(arquivo.filename):
            continue

        filename = secure_filename(arquivo.filename)
        caminho = os.path.join(UPLOAD_FOLDER, filename)
        arquivo.save(caminho)
        tamanho_mb = os.path.getsize(caminho) / (1024 * 1024)
        tipo_ext = filename.rsplit(".", 1)[1].lower()

        if tipo_ext in {"png", "jpg", "jpeg", "gif"}:
            qtd_imagens += 1
            if qtd_imagens > 5:
                os.remove(caminho)
                return jsonify({"message": "Máximo de 5 imagens permitido"}), 400

        elif tipo_ext in {"mp4"}:
            qtd_videos += 1
            if qtd_videos > 1:
                os.remove(caminho)
                return jsonify({"message": "Apenas 1 vídeo é permitido"}), 400
            if tamanho_mb > 50:  # limite aproximado de 5 min
                os.remove(caminho)
                return jsonify({"message": "O vídeo deve ter no máximo 5 minutos (≈50MB)"}), 400

        elif tipo_ext in {"mp3", "wav"}:
            qtd_audios += 1
            if qtd_audios > 1:
                os.remove(caminho)
                return jsonify({"message": "Apenas 1 áudio é permitido"}), 400
            if tamanho_mb > 20:  # limite aproximado de 21 min
                os.remove(caminho)
                return jsonify({"message": "O áudio deve ter no máximo 21 minutos (≈20MB)"}), 400
            
        caminho = caminho.replace("\\", "/")

        cursor.execute("""
            INSERT INTO Arquivos (tipo, nome_arquivo, tamanho, url_armazenamento, historia_id)
            VALUES (%s, %s, %s, %s, %s)
        """, (tipo_ext, filename, tamanho_mb, caminho, historia_id))
        arquivos_enviados.append(filename)

    conn.commit()
    cursor.close()
    conn.close()

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
