from flask import Blueprint, jsonify, request, current_app
from app import mongo
from bson.objectid import ObjectId
from datetime import datetime
import os
from werkzeug.utils import secure_filename
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Try to import Groq, with fallback if not available
try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    logging.warning("Groq package not installed, AI features will be limited")
    GROQ_AVAILABLE = False

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

# Initialize Groq client with API key
groq_client = None
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if GROQ_AVAILABLE and GROQ_API_KEY:
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
        logging.info("Groq client initialized successfully")
    except Exception as e:
        logging.error(f"Failed to initialize Groq client: {e}")
        groq_client = None
else:
    if not GROQ_API_KEY:
        logging.warning("GROQ_API_KEY environment variable not set")
    if not GROQ_AVAILABLE:
        logging.warning("Groq package not available")

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

        if student:
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
def get_student_applications(student_id):
    try:
        # Validate student ID
        if not ObjectId.is_valid(student_id):
            return jsonify({"error": "Invalid student ID format"}), 400

        # Fetch student applications
        applications = list(mongo.db.applications.find({"studentId": student_id}))
        
        # Get opportunity details for each application
        for app in applications:
            opportunity = mongo.db.opportunities.find_one({"_id": ObjectId(app["opportunityId"])})
            
            if opportunity:
                app["opportunity"] = {
                    "id": str(opportunity["_id"]),
                    "title": opportunity.get("title", "Unknown title"),
                    "company": opportunity.get("company", "Unknown company"),
                    "description": opportunity.get("description", ""),
                    "type": opportunity.get("type", "Unknown"),
                    "location": opportunity.get("location", "Remote"),
                    "deadline": opportunity.get("deadline", "No deadline")
                }
            
            # Convert ObjectId to string for JSON serialization
            app["_id"] = str(app["_id"])
            app["studentId"] = str(app["studentId"])
            app["opportunityId"] = str(app["opportunityId"])
                
        return jsonify(applications), 200

    except Exception as e:
        logging.error(f"Error fetching student applications: {e}")
        return jsonify({"error": str(e)}), 500

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

@student_bp.route("/api/tech-mentor", methods=["POST"])
def tech_mentor():
    # Change to correct endpoint URL format
    return handle_tech_mentor_request()

@student_bp.route("/tech-mentor", methods=["POST"])
def tech_mentor_alt():
    # Alternative URL format for flexibility
    return handle_tech_mentor_request()

def handle_tech_mentor_request():
    # Support JSON, form data, and query parameters
    if request.is_json:
        data = request.get_json()
    elif request.form:
        data = request.form.to_dict()  # Convert to dict for easier handling
    else:
        data = request.args  # fallback to query params
    
    user_query = data.get("query")
    
    if not user_query:
        return jsonify(success=False, message="Query parameter is required"), 400
    
    # Create the entry first so we can record the query even if the API fails
    qa_entry = {
        "query": user_query,
        "createdAt": datetime.now()
    }
    
    # Check if AI services are available
    if not GROQ_AVAILABLE:
        fallback_message = "AI services are not available at the moment. Please try again later."
        qa_entry["response"] = fallback_message
        qa_entry["using_fallback"] = True
        mongo.db.tech_mentoring.insert_one(qa_entry)
        return jsonify(success=False, message="AI service unavailable", data={"response": fallback_message}), 503
    
    # Check if API key is configured
    if not GROQ_API_KEY:
        fallback_message = "AI services are not properly configured. Please contact the administrator."
        qa_entry["response"] = fallback_message
        qa_entry["using_fallback"] = True
        mongo.db.tech_mentoring.insert_one(qa_entry)
        return jsonify(success=False, message="AI service misconfigured", data={"response": fallback_message}), 503
    
    # Check if Groq client was initialized
    if not groq_client:
        fallback_message = "AI services initialization failed. Please try again later."
        qa_entry["response"] = fallback_message
        qa_entry["using_fallback"] = True
        mongo.db.tech_mentoring.insert_one(qa_entry)
        return jsonify(success=False, message="AI client unavailable", data={"response": fallback_message}), 503
            
    try:
        # Call the Groq API with proper error handling
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "I'd like you to act as my tech mentor. You're an expert with deep knowledge of software engineering, system design, web development, and industry best practices. You have access to a vast amount of up-to-date information and resources across programming languages, frameworks, design principles, deployment strategies, and career roadmapping. I will ask you questions about software engineering, and you will provide me with detailed explanations, code examples, and resources to help me understand the concepts better. You will also guide me in my career development by suggesting learning paths, resources, and best practices."
                },
                {
                    "role": "user",
                    "content": user_query
                }
            ],
            model="deepseek-r1-distill-llama-70b",
            temperature=0.7,
            max_tokens=2000
        )
        
        # Get the response
        ai_response = chat_completion.choices[0].message.content
        
        # Update and save the Q&A to MongoDB
        qa_entry["response"] = ai_response
        qa_entry["using_fallback"] = False
        qa_entry["success"] = True
        mongo.db.tech_mentoring.insert_one(qa_entry)
        
        return jsonify(success=True, data={"response": ai_response}), 200
        
    except Exception as e:
        error_msg = str(e)
        logging.error(f"Error calling Groq API: {error_msg}")
        
        # Create a detailed fallback response
        fallback_message = "Sorry, I encountered an error while processing your request. Please try again later."
        qa_entry["response"] = fallback_message
        qa_entry["error"] = error_msg
        qa_entry["using_fallback"] = True
        qa_entry["success"] = False
        mongo.db.tech_mentoring.insert_one(qa_entry)
        
        return jsonify(success=False, message="Error calling AI API", error=error_msg, data={"response": fallback_message}), 500
