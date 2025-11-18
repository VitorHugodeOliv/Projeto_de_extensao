import os
import mysql.connector
from dotenv import load_dotenv, find_dotenv

dotenv_path = find_dotenv()
if dotenv_path:
    load_dotenv(dotenv_path)
else:
    print("Aviso: arquivo .env não encontrado!")

RUNNING_IN_DOCKER = os.getenv("RUNNING_IN_DOCKER", "False") == "True"

DB_HOST = "db" if RUNNING_IN_DOCKER else "localhost"

db_config = {
    "host": DB_HOST,
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "sistema_login"),
}

def conectar():
    return mysql.connector.connect(**db_config)
