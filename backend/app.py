import os
from dotenv import load_dotenv
from routes.routes import app

load_dotenv()

if __name__ == "__main__":
    debug_mode = os.getenv("DEBUG", "False").lower() == "true"
    port = int(os.getenv("PORT", 5000))
    host = os.getenv("HOST", "0.0.0.0")

    app.run(host=host, port=port, debug=debug_mode)