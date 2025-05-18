from flask import Blueprint, request, jsonify
from datetime import datetime
from app import mongo
from werkzeug.security import generate_password_hash, check_password_hash
import logging

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Validate required fields
        if not data.get("email") or not data.get("password"):
            return jsonify({"error": "Email and password are required"}), 400

        # Determine which collection to check based on role
        role = data.get("role", "student")
        collection_map = {
            "student": mongo.db.students,
            "mentor": mongo.db.mentors,
            "entrepreneur": mongo.db.entrepreneurs
        }
        
        if role not in collection_map:
            return jsonify({"error": "Invalid role"}), 400
            
        collection = collection_map[role]
        
        # Find user in the appropriate collection
        user = collection.find_one({"email": data["email"]})
        if not user or not check_password_hash(user["password"], data["password"]):
            return jsonify({"error": "Invalid email or password"}), 401

        # Create user response object with only necessary fields
        user_response = {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": role
        }
        
        # Add additional fields specific to roles
        if role == "entrepreneur" and "company" in user:
            user_response["company"] = user["company"]

        return jsonify({
            "message": "Login successful",
            "user": user_response
        }), 200

    except Exception as e:
        logging.error(f"Login error: {str(e)}")
        return jsonify({"error": "An error occurred during login"}), 500

@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Validate required fields
        required_fields = ["email", "password", "name", "role", "phone"]
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
            
        role = data["role"]
        if role not in ["student", "mentor", "entrepreneur"]:
            return jsonify({"error": "Invalid role. Must be 'student', 'mentor', or 'entrepreneur'"}), 400

        # Determine which collection to use based on role
        collection_map = {
            "student": mongo.db.students,
            "mentor": mongo.db.mentors,
            "entrepreneur": mongo.db.entrepreneurs
        }
        
        collection = collection_map[role]
        
        # Check if user already exists in the appropriate collection
        if collection.find_one({"email": data["email"]}):
            return jsonify({"error": "Email already registered"}), 409

        # Create base user document with common fields
        new_user = {
            "email": data["email"],
            "password": generate_password_hash(data["password"]),
            "name": data["name"],
            "phone": data["phone"],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }

        # Add role-specific fields
        if role == "student":
            new_user.update({
                "interests": data.get("interests", []),
                "enrolled_courses": [],
                "mentors": []
            })
        elif role == "mentor":
            new_user.update({
                "expertise": data.get("expertise", []),
                "availability": data.get("availability", []),
                "students": [],
                "rating": 0,
                "reviews": []
            })
        elif role == "entrepreneur":
            new_user.update({
                "company": data.get("company", ""),
                "industry": data.get("industry", ""),
                "stage": data.get("stage", ""),
                "mentors": []
            })

        # Insert the user into the appropriate collection
        result = collection.insert_one(new_user)
        user_id = result.inserted_id

        # Create user response with only necessary fields
        user_response = {
            "id": str(user_id),
            "name": data["name"],
            "email": data["email"],
            "role": role
        }
        
        # Add additional fields specific to roles
        if role == "entrepreneur" and "company" in data:
            user_response["company"] = data["company"]

        return jsonify({
            "message": "Registration successful",
            "user": user_response
        }), 201

    except Exception as e:
        logging.error(f"Registration error: {str(e)}")
        return jsonify({"error": "An error occurred during registration"}), 500
