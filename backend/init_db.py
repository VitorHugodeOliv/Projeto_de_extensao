import mysql.connector
from db import db_config
import bcrypt

db_config = {
    "host": "localhost",
    "user": "root",
    "password": "senha123",
    "database": "sistema_login"
}

try:
    conn = mysql.connector.connect(host=db_config["host"], user=db_config["user"], password=db_config["password"])
    cursor = conn.cursor()
    
    # Criar banco de dados se não existir
    cursor.execute("CREATE DATABASE IF NOT EXISTS sistema_login")
    print("Banco de dados 'sistema_login' verificado/criado.")
    
    # Conectar ao banco criado
    conn.database = "sistema_login"

    # ----------------- Tabelas -----------------
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            senha VARCHAR(255) NOT NULL,
            endereco VARCHAR(255),
            tipo_usuario VARCHAR(50),
            idade INT,
            apelido VARCHAR(100),
            area_artistica VARCHAR(100),
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Categorias (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            descricao TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Historias (
            id INT AUTO_INCREMENT PRIMARY KEY,
            titulo VARCHAR(255) NOT NULL,
            proponente INT NOT NULL,
            autor_artista VARCHAR(255),
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            categoria_id INT,
            status VARCHAR(50),
            conteudo TEXT,
            FOREIGN KEY (proponente) REFERENCES Usuarios(id),
            FOREIGN KEY (categoria_id) REFERENCES Categorias(id)
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Arquivos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            tipo VARCHAR(50),
            url_armazenamento TEXT NOT NULL,
            historia_id INT,
            FOREIGN KEY (historia_id) REFERENCES Historias(id)
        )
    """)
    print("Tabelas verificadas/criadas.")

    # ----------------- Admin padrão -----------------
    admin_email = "admin@sistema.com"
    admin_nome = "admin"
    admin_senha = "admin123"

    # Hash da senha
    senha_hash = bcrypt.hashpw(admin_senha.encode("utf-8"), bcrypt.gensalt())

    cursor.execute("SELECT id FROM Usuarios WHERE email = %s", (admin_email,))
    if cursor.fetchone() is None:
        cursor.execute(
            "INSERT INTO Usuarios (nome, email, senha, tipo_usuario) VALUES (%s, %s, %s, %s)",
            (admin_nome, admin_email, senha_hash.decode('utf-8'), "admin")
        )
        print("Usuário admin criado.")
    else:
        print("Usuário admin já existe.")

    # ----------------- Categorias iniciais -----------------
    categorias_iniciais = [
        ("Teatro", "Histórias relacionadas a teatro e performances."),
        ("Dança", "Histórias e artistas de dança."),
        ("Audiovisual", "Histórias de cinema, vídeo e audiovisual.")
    ]

    for nome, descricao in categorias_iniciais:
        cursor.execute("SELECT id FROM Categorias WHERE nome = %s", (nome,))
        if cursor.fetchone() is None:
            cursor.execute("INSERT INTO Categorias (nome, descricao) VALUES (%s, %s)", (nome, descricao))
            print(f"Categoria '{nome}' criada.")
        else:
            print(f"Categoria '{nome}' já existe.")

    # Commit das alterações
    conn.commit()

except mysql.connector.Error as err:
    print(f"Erro: {err}")
finally:
    cursor.close()
    conn.close()