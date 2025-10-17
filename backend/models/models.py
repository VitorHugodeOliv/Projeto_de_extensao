from db import conectar

def buscar_usuario(email: str):
    try:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM usuarios WHERE email = %s", (email,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        return user
    except Exception as e:
        print("Erro ao buscar usuário:", e)
        return None

def criar_usuario(nome: str, email: str, senha: str, tipo_usuario: str = "usuario",
                  endereco: str = None, idade: int = None, apelido: str = None,
                  area_artistica: str = None):
    try:
        conn = conectar()
        cursor = conn.cursor()
        sql = """
        INSERT INTO Usuarios (nome, email, senha, tipo_usuario, endereco, idade, apelido, area_artistica, data_criacao)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
        """
        cursor.execute(sql, (nome, email, senha, tipo_usuario, endereco, idade, apelido, area_artistica))
        conn.commit()

        user_id = cursor.lastrowid

        cursor.close()
        conn.close()
        return {"id": user_id, "nome": nome, "email": email, "tipo_usuario": tipo_usuario}
    except Exception as e:
        print("Erro ao criar usuário:", e)
        return None