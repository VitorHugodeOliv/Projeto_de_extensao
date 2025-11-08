import os
import secrets
from datetime import datetime, timedelta
from flask_mail import Mail, Message
from db import conectar
from config import settings

mail = Mail()


def gerar_token_confirmacao(usuario_id: int) -> str:
    token = secrets.token_urlsafe(32)
    expiracao = datetime.now() + timedelta(hours=24)

    conn = conectar()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO TokensConfirmacao (usuario_id, token, data_expiracao)
        VALUES (%s, %s, %s)
    """, (usuario_id, token, expiracao))

    conn.commit()
    cursor.close()
    conn.close()

    return token


def enviar_email_confirmacao(email_destinatario: str, nome_usuario: str, token: str):
    try:
        link_confirmacao = f"http://localhost:5000/confirmar-email/{token}"

        msg = Message(
            subject="Confirme seu cadastro - Arquivo Digital de Memória Cultural",
            sender=settings.MAIL_DEFAULT_SENDER,
            recipients=[email_destinatario],
        )

        msg.html = f"""
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Olá, {nome_usuario}!</h2>
            <p>Bem-vindo ao <strong>Arquivo Digital de Memória Cultural</strong> 🎭</p>
            <p>Para ativar sua conta e começar a explorar o acervo, clique no botão abaixo:</p>
            <p style="text-align: center;">
                <a href="{link_confirmacao}"
                   style="background-color: #009170; color: white; padding: 10px 20px;
                          text-decoration: none; border-radius: 6px; font-weight: bold;">
                    Ativar minha conta
                </a>
            </p>
            <p>Este link expira em 24 horas por segurança.</p>
            <hr>
            <small>Se você não criou uma conta, ignore este e-mail.</small>
        </div>
        """

        mail.send(msg)
        print(f"📧 E-mail de confirmação enviado para {email_destinatario}")

    except Exception as e:
        print(f"❌ Erro ao enviar e-mail: {e}")
        raise
