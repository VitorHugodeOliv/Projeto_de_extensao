import mysql.connector
from db import db_config
import bcrypt
from seed_historias import inserir_historias_iniciais

try:
    conn = mysql.connector.connect(host=db_config["host"], user=db_config["user"], password=db_config["password"])
    cursor = conn.cursor()
    
    cursor.execute("CREATE DATABASE IF NOT EXISTS sistema_login")
    print("Banco de dados 'sistema_login' verificado/criado.")
    
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
            conta_ativa BOOLEAN DEFAULT FALSE,
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
            subtitulo VARCHAR(255),
            proponente INT NOT NULL,
            autor_artista VARCHAR(255),
            motivo_rejeicao TEXT NULL,
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
            nome_arquivo VARCHAR(255),
            tamanho FLOAT,
            url_armazenamento TEXT NOT NULL,
            historia_id INT,
            FOREIGN KEY (historia_id) REFERENCES Historias(id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS LogsAdmin (
            id INT AUTO_INCREMENT PRIMARY KEY,
            admin_id INT NOT NULL,
            historia_id INT NULL,
            acao ENUM('Aprovou', 'Rejeitou') NOT NULL,
            data_acao DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (admin_id) REFERENCES Usuarios(id),
            FOREIGN KEY (historia_id) REFERENCES Historias(id) ON DELETE SET NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Curtidas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT NOT NULL,
            historia_id INT NOT NULL,
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY (historia_id) REFERENCES Historias(id) ON DELETE CASCADE,
            UNIQUE (usuario_id, historia_id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Comentarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT NOT NULL,
            historia_id INT NOT NULL,
            texto TEXT NOT NULL,
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
            FOREIGN KEY (historia_id) REFERENCES Historias(id) ON DELETE CASCADE
        )
    """)
    print("Tabelas verificadas/criadas.")

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS TokensConfirmacao (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT NOT NULL,
            token VARCHAR(255) UNIQUE NOT NULL,
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            data_expiracao TIMESTAMP NOT NULL,
            confirmado BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
        )
    """)
    print("Tabela 'TokensConfirmacao' verificada/criada.")

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS TokensRecuperacao (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT NOT NULL,
            token VARCHAR(255) UNIQUE NOT NULL,
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            data_expiracao TIMESTAMP NOT NULL,
            usado BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
        )
    """)
    print("Tabela 'TokensRecuperacao' verificada/criada.")

    # ----------------- Admin padrão -----------------
    admins_padrao = [
        ("admin", "admin@sistema.com", "admin123"),
        ("admin2", "admin2@sistema.com", "admin456"),
    ]

    for nome, email, senha in admins_padrao:
        senha_hash = bcrypt.hashpw(senha.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        cursor.execute("SELECT id FROM Usuarios WHERE email = %s", (email,))
        existente = cursor.fetchone()

        if existente is None:
            cursor.execute(
                """
                INSERT INTO Usuarios (nome, email, senha, tipo_usuario, conta_ativa)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (nome, email, senha_hash, "admin", True)
            )
            print(f"✅ Usuário admin '{nome}' criado ({email}) e conta ativada.")
        else:
            cursor.execute(
                "UPDATE Usuarios SET conta_ativa = TRUE, tipo_usuario = 'admin' WHERE email = %s",
                (email,)
            )
            print(f"ℹ️ Usuário admin '{email}' já existia — conta ativada e tipo garantido como 'admin'.")

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
    

    conn.commit()
    inserir_historias_iniciais()

except mysql.connector.Error as err:
    print(f"Erro: {err}")
finally:
    cursor.close()
    conn.close()