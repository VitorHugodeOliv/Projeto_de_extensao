from utils.email_utils import gerar_token_confirmacao, enviar_email_confirmacao
from db import conectar

def processar_confirmacao_cadastro(usuario):
    try:
        token = gerar_token_confirmacao(usuario["id"])
        enviar_email_confirmacao(
            email_destinatario=usuario["email"],
            nome_usuario=usuario["nome"],
            token=token
        )

        print(f"✅ E-mail de ativação enviado para {usuario['email']}")
        return True, "E-mail de confirmação enviado com sucesso."

    except Exception as e:
        print(f"❌ Erro ao processar confirmação de cadastro: {e}")
        return False, "Erro ao enviar e-mail de confirmação."


def confirmar_email(token):
    conn = conectar()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT * FROM TokensConfirmacao 
            WHERE token = %s AND data_expiracao > NOW()
        """, (token,))
        registro = cursor.fetchone()

        if not registro:
            return False, "Token inválido ou expirado."

        usuario_id = registro["usuario_id"]

        cursor.execute("""
            UPDATE Usuarios 
            SET conta_ativa = TRUE
            WHERE id = %s
        """, (usuario_id,))
        conn.commit()
        cursor.execute("""
            UPDATE TokensConfirmacao
            SET confirmado = TRUE
            WHERE token = %s
        """, (token,))
        conn.commit()

        print(f"✅ Conta ativada para usuário ID {usuario_id}")
        return True, "Conta ativada com sucesso!"

    except Exception as e:
        print(f"❌ Erro ao confirmar e-mail: {e}")
        return False, "Erro interno ao confirmar conta."

    finally:
        cursor.close()
        conn.close()