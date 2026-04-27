from flask import Flask
from .database.db import init_db
from .routes.otp_routes import otp_bp
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config['DATABASE'] = os.path.join(app.instance_path, 'otp.db')
    
    os.makedirs(app.instance_path, exist_ok=True)
    
    init_db(app)
    
    app.register_blueprint(otp_bp)
    
    return app
