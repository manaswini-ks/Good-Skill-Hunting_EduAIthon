from app import create_app
from app.init_db import init_db
from flask_cors import CORS
import logging
import os
from pymongo.monitoring import register

# Configure MongoDB monitoring with reasonable defaults
# Import needs to happen after configuring logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Reduce the verbosity of the pymongo logs in normal operation
logging.getLogger("pymongo").setLevel(logging.WARNING)
logging.getLogger("pymongo.monitoring").setLevel(logging.WARNING)

if __name__ == "__main__":
    app = create_app()

    # Setup MongoDB monitoring
    try:
        from app.utils.db_monitor import MongoHeartbeatLogger, MongoCommandLogger
        # Register MongoDB event listeners for monitoring
        heartbeat_logger = MongoHeartbeatLogger(warning_threshold_ms=2000)  # Log heartbeats taking more than 2 seconds
        command_logger = MongoCommandLogger(slow_query_threshold_ms=500)    # Log commands taking more than 500ms
        register(heartbeat_logger)
        register(command_logger)
        logger.info("MongoDB monitoring is active")
    except Exception as e:
        logger.warning(f"Failed to set up MongoDB monitoring: {e}")

    # Enable CORS on the app
    CORS(app)  # This will allow all origins by default

    # Initialize database with sample data if needed
    with app.app_context():
        init_db()
    
    logger.info("================================")
    logger.info("Starting EduSpark Backend Server")
    logger.info("================================")
    logger.info("First install required dependencies:")
    logger.info("pip install -r requirements.txt")
    logger.info("--------------------------------")
    logger.info("Running at: http://localhost:5000")
    logger.info("CORS enabled for: http://localhost:5173")
    logger.info("--------------------------------")
    app.run(debug=True, host='0.0.0.0', port=5000)
