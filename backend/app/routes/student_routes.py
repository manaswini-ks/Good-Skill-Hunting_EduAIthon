from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from app.utils.db import mongo

studentprofile_bp = Blueprint("studentprofile", __name__)

# FORMATTER
def format_profile(doc):
    return {
        "id": str(doc["_id"]),
        "user_id": doc.get("user_id"),
        "fullName": doc.get("fullName"),
        "email": doc.get("email"),
        "location": doc.get("location"),
        "tags": doc.get("tags", []),
        "education": doc.get("education", {}),
        "skills": doc.get("skills", []),
        "achievements": doc.get("achievements", []),
        "resumeLink": doc.get("resumeLink"),
        "socials": doc.get("socials", {})
    }

# ✅ GET /api/studentprofile/
@studentprofile_bp.route("/", methods=["GET"])
def get_all_profiles():
    profiles = mongo.db.studentProfiles.find()
    return jsonify([format_profile(p) for p in profiles]), 200
