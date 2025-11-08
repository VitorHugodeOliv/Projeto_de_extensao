from db import conectar
from utils.email_utils import gerar_token_recuperacao, enviar_email_recuperacao
import bcrypt

def solicitar_recuperacao(email):
    conn = conectar()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM Usuarios WHERE email = %s", (email,))
    usuario = cursor.fetchone()

    if not usuario:
        cursor.close()
        conn.close()
        return False, "E-mail não encontrado."

    token = gerar_token_recuperacao(usuario["id"])
    enviar_email_recuperacao(usuario["email"], usuario["nome"], token)

    cursor.close()
    conn.close()
    return True, "E-mail de recuperação enviado com sucesso."


def redefinir_senha(token, nova_senha):
    conn = conectar()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT * FROM TokensRecuperacao 
        WHERE token = %s AND data_expiracao > NOW() AND usado = FALSE
    """, (token,))
    registro = cursor.fetchone()

    if not registro:
        cursor.close()
        conn.close()
        return False, "Token inválido ou expirado."

    usuario_id = registro["usuario_id"]
    senha_hash = bcrypt.hashpw(nova_senha.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    cursor.execute("UPDATE Usuarios SET senha = %s WHERE id = %s", (senha_hash, usuario_id))
    cursor.execute("UPDATE TokensRecuperacao SET usado = TRUE WHERE id = %s", (registro["id"],))
    conn.commit()

    cursor.close()
    conn.close()
    return True, "Senha redefinida com sucesso!"
