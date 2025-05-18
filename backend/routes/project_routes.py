from flask import Blueprint, request, jsonify
from bson.objectid import ObjectId
from flask import current_app

project_bp = Blueprint('projects', __name__, url_prefix='/student/projects')

@project_bp.route('', methods=['POST'])
def add_project():
    from app import mongo  # ✅ Lazy import here
    data = request.json
    required_fields = ['student_id', 'title', 'description']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    result = mongo.db.projects.insert_one(data)
    data['_id'] = str(result.inserted_id)
    return jsonify(data), 201

@project_bp.route('/<student_id>', methods=['GET'])
def get_projects(student_id):
    from app import mongo  # ✅ Lazy import here
    projects = list(mongo.db.projects.find({'student_id': student_id}))
    for p in projects:
        p['_id'] = str(p['_id'])
    return jsonify(projects), 200

@project_bp.route('/<project_id>', methods=['PUT'])
def update_project(project_id):
    from app import mongo  # ✅ Lazy import here
    data = request.json
    mongo.db.projects.update_one({'_id': ObjectId(project_id)}, {'$set': data})
    return jsonify({'message': 'Updated'}), 200

@project_bp.route('/<project_id>', methods=['DELETE'])
def delete_project(project_id):
    from app import mongo  # ✅ Lazy import here
    mongo.db.projects.delete_one({'_id': ObjectId(project_id)})
    return jsonify({'message': 'Deleted'}), 200
