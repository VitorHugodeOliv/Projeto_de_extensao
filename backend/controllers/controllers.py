import bcrypt
from datetime import datetime
from controllers.email_controller import processar_confirmacao_cadastro
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
    usuario_existente = buscar_usuario(email)
    if usuario_existente:
        if not usuario_existente.get("conta_ativa", False):
            try:
                processar_confirmacao_cadastro(email, nome)
                return False, "Conta pendente de confirmação. Reenviamos o e-mail de ativação.", None
            except Exception as e:
                print(f"❌ Erro ao reenviar e-mail de confirmação: {e}")
                return False, "Erro ao reenviar e-mail de confirmação.", None
        
        return False, "Usuário já existe e está ativo.", None

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
    try:
        processar_confirmacao_cadastro(email, nome)
    except Exception as e:
        print(f"❌ Erro ao enviar e-mail inicial: {e}")

    return True, "Usuário cadastrado com sucesso! Verifique seu e-mail para confirmar a conta.", novo_usuario


def login_usuario(email: str, senha: str):
    usuario = buscar_usuario(email)
    if not usuario:
        return False, "Usuário não encontrado", None

    if bcrypt.checkpw(senha.encode("utf-8"), usuario["senha"].encode("utf-8")):
        return True, "Login realizado com sucesso", usuario
    else:
        return False, "Senha incorreta", None
