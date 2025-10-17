import bcrypt
import jwt
from datetime import datetime, timedelta
from models.models import criar_usuario, buscar_usuario
from config import settings

SECRET_KEY = settings.SECRET_KEY

def cadastrar_usuario(
    nome: str, 
    email: str, 
    senha: str, 
    tipo_usuario: str = "usuario",
    endereco: str = None,
    idade: str = None,
    apelido: str = None,
    area_artistica = None,
):
    if buscar_usuario(email):
        return False, "Usuário já existe", None

    senha_hash = bcrypt.hashpw(senha.encode("utf-8"), bcrypt.gensalt())

    novo_usuario = criar_usuario(
        nome,
        email,
        senha_hash.decode("utf-8"),
        tipo_usuario=tipo_usuario,
        endereco=endereco,
        idade=idade,
        apelido=apelido,
        area_artistica=area_artistica
    )

    if not novo_usuario:
        return False, "Erro ao criar usuário", None

    payload = {
        "id": novo_usuario["id"],
        "nome": novo_usuario["nome"],
        "tipo_usuario": novo_usuario["tipo_usuario"],
        "exp": datetime.utcnow() + timedelta(hours=2)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    
    return True, "Usuário cadastrado com sucesso", token

def login_usuario(email: str, senha: str):
    usuario = buscar_usuario(email)
    if not usuario:
        return False, "Usuário não encontrado", None

    if bcrypt.checkpw(senha.encode("utf-8"), usuario['senha'].encode("utf-8")):
        payload = {
            "id": usuario['id'],
            "nome": usuario['nome'],
            "tipo_usuario": usuario.get('tipo_usuario', 'usuario'),
            "exp": datetime.utcnow() + timedelta(hours=2)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
        return True, "Login realizado com sucesso", token
    else:
        return False, "Senha incorreta", None
