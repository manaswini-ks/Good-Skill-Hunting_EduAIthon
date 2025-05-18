"""
MongoDB Connection Monitor Utility
This utility helps monitor MongoDB connection health and performance
"""
import logging
import time
from flask import current_app
from pymongo.monitoring import CommandListener, ServerHeartbeatListener

logger = logging.getLogger(__name__)

class MongoHeartbeatLogger(ServerHeartbeatListener):
    """Listener for MongoDB server heartbeats to log slow connections"""
    
    def __init__(self, warning_threshold_ms=1000):
        self.warning_threshold_ms = warning_threshold_ms
    
    def started(self, event):
        """Called when server heartbeat is started"""
        pass
    
    def succeeded(self, event):
        """Called when server heartbeat succeeds"""
        duration_ms = event.duration_micros / 1000
        if duration_ms > self.warning_threshold_ms:
            logger.warning(
                f"MongoDB heartbeat took {duration_ms:.2f}ms - exceeds warning threshold of {self.warning_threshold_ms}ms"
            )
    
    def failed(self, event):
        """Called when server heartbeat fails"""
        duration_ms = event.duration_micros / 1000
        logger.error(f"MongoDB heartbeat failed after {duration_ms:.2f}ms: {event.reply}")


class MongoCommandLogger(CommandListener):
    """Listener for MongoDB commands to log slow queries"""
    
    def __init__(self, slow_query_threshold_ms=500):
        self.slow_query_threshold_ms = slow_query_threshold_ms
    
    def started(self, event):
        """Called when command starts"""
        pass
    
    def succeeded(self, event):
        """Called when command succeeds"""
        duration_ms = event.duration_micros / 1000
        if duration_ms > self.slow_query_threshold_ms:
            logger.warning(
                f"Slow MongoDB query: {event.command_name} took {duration_ms:.2f}ms"
            )
    
    def failed(self, event):
        """Called when command fails"""
        duration_ms = event.duration_micros / 1000
        logger.error(
            f"MongoDB query failed: {event.command_name} after {duration_ms:.2f}ms - {event.failure}"
        )


def check_mongodb_status():
    """Check MongoDB connection status and performance"""
    from app import mongo
    
    try:
        start_time = time.time()
        result = mongo.db.command('ping')
        duration = (time.time() - start_time) * 1000  # convert to ms
        
        if duration > 1000:  # If ping takes more than 1 second
            logger.warning(f"MongoDB ping took {duration:.2f}ms - performance issue detected")
        
        server_status = mongo.db.command('serverStatus')
        connections = server_status.get('connections', {})
        
        # Log connection statistics
        logger.info(f"MongoDB connections - current: {connections.get('current')}, available: {connections.get('available')}")
        
        return {
            "status": "healthy" if result.get("ok") == 1.0 else "unhealthy",
            "ping_ms": duration,
            "connections": connections
        }
        
    except Exception as e:
        logger.error(f"MongoDB connection check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e)
        } 