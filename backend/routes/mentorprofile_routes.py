from flask import Blueprint, request, jsonify
from app.models.mentor import mentors
import datetime

mentor_bp = Blueprint("mentor_bp", __name__)

# Create or Update Mentor Profile
@mentor_bp.route("/api/mentor/<user_id>", methods=["PUT"])
def save_mentor_profile(user_id):
    data = request.json
    data["user_id"] = user_id
    data["updated_at"] = datetime.datetime.utcnow()
    mentors.find_one_and_update(
        {"user_id": user_id},
        {"$set": data},
        upsert=True
    )
    return jsonify({"msg": "Mentor profile saved successfully"}), 200

# Get Mentor Profile
@mentor_bp.route("/api/mentor/<user_id>", methods=["GET"])
def get_mentor_profile(user_id):
    profile = mentors.find_one({"user_id": user_id})
    if profile:
        profile["_id"] = str(profile["_id"])
        return jsonify(profile)
    return jsonify({}), 404
