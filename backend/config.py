# -*- coding: utf-8 -*-

import os

class settings:
    # Chave secreta usada para gerar e validar JWT
    SECRET_KEY = "ASCmFWsXChiPKMoZa1PnmHEo1YL3nR9R"

    # Configurações do banco de dados
    DB_HOST = "localhost"
    DB_USER = "root"
    DB_PASSWORD = "senha123"
    DB_NAME = "sistema_login"

    DEBUG = True