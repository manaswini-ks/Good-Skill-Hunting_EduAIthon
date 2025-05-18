#!/usr/bin/env python
"""
MongoDB Connection Diagnostic Tool
Run this script to diagnose and fix MongoDB connection issues
"""
import os
import sys
import logging
import argparse
from app.utils.db_health import diagnose_mongodb_issues, suggest_fixes

def setup_logging(verbose=False):
    """Configure logging"""
    log_level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    # Reduce noise from third-party libraries
    logging.getLogger("pymongo").setLevel(logging.WARNING)
    
def main():
    parser = argparse.ArgumentParser(description='MongoDB Connection Diagnostic Tool')
    parser.add_argument('--uri', default='mongodb://localhost:27017/eduspark',
                        help='MongoDB URI to test (default: mongodb://localhost:27017/eduspark)')
    parser.add_argument('--verbose', '-v', action='store_true',
                        help='Enable verbose logging')
    parser.add_argument('--connection-only', action='store_true',
                        help='Only test basic connection, no detailed diagnostics')
    args = parser.parse_args()
    
    setup_logging(args.verbose)
    
    print("EduSpark MongoDB Diagnostic Tool")
    print("================================")
    print(f"Testing connection to: {args.uri}")
    
    if args.connection_only:
        print("Running basic connection test...")
        try:
            from pymongo import MongoClient
            client = MongoClient(args.uri, serverSelectionTimeoutMS=5000)
            client.admin.command('ping')
            print("\n✓ Successfully connected to MongoDB!")
            return 0
        except Exception as e:
            print(f"\n❌ MongoDB connection failed: {str(e)}")
            return 1
    
    print("Running diagnostics...")
    
    try:
        results = diagnose_mongodb_issues(args.uri)
        
        print("\nResults:")
        print(f"✓ Server reachable: {'Yes' if results['server_reachable'] else 'No'}")
        print(f"✓ Can connect: {'Yes' if results['can_connect'] else 'No'}")
        
        if results.get('response_time_ms'):
            status = "✓" if results['response_time_ms'] < 1000 else "⚠️"
            print(f"{status} Response time: {results['response_time_ms']:.2f}ms")
        
        if results.get('connection_pooling'):
            pooling = results['connection_pooling']
            current = pooling.get('current', 0)
            available = pooling.get('available', 0)
            total = current + available
            usage_percent = (current / total) * 100 if total > 0 else 0
            
            status = "✓" if usage_percent < 80 else "⚠️"
            print(f"{status} Connection pool usage: {usage_percent:.1f}% ({current}/{total})")
        
        if results.get('errors'):
            print("\n⚠️ Errors detected:")
            for error in results['errors']:
                print(f"  • {error}")
            
            fixes = suggest_fixes(results)
            print("\nRecommended fixes:")
            for i, fix in enumerate(fixes, 1):
                print(f"  {i}. {fix}")
        else:
            print("\n✓ No issues detected with MongoDB connection!")
            
    except KeyboardInterrupt:
        print("\nDiagnostic interrupted.")
        return 1
    except Exception as e:
        print(f"\n❌ Error running diagnostics: {str(e)}")
        return 1
    
    return 0

if __name__ == '__main__':
    sys.exit(main()) 