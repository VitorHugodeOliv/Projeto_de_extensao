import bcrypt
from db import conectar

def migrar_senhas():
    conn = conectar()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, senha FROM usuarios")
    usuarios = cursor.fetchall()

    for u in usuarios:
        if not u["senha"].startswith("$2b$"):
            senha_hash = bcrypt.hashpw(u["senha"].encode("utf-8"), bcrypt.gensalt())
            cursor.execute("UPDATE usuarios SET senha=%s WHERE id=%s", (senha_hash.decode("utf-8"), u["id"]))

    conn.commit()
    cursor.close()
    conn.close()
    print("Migração de senhas concluída.")

if __name__ == "__main__":
    migrar_senhas()
