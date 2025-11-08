# -*- coding: utf-8 -*-
import os
from dotenv import load_dotenv

load_dotenv()

class settings:
    SECRET_KEY = os.getenv("SECRET_KEY", "chave_ultra_segura")

    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "senha123")
    DB_NAME = os.getenv("DB_NAME", "sistema_login")

    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS", "True") == "True"
    MAIL_USE_SSL = os.getenv("MAIL_USE_SSL", "False") == "True"
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", "seuemail@gmail.com")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD", "senha_ou_app_password")
    MAIL_DEFAULT_SENDER = (
        os.getenv("MAIL_DEFAULT_SENDER_NAME", "Arquivo Cultural"),
        MAIL_USERNAME,
    )

    DEBUG = os.getenv("DEBUG", "True") == "True"
