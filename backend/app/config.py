import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration class for the Flask application."""
    SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-secret-key')
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/eduspark')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-secret-key')
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() in ('true', '1', 't')
    
class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False

# Set the configuration based on environment
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

def get_config():
    """Get the configuration based on environment."""
    env = os.getenv('FLASK_ENV', 'default')
    return config.get(env, config['default'])
