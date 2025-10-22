import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app as flask_app
from db import conectar

@pytest.fixture()
def app():
    flask_app.config.update({
        "TESTING": True,
        "SECRET_KEY": "testkey",
        "UPLOAD_FOLDER": "uploads_test"
    })
    os.makedirs("uploads_test", exist_ok=True)
    yield flask_app

    for f in os.listdir("uploads_test"):
        os.remove(os.path.join("uploads_test", f))
    os.rmdir("uploads_test")


@pytest.fixture()
def client(app):
    return app.test_client()
