from flask import jsonify, current_app
import jwt
import mysql.connector
import traceback

def register_error_handlers(app):

    @app.errorhandler(KeyError)
    def handle_key_error(error):
        current_app.logger.error(f"[KeyError] {str(error)}", exc_info=True)
        return jsonify({
            "status": "error",
            "message": f"Chave ausente ou inválida: {str(error)}"
        }), 400

    @app.errorhandler(jwt.ExpiredSignatureError)
    def handle_expired_token(error):
        current_app.logger.warning(f"[ExpiredSignatureError] {str(error)}")
        return jsonify({
            "status": "error",
            "message": "Token expirado. Faça login novamente."
        }), 401

    @app.errorhandler(jwt.InvalidTokenError)
    def handle_invalid_token(error):
        current_app.logger.warning(f"[InvalidTokenError] {str(error)}")
        return jsonify({
            "status": "error",
            "message": "Token inválido ou corrompido."
        }), 401

    @app.errorhandler(mysql.connector.Error)
    def handle_mysql_error(error):
        current_app.logger.error(f"[MySQLError] {str(error)}", exc_info=True)
        return jsonify({
            "status": "error",
            "message": "Erro no banco de dados.",
            "details": str(error)
        }), 500

    @app.errorhandler(Exception)
    def handle_general_error(error):
        current_app.logger.error(f"[UnhandledException] {str(error)}", exc_info=True)

        return jsonify({
            "status": "error",
            "message": "Ocorreu um erro interno no servidor.",
            "details": str(error)
        }), 500
