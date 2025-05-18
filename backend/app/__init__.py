# app/__init__.py

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_pymongo import PyMongo
import os
import logging
from pymongo import MongoClient

mongo = PyMongo()

def create_app():
    app = Flask(__name__)
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Setup CORS with more permissive configuration for development
    CORS(app, 
         resources={r"/*": {"origins": "*"}},
         supports_credentials=True,
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Origin"])

    # Configure MongoDB with connection options
    app.config["MONGO_URI"] = "mongodb://localhost:27017/eduspark"
    
    # MongoDB client options to handle connection issues
    app.config["MONGO_OPTIONS"] = {
        "serverSelectionTimeoutMS": 5000,  # Timeout after 5 seconds if can't select server
        "connectTimeoutMS": 5000,          # Timeout after 5 seconds if can't connect
        "socketTimeoutMS": 30000,          # Timeout after 30 seconds on socket operations
        "maxPoolSize": 50,                 # Maximum number of connections in connection pool
        "minPoolSize": 10,                 # Minimum number of connections in connection pool
        "maxIdleTimeMS": 50000,            # Maximum time a connection can remain idle in pool
        "waitQueueTimeoutMS": 5000,        # How long to wait for a connection from pool
        "heartbeatFrequencyMS": 10000      # How often to check server status (10 seconds)
    }
    
    # Configure upload paths
    app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    
    # Initialize extensions
    mongo.init_app(app)

    try:
        # Test MongoDB connection
        mongo.db.command('ping')
        print("Successfully connected to MongoDB!")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        # You might want to exit here in production
        
    # Error handlers
    @app.errorhandler(500)
    def handle_500_error(e):
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

    @app.errorhandler(404)
    def handle_404_error(e):
        return jsonify({"error": "Resource not found"}), 404

    # Blueprint import and registration
    from app.routes.auth import auth_bp
    from app.routes.student import student_bp
    from app.routes.mentor import mentor_bp
    from app.routes.entrepreneur import entrepreneur_bp
    from app.routes.shared import shared_bp
    from app.routes.opportunity import opportunity_bp
    from app.routes.matching import match_bp
    
    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(student_bp, url_prefix="/student")
    app.register_blueprint(mentor_bp, url_prefix="/mentor")
    app.register_blueprint(entrepreneur_bp, url_prefix="/entrepreneur")
    app.register_blueprint(shared_bp, url_prefix="/shared")
    app.register_blueprint(opportunity_bp, url_prefix="/opportunity")
    app.register_blueprint(match_bp, url_prefix="/match")

    # Health check endpoint to test MongoDB connection
    @app.route('/health')
    def health_check():
        try:
            # Test MongoDB connection
            mongo.db.command('ping')
            return jsonify({"status": "ok", "message": "Database connection is healthy"}), 200
        except Exception as e:
            return jsonify({"status": "error", "message": f"Database error: {str(e)}"}), 500

    # Serve static files from upload directory
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    return app
