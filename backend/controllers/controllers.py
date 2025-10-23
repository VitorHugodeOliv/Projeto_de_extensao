import bcrypt
from datetime import datetime
from models.models import criar_usuario, buscar_usuario

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
    return True, "Usuário cadastrado com sucesso", novo_usuario


def login_usuario(email: str, senha: str):
    usuario = buscar_usuario(email)
    if not usuario:
        return False, "Usuário não encontrado", None

    if bcrypt.checkpw(senha.encode("utf-8"), usuario["senha"].encode("utf-8")):
        return True, "Login realizado com sucesso", usuario
    else:
        return False, "Senha incorreta", None
