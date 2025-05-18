from flask import Blueprint, jsonify, request, current_app
from app import mongo
from bson.objectid import ObjectId
from datetime import datetime
import os
from werkzeug.utils import secure_filename

student_bp = Blueprint('student', __name__)

# Configure upload paths
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
PROJECT_IMAGES_FOLDER = os.path.join(UPLOAD_FOLDER, 'project_images')
DOCS_FOLDER = os.path.join(UPLOAD_FOLDER, 'docs')
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
ALLOWED_DOC_EXTENSIONS = {'pdf', 'doc', 'docx'}

# Create upload directories if they don't exist
os.makedirs(PROJECT_IMAGES_FOLDER, exist_ok=True)
os.makedirs(DOCS_FOLDER, exist_ok=True)

def allowed_file(filename, allowed_extensions):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def save_uploaded_file(file, folder):
    if file and allowed_file(file.filename, ALLOWED_IMAGE_EXTENSIONS if 'images' in folder else ALLOWED_DOC_EXTENSIONS):
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{timestamp}_{filename}"
        filepath = os.path.join(folder, unique_filename)
        file.save(filepath)
        return unique_filename
    return None

@student_bp.route('/profile/<student_id>', methods=['GET'])
def get_profile(student_id):
    """Get student profile"""
    try:
        # Try to find by string ID first
        student = mongo.db.students.find_one({'student_id': student_id})

        # If not found, try ObjectId (for backward compatibility)
        if not student:
            try:
                student = mongo.db.students.find_one({'_id': ObjectId(student_id)})
            except:
                pass

                
            # Convert ObjectId to string for JSON serialization
            if '_id' in student:
                student['_id'] = str(student['_id'])
            return jsonify(student), 200
        else:
            # If student doesn't exist, create a new profile
            new_student = {
                'student_id': student_id,
                'fullName': '',
                'email': '',
                'location': '',
                'tags': [],
                'education': {
                    'current': '',
                    'past': []
                },
                'skills': [],
                'achievements': [],
                'socials': {
                    'github': '',
                    'linkedin': '',
                    'portfolio': ''
                }
            }
            result = mongo.db.students.insert_one(new_student)
            new_student['_id'] = str(result.inserted_id)
            return jsonify(new_student), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@student_bp.route('/profile/<student_id>', methods=['PUT'])
def update_profile(student_id):
    """Update student profile"""
    data = request.get_json()
    
    try:
        # Remove fields that shouldn't be updated directly
        if '_id' in data:
            del data['_id']
            
        # Try to update by string ID first
        result = mongo.db.students.update_one(
            {'student_id': student_id},
            {'$set': data}
        )
        
        # If not found, try ObjectId (for backward compatibility)
        if not result.matched_count:
            try:
                result = mongo.db.students.update_one(
                    {'_id': ObjectId(student_id)},
                    {'$set': data}
                )
            except:
                pass
        
        if result.matched_count:
            # Get the updated document
            student = mongo.db.students.find_one({'student_id': student_id})
            if not student:
                student = mongo.db.students.find_one({'_id': ObjectId(student_id)})
            
            if '_id' in student:
                student['_id'] = str(student['_id'])
            return jsonify(student), 200
        else:
            return jsonify({'error': 'Profile not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@student_bp.route('/applications/<student_id>', methods=['POST'])
def submit_application(student_id):
    """Submit an application for an opportunity"""
    if request.content_type and 'multipart/form-data' in request.content_type:
        data = {
            'message': request.form.get('message', ''),
            'opportunityId': request.form.get('opportunityId')
        }
        
        if 'resume' in request.files:
            resume_file = request.files['resume']
            data['resumeName'] = resume_file.filename
            data['resumeUrl'] = './uploads/' + resume_file.filename
    else:
        data = request.get_json()
    
    if not data or 'opportunityId' not in data:
        return jsonify({'error': 'Missing required data'}), 400
    
    try:
        student = mongo.db.students.find_one({'_id': ObjectId(student_id)})
        if not student:
            return jsonify({'error': 'Student not found'}), 404
            
        student_name = student.get('name', 'Student')
        
        application = {
            'opportunityId': data['opportunityId'],
            'studentId': student_id,
            'studentName': student_name,
            'message': data.get('message', ''),
            'resumeName': data.get('resumeName', ''),
            'status': 'pending',
            'appliedDate': datetime.now().isoformat()
        }
        
        result = mongo.db.applications.insert_one(application)
        application['_id'] = str(result.inserted_id)
        
        # Update the opportunity's applicant count
        mongo.db.opportunities.update_one(
            {'_id': ObjectId(data['opportunityId'])},
            {'$inc': {'applicants': 1}}
        )
        
        return jsonify(application), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@student_bp.route('/applications/<student_id>', methods=['GET'])
def get_applications(student_id):
    """Get all applications submitted by this student"""
    try:
        applications = list(mongo.db.applications.find({'studentId': student_id}))
        for app in applications:
            if '_id' in app:
                app['_id'] = str(app['_id'])
            
            # Get opportunity details
            if 'opportunityId' in app:
                try:
                    opportunity = mongo.db.opportunities.find_one({'_id': ObjectId(app['opportunityId'])})
                    if opportunity:
                        opportunity['_id'] = str(opportunity['_id'])
                        app['opportunity'] = opportunity
                except:
                    pass
                
        return jsonify(applications), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@student_bp.route('/projects/<student_id>', methods=['GET'])
def get_projects(student_id):
    """Get all projects for a student"""
    try:
        projects = list(mongo.db.projects.find({'student_id': student_id}))
        for project in projects:
            if '_id' in project:
                project['_id'] = str(project['_id'])
            
            # Add full URLs for images and docs
            if project.get('image_filename'):
                project['image_url'] = f"/uploads/project_images/{project['image_filename']}"
            if project.get('documentation_filename'):
                project['documentation_url'] = f"/uploads/docs/{project['documentation_filename']}"
                
        return jsonify(projects), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@student_bp.route('/projects', methods=['POST'])
def create_project():
    """Create a new project"""
    try:
        data = request.form.to_dict()
        
        # Handle file uploads
        if 'project_image' in request.files:
            image_filename = save_uploaded_file(request.files['project_image'], PROJECT_IMAGES_FOLDER)
            if image_filename:
                data['image_filename'] = image_filename
                
        if 'documentation' in request.files:
            doc_filename = save_uploaded_file(request.files['documentation'], DOCS_FOLDER)
            if doc_filename:
                data['documentation_filename'] = doc_filename
        
        # Parse tech stack from JSON string
        if 'tech_stack' in data:
            data['tech_stack'] = eval(data['tech_stack'])  # Safe since we control the input format
        
        # Add timestamps
        data['created_at'] = datetime.now().isoformat()
        data['updated_at'] = data['created_at']
        
        result = mongo.db.projects.insert_one(data)
        data['_id'] = str(result.inserted_id)
        
        # Add URLs for frontend
        if 'image_filename' in data:
            data['image_url'] = f"/uploads/project_images/{data['image_filename']}"
        if 'documentation_filename' in data:
            data['documentation_url'] = f"/uploads/docs/{data['documentation_filename']}"
            
        return jsonify(data), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@student_bp.route('/projects/<project_id>', methods=['PUT'])
def update_project(project_id):
    """Update a project"""
    try:
        data = request.form.to_dict()
        
        # Handle file uploads
        if 'project_image' in request.files:
            image_filename = save_uploaded_file(request.files['project_image'], PROJECT_IMAGES_FOLDER)
            if image_filename:
                data['image_filename'] = image_filename
                
        if 'documentation' in request.files:
            doc_filename = save_uploaded_file(request.files['documentation'], DOCS_FOLDER)
            if doc_filename:
                data['documentation_filename'] = doc_filename
        
        # Parse tech stack from JSON string
        if 'tech_stack' in data:
            data['tech_stack'] = eval(data['tech_stack'])
        
        # Add update timestamp
        data['updated_at'] = datetime.now().isoformat()
        
        # Remove _id if present
        if '_id' in data:
            del data['_id']
        
        result = mongo.db.projects.update_one(
            {'_id': ObjectId(project_id)},
            {'$set': data}
        )
        
        if result.matched_count:
            # Get the updated document
            project = mongo.db.projects.find_one({'_id': ObjectId(project_id)})
            if project:
                project['_id'] = str(project['_id'])
                # Add URLs for frontend
                if project.get('image_filename'):
                    project['image_url'] = f"/uploads/project_images/{project['image_filename']}"
                if project.get('documentation_filename'):
                    project['documentation_url'] = f"/uploads/docs/{project['documentation_filename']}"
            return jsonify(project), 200
        return jsonify({'error': 'Project not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@student_bp.route('/projects/<project_id>', methods=['DELETE'])
def delete_project(project_id):
    """Delete a project"""
    try:
        # Get project first to delete associated files
        project = mongo.db.projects.find_one({'_id': ObjectId(project_id)})
        if project:
            # Delete associated files
            if project.get('image_filename'):
                image_path = os.path.join(PROJECT_IMAGES_FOLDER, project['image_filename'])
                if os.path.exists(image_path):
                    os.remove(image_path)
                    
            if project.get('documentation_filename'):
                doc_path = os.path.join(DOCS_FOLDER, project['documentation_filename'])
                if os.path.exists(doc_path):
                    os.remove(doc_path)
            
            # Delete project from database
            result = mongo.db.projects.delete_one({'_id': ObjectId(project_id)})
            if result.deleted_count:
                return jsonify({'message': 'Project deleted successfully'}), 200
                
        return jsonify({'error': 'Project not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500
