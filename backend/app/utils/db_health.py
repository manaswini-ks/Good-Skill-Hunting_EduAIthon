"""
MongoDB Health Check Utility
Diagnose and troubleshoot MongoDB connection issues
"""
import time
import socket
import logging
import pymongo
from pymongo import MongoClient
from tenacity import retry, stop_after_attempt, wait_fixed

logger = logging.getLogger(__name__)

def check_mongodb_server(host="localhost", port=27017, timeout=5):
    """
    Check if MongoDB server is reachable at the network level
    """
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((host, port))
        sock.close()
        
        if result == 0:
            logger.info(f"MongoDB server at {host}:{port} is reachable")
            return True
        else:
            logger.error(f"MongoDB server at {host}:{port} is not reachable, error code: {result}")
            return False
    except Exception as e:
        logger.error(f"Error checking MongoDB server connectivity: {str(e)}")
        return False

@retry(stop=stop_after_attempt(3), wait=wait_fixed(1))
def test_mongodb_connection(uri="mongodb://localhost:27017/eduspark", timeout_ms=5000):
    """
    Test MongoDB connection with retry logic
    """
    client_options = {
        "serverSelectionTimeoutMS": timeout_ms,
        "connectTimeoutMS": timeout_ms,
    }
    
    try:
        client = MongoClient(uri, **client_options)
        # Force a connection to verify
        client.admin.command('ping')
        logger.info("MongoDB connection test successful")
        
        server_info = client.server_info()
        logger.info(f"MongoDB version: {server_info.get('version')}")
        
        return {
            "status": "connected",
            "version": server_info.get('version')
        }
    except pymongo.errors.ServerSelectionTimeoutError as e:
        logger.error(f"MongoDB server selection timeout: {str(e)}")
        return {
            "status": "timeout",
            "error": str(e)
        }
    except pymongo.errors.ConnectionFailure as e:
        logger.error(f"MongoDB connection failure: {str(e)}")
        return {
            "status": "connection_failed",
            "error": str(e)
        }
    except Exception as e:
        logger.error(f"MongoDB connection test failed: {str(e)}")
        return {
            "status": "error",
            "error": str(e)
        }

def diagnose_mongodb_issues(uri="mongodb://localhost:27017/eduspark"):
    """
    Comprehensive MongoDB connection diagnostics
    """
    results = {
        "server_reachable": False,
        "can_connect": False,
        "response_time_ms": None,
        "connection_pooling": None,
        "errors": []
    }
    
    # Check basic connectivity first
    host = "localhost"  # Extract from URI in production
    port = 27017
    
    # Step 1: Check if server is reachable
    results["server_reachable"] = check_mongodb_server(host, port)
    
    if not results["server_reachable"]:
        results["errors"].append("MongoDB server is not reachable on the network")
        return results
    
    # Step 2: Test MongoDB connection
    try:
        # Test response time
        start_time = time.time()
        client = MongoClient(
            uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=10000
        )
        client.admin.command('ping')
        end_time = time.time()
        response_time_ms = (end_time - start_time) * 1000
        
        results["can_connect"] = True
        results["response_time_ms"] = response_time_ms
        
        if response_time_ms > 1000:
            results["errors"].append(f"MongoDB response time is slow: {response_time_ms:.2f}ms")
        
        # Step 3: Check connection pooling
        try:
            server_status = client.admin.command('serverStatus')
            conn_info = server_status.get('connections', {})
            
            results["connection_pooling"] = {
                "current": conn_info.get('current'),
                "available": conn_info.get('available'),
                "total_created": conn_info.get('totalCreated')
            }
            
            if conn_info.get('current') > 0.8 * (conn_info.get('current') + conn_info.get('available')):
                results["errors"].append("MongoDB connection pool is near capacity")
                
        except Exception as e:
            results["errors"].append(f"Failed to get connection pool info: {str(e)}")
    
    except pymongo.errors.ServerSelectionTimeoutError as e:
        results["errors"].append(f"Server selection timeout: {str(e)}")
    except pymongo.errors.ConnectionFailure as e:
        results["errors"].append(f"Connection failure: {str(e)}")
    except Exception as e:
        results["errors"].append(f"Unexpected error: {str(e)}")
    
    return results

def suggest_fixes(diagnosis_results):
    """
    Suggest fixes based on diagnosis results
    """
    fixes = []
    
    if not diagnosis_results["server_reachable"]:
        fixes.extend([
            "Check if MongoDB server is running",
            "Verify firewall settings",
            "Confirm MongoDB is listening on the expected port"
        ])
    elif not diagnosis_results["can_connect"]:
        fixes.extend([
            "Check MongoDB authentication credentials",
            "Verify database permissions",
            "Check if the MongoDB URI is correct"
        ])
    else:
        response_time = diagnosis_results.get("response_time_ms")
        if response_time and response_time > 1000:
            fixes.extend([
                "Configure smaller heartbeatFrequencyMS (default 10000ms)",
                "Increase serverSelectionTimeoutMS if needed",
                "Check for network latency between application and MongoDB server"
            ])
        
        pooling = diagnosis_results.get("connection_pooling")
        if pooling and pooling.get("current") > 100:
            fixes.extend([
                "Increase maxPoolSize to handle more connections",
                "Add connection pooling monitoring",
                "Consider implementing connection pooling limits"
            ])
    
    if diagnosis_results.get("errors"):
        for error in diagnosis_results["errors"]:
            if "timeout" in error.lower():
                fixes.append("Increase connection timeout settings")
            if "authentication" in error.lower():
                fixes.append("Check MongoDB user credentials")
    
    return fixes

# Command-line interface for running diagnostics directly
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    print("Running MongoDB connection diagnostics...")
    
    results = diagnose_mongodb_issues()
    print("\nDiagnosis Results:")
    print(f"Server reachable: {results['server_reachable']}")
    print(f"Can connect: {results['can_connect']}")
    
    if results.get('response_time_ms'):
        print(f"Response time: {results['response_time_ms']:.2f}ms")
    
    if results.get('connection_pooling'):
        pooling = results['connection_pooling']
        print(f"Connection pool - current: {pooling.get('current')}, available: {pooling.get('available')}")
    
    if results.get('errors'):
        print("\nErrors detected:")
        for error in results['errors']:
            print(f"- {error}")
    
    fixes = suggest_fixes(results)
    if fixes:
        print("\nSuggested fixes:")
        for i, fix in enumerate(fixes, 1):
            print(f"{i}. {fix}")
    else:
        print("\nNo issues detected requiring fixes.") 