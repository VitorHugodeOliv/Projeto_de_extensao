from db import conectar

def buscar_usuario_por_id(user_id: int):
    try:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, nome, email, tipo_usuario, endereco, idade, apelido, area_artistica, data_criacao FROM usuarios WHERE id = %s", (user_id,))
        usuario = cursor.fetchone()
        cursor.close()
        conn.close()
        return usuario
    except Exception as e:
        print("Erro ao buscar usuário:", e)
        return None


def atualizar_usuario(id_usuario, dados):
    conexao = conectar()
    cursor = conexao.cursor(dictionary=True)

    if id_usuario == 1:
        print("Tentativa de alteração no usuário admin bloqueada.")
        return False

    if "data_criacao" in dados:
        del dados["data_criacao"]

    campos = ", ".join([f"{chave} = %s" for chave in dados.keys()])
    valores = list(dados.values())

    sql = f"UPDATE usuarios SET {campos} WHERE id = %s"
    valores.append(id_usuario)

    try:
        cursor.execute(sql, valores)
        conexao.commit()
        return True
    except Exception as e:
        print("Erro ao atualizar usuário:", e)
        conexao.rollback()
        return False
    finally:
        cursor.close()
        conexao.close()
