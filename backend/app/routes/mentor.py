from flask import Blueprint, request, jsonify
from app import mongo
from bson.objectid import ObjectId
import os
import datetime
import logging

mentor_bp = Blueprint('mentor', __name__)

@mentor_bp.route('/all', methods=['GET'])
def get_all_mentors():
    try:
        mentors = list(mongo.db.mentors.find({}))
        # Convert ObjectId to string for serialization
        for mentor in mentors:
            mentor['id'] = str(mentor.get('_id'))
            del mentor['_id']
        return jsonify(mentors), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@mentor_bp.route('/profile/<mentor_id>', methods=['GET'])
def get_mentor_profile(mentor_id):
    try:
        # Support both string ID and ObjectId
        mentor = None
        try:
            mentor = mongo.db.mentors.find_one({"_id": ObjectId(mentor_id)})
        except:
            mentor = mongo.db.mentors.find_one({"id": mentor_id})
            
        if not mentor:
            return jsonify({"error": "Mentor not found"}), 404
            
        # Convert ObjectId to string for serialization
        if '_id' in mentor:
            mentor['id'] = str(mentor.get('_id'))
            del mentor['_id']
            
            return jsonify(mentor), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@mentor_bp.route('/profile/<mentor_id>', methods=['PUT'])
def update_mentor_profile(mentor_id):
    
        data = request.get_json()
    
        # Handle skills and expertise as arrays
        if 'skills' in data and isinstance(data['skills'], str):
            data['skills'] = [s.strip() for s in data['skills'].split(',') if s.strip()]
        
        if 'expertise' in data and isinstance(data['expertise'], str):
            data['expertise'] = [e.strip() for e in data['expertise'].split(',') if e.strip()]
            
        result = None
        try:
            result = mongo.db.mentors.update_one(
                {"_id": ObjectId(mentor_id)},
                {"$set": data}
            )
        except:
            result = mongo.db.mentors.update_one(
                {"id": mentor_id},
                {"$set": data}
            )
            
        if result.matched_count == 0:
            return jsonify({"error": "Mentor not found"}), 404
            
        return jsonify({"message": "Profile updated successfully"}), 200


@mentor_bp.route('/connections/request', methods=['POST'])
def request_connection():
    try:
        data = request.get_json()
        required_fields = ['mentorId', 'userId', 'userRole']
        
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Get user details to include in connection
        user_data = {}
        user_id = data['userId']
        user_role = data['userRole']
        
        if user_role == 'student':
            try:
                student = mongo.db.students.find_one({"_id": ObjectId(user_id)})
                if student:
                    user_data = {
                        "fullName": student.get('fullName', ''),
                        "email": student.get('email', '')
                    }
            except Exception as e:
                logging.warning(f"Could not fetch student data for connection: {str(e)}")
        
        elif user_role == 'entrepreneur':
            try:
                entrepreneur = mongo.db.entrepreneurs.find_one({"_id": ObjectId(user_id)})
                if entrepreneur:
                    user_data = {
                        "fullName": entrepreneur.get('fullName', ''),
                        "email": entrepreneur.get('email', '')
                    }
            except Exception as e:
                logging.warning(f"Could not fetch entrepreneur data for connection: {str(e)}")
            
        connection_data = {
            "mentor_id": data['mentorId'],
            "user_id": data['userId'],
            "user_role": data['userRole'],
            "status": "pending",
            "created_at": datetime.datetime.now().isoformat(),
            "user_data": user_data,
            "message": data.get('message', '')
        }
        
        mongo.db.connections.insert_one(connection_data)
        return jsonify({"message": "Connection request sent successfully"}), 201
    except Exception as e:
        logging.error(f"Error in connection request: {str(e)}")
        return jsonify({"error": str(e)}), 500

@mentor_bp.route('/connections/<user_id>/<user_role>', methods=['GET'])
def get_user_connections(user_id, user_role):
    try:
        connections = list(mongo.db.connections.find({"user_id": user_id, "user_role": user_role}))
        
        # Convert ObjectId to string for serialization
        for connection in connections:
            connection['id'] = str(connection.get('_id'))
            connection['_id'] = connection['id']  # Keep _id for frontend compatibility
            
            # Ensure created_at is in ISO format
            if 'created_at' in connection and not isinstance(connection['created_at'], str):
                connection['created_at'] = connection['created_at'].isoformat()
            
        return jsonify(connections), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@mentor_bp.route('/connections/mentor/<mentor_id>', methods=['GET'])
def get_mentor_connections(mentor_id):
    try:
        connections = list(mongo.db.connections.find({"mentor_id": mentor_id}))
        
        # Enhance connections with user details
        for connection in connections:
            # Convert ObjectId to string for serialization
            connection['id'] = str(connection.get('_id'))
            connection['_id'] = connection['id']  # Keep _id for frontend compatibility
            
            # Ensure created_at is in ISO format
            if 'created_at' in connection and not isinstance(connection['created_at'], str):
                connection['created_at'] = connection['created_at'].isoformat()
            
            # Fetch user details based on user_role
            user_id = connection.get('user_id')
            user_role = connection.get('user_role')
            user_data = None
            
            # First check if we already have embedded user_data
            if 'user_data' in connection and connection['user_data']:
                user_data = connection['user_data']
            else:
                # Otherwise fetch from database
                if user_role == 'student':
                    try:
                        user_data = mongo.db.students.find_one({
                            "$or": [
                                {"_id": ObjectId(user_id)},
                                {"id": user_id},
                                {"student_id": user_id}
                            ]
                        })
                    except Exception as e:
                        logging.warning(f"Error fetching student data: {str(e)}")
                        
                elif user_role == 'entrepreneur':
                    try:
                        user_data = mongo.db.entrepreneurs.find_one({
                            "$or": [
                                {"_id": ObjectId(user_id)},
                                {"id": user_id},
                                {"entrepreneur_id": user_id}
                            ]
                        })
                    except Exception as e:
                        logging.warning(f"Error fetching entrepreneur data: {str(e)}")
            
            if user_data:
                if isinstance(user_data, dict):
                    if '_id' in user_data:
                        user_data['id'] = str(user_data['_id'])
                    
                    # Add user data to the connection
                    connection['user'] = {
                        'id': user_data.get('id') or str(user_data.get('_id', '')) or user_id,
                        'fullName': user_data.get('fullName', 'Unknown User'),
                        'email': user_data.get('email', ''),
                        'role': user_role,
                        'skills': user_data.get('skills', []),
                        'interests': user_data.get('interests', [])
                    }
            else:
                # Default user data if not found
                connection['user'] = {
                    'id': user_id,
                    'fullName': 'Unknown User',
                    'email': '',
                    'role': user_role
                }
            
        return jsonify(connections), 200
    except Exception as e:
        logging.error(f"Error getting mentor connections: {str(e)}")
        return jsonify({"error": str(e)}), 500

@mentor_bp.route('/connections/<connection_id>/status', methods=['PUT'])
def update_connection_status(connection_id):
    try:
        data = request.get_json()
        
        if 'status' not in data:
            return jsonify({"error": "Status field is required"}), 400
            
        if data['status'] not in ["accepted", "rejected", "pending"]:
            return jsonify({"error": "Invalid status value"}), 400
        
        # Try to convert to ObjectId, handle as string if fails
        try:
            obj_id = ObjectId(connection_id)
            result = mongo.db.connections.update_one(
                {"_id": obj_id},
                {"$set": {
                    "status": data['status'],
                    "updated_at": datetime.datetime.now().isoformat()
                }}
            )
        except Exception as e:
            # If connection_id is not a valid ObjectId, try using it as a string id
            result = mongo.db.connections.update_one(
                {"id": connection_id},
                {"$set": {
                    "status": data['status'],
                    "updated_at": datetime.datetime.now().isoformat()
                }}
            )
        
        if result.matched_count == 0:
            return jsonify({"error": "Connection not found"}), 404
            
        return jsonify({"message": "Connection status updated successfully"}), 200
    except Exception as e:
        logging.error(f"Error updating connection status: {str(e)}")
        return jsonify({"error": str(e), "details": "Error updating connection status"}), 500
