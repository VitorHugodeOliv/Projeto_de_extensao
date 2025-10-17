import mysql.connector

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'senha123',
    'database': 'sistema_login'
}

def conectar():
    return mysql.connector.connect(**db_config)
