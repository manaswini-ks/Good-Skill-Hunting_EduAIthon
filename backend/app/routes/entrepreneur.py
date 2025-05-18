from flask import Blueprint, jsonify, request
from app import mongo
from bson.objectid import ObjectId
from datetime import datetime
import logging

entrepreneur_bp = Blueprint('entrepreneur', __name__)

@entrepreneur_bp.route('/profile/<entrepreneur_id>', methods=['GET'])
def get_profile(entrepreneur_id):
    """Get entrepreneur profile"""
    try:
        # Try to find by string ID first
        entrepreneur = mongo.db.entrepreneurs.find_one({'entrepreneur_id': entrepreneur_id})
        
        # If not found, try ObjectId (for backward compatibility)
        if not entrepreneur:
            try:
                entrepreneur = mongo.db.entrepreneurs.find_one({'_id': ObjectId(entrepreneur_id)})
            except:
                pass

        if entrepreneur:
            # Convert ObjectId to string for JSON serialization
            if '_id' in entrepreneur:
                entrepreneur['_id'] = str(entrepreneur['_id'])
            return jsonify(entrepreneur), 200
        else:
            # If entrepreneur doesn't exist, create a new profile
            new_entrepreneur = {
                'entrepreneur_id': entrepreneur_id,
                'fullName': '',
                'email': '',
                'companyName': '',
                'companyDescription': '',
                'position': '',
                'industries': [],
                'interests': [],
                'stage': '',
                'achievements': [],
                'socials': {
                    'linkedin': '',
                    'twitter': '',
                    'website': ''
                }
            }
            result = mongo.db.entrepreneurs.insert_one(new_entrepreneur)
            new_entrepreneur['_id'] = str(result.inserted_id)
            return jsonify(new_entrepreneur), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@entrepreneur_bp.route('/profile/<entrepreneur_id>', methods=['PUT'])
def update_profile(entrepreneur_id):
    """Update entrepreneur profile"""
    data = request.get_json()
    
    try:
        # Remove fields that shouldn't be updated directly
        if '_id' in data:
            del data['_id']
            
        # Try to update by string ID first
        result = mongo.db.entrepreneurs.update_one(
            {'entrepreneur_id': entrepreneur_id},
            {'$set': data}
        )
        
        # If not found, try ObjectId (for backward compatibility)
        if not result.matched_count:
            try:
                result = mongo.db.entrepreneurs.update_one(
                    {'_id': ObjectId(entrepreneur_id)},
                    {'$set': data}
                )
            except:
                pass
        
        if result.matched_count:
            # Get the updated document
            entrepreneur = mongo.db.entrepreneurs.find_one({'entrepreneur_id': entrepreneur_id})
            if not entrepreneur:
                entrepreneur = mongo.db.entrepreneurs.find_one({'_id': ObjectId(entrepreneur_id)})
            
            if '_id' in entrepreneur:
                entrepreneur['_id'] = str(entrepreneur['_id'])
            return jsonify(entrepreneur), 200
        else:
            return jsonify({'error': 'Profile not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Opportunity management endpoints
@entrepreneur_bp.route('/opportunities/<entrepreneur_id>', methods=['GET'])
def get_opportunities(entrepreneur_id):
    """Get all opportunities posted by an entrepreneur"""
    try:
        # Search for opportunities using either entrepreneur_id or entrepreneurId
        opportunities = list(mongo.db.opportunities.find({
            '$or': [
                {'entrepreneur_id': entrepreneur_id},
                {'entrepreneurId': entrepreneur_id}
            ]
        }))
        
        for opp in opportunities:
            if '_id' in opp:
                opp['_id'] = str(opp['_id'])
            
            # Get application count
            application_count = mongo.db.applications.count_documents({'opportunity_id': str(opp['_id'])})
            opp['applicants'] = application_count
                
        return jsonify(opportunities), 200
    except Exception as e:
        logging.error(f"Error getting opportunities: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@entrepreneur_bp.route('/opportunities/<entrepreneur_id>', methods=['POST'])
def create_opportunity(entrepreneur_id):
    """Create a new opportunity"""
    try:
        logging.info(f"Creating opportunity for entrepreneur ID: {entrepreneur_id}")
        
        # Check if entrepreneur exists
        entrepreneur = mongo.db.entrepreneurs.find_one({'_id': ObjectId(entrepreneur_id)})
        if not entrepreneur:
            logging.warning(f"Entrepreneur with ID {entrepreneur_id} not found")
            return jsonify({'error': 'Entrepreneur not found'}), 404
        
        data = request.get_json()
        logging.info(f"Received data: {data}")
        
        # Get company name from entrepreneur profile
        company_name = entrepreneur.get('company', 'Company Name')
        
        # Prepare opportunity data
        opportunity = {
            'title': data.get('title'),
            'type': data.get('type', 'Internship'),
            'skills': data.get('skills', []),
            'description': data.get('description', ''),
            'duration': data.get('duration', ''),
            'location': data.get('location', 'Remote'),
            'stipend': data.get('stipend', ''),
            'postedDate': datetime.now().strftime('%Y-%m-%d'),
            'applicants': 0,
            'company': company_name,
            'entrepreneur_id': entrepreneur_id,  # Add snake_case version for consistency
            'entrepreneurId': entrepreneur_id
        }
        
        result = mongo.db.opportunities.insert_one(opportunity)
        opportunity['_id'] = str(result.inserted_id)
        
        return jsonify(opportunity), 201
    except Exception as e:
        logging.error(f"Error in create_opportunity: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@entrepreneur_bp.route('/opportunities/<entrepreneur_id>/<opportunity_id>', methods=['PUT'])
def update_opportunity(entrepreneur_id, opportunity_id):
    """Update an existing opportunity"""
    data = request.get_json()
    
    try:
        # First check if the opportunity belongs to this entrepreneur
        opportunity = mongo.db.opportunities.find_one({
            '_id': ObjectId(opportunity_id),
            '$or': [
                {'entrepreneur_id': entrepreneur_id},
                {'entrepreneurId': entrepreneur_id}
            ]
        })
        
        if not opportunity:
            return jsonify({'error': 'Opportunity not found or not authorized'}), 404
        
        # Prepare update data
        update_data = {
            'title': data.get('title'),
            'type': data.get('type'),
            'skills': data.get('skills'),
            'description': data.get('description'),
            'duration': data.get('duration'),
            'location': data.get('location'),
            'stipend': data.get('stipend')
        }
        
        # Remove None values
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        result = mongo.db.opportunities.update_one(
            {'_id': ObjectId(opportunity_id)},
            {'$set': update_data}
        )
        
        if result.modified_count:
            updated_opportunity = mongo.db.opportunities.find_one({'_id': ObjectId(opportunity_id)})
            updated_opportunity['_id'] = str(updated_opportunity['_id'])
            return jsonify(updated_opportunity), 200
        else:
            return jsonify({'message': 'No changes made'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@entrepreneur_bp.route('/opportunities/<entrepreneur_id>/<opportunity_id>', methods=['DELETE'])
def delete_opportunity(entrepreneur_id, opportunity_id):
    """Delete an opportunity"""
    try:
        # First check if the opportunity belongs to this entrepreneur
        opportunity = mongo.db.opportunities.find_one({
            '_id': ObjectId(opportunity_id),
            '$or': [
                {'entrepreneur_id': entrepreneur_id},
                {'entrepreneurId': entrepreneur_id}
            ]
        })
        
        if not opportunity:
            return jsonify({'error': 'Opportunity not found or not authorized'}), 404
        
        result = mongo.db.opportunities.delete_one({'_id': ObjectId(opportunity_id)})
        
        if result.deleted_count:
            return jsonify({'message': 'Opportunity deleted successfully'}), 200
        else:
            return jsonify({'error': 'Failed to delete opportunity'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@entrepreneur_bp.route('/applications/<opportunity_id>', methods=['GET'])
def get_applications(opportunity_id):
    """Get all applications for a specific opportunity"""
    try:
        applications = list(mongo.db.applications.find({'opportunity_id': opportunity_id}))
        for app in applications:
            if '_id' in app:
                app['_id'] = str(app['_id'])
            
            # Get student details
            if 'student_id' in app:
                student = mongo.db.students.find_one({'_id': ObjectId(app['student_id'])})
                if student:
                    student['_id'] = str(student['_id'])
                    app['student'] = student
                
        return jsonify(applications), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Add route for getting applications with both entrepreneur and opportunity IDs
@entrepreneur_bp.route('/opportunities/<entrepreneur_id>/<opportunity_id>/applications', methods=['GET'])
def get_opportunity_applications(entrepreneur_id, opportunity_id):
    """Get all applications for a specific opportunity with entrepreneur verification"""
    try:
        # First check if the opportunity belongs to this entrepreneur
        try:
            opp_obj_id = ObjectId(opportunity_id)
            opportunity = mongo.db.opportunities.find_one({
                '_id': opp_obj_id,
                '$or': [
                    {'entrepreneur_id': entrepreneur_id},
                    {'entrepreneurId': entrepreneur_id}
                ]
            })
        except Exception as e:
            logging.error(f"Error converting opportunity_id to ObjectId: {str(e)}")
            return jsonify({'error': 'Invalid opportunity ID format'}), 400
        
        if not opportunity:
            return jsonify({'error': 'Opportunity not found or not authorized'}), 404
        
        applications = list(mongo.db.applications.find({'opportunity_id': opportunity_id}))
        for app in applications:
            if '_id' in app:
                app['_id'] = str(app['_id'])
            
            # Get student details with projects for application
            if 'student_id' in app:
                try:
                    student_obj_id = ObjectId(app['student_id'])
                    student = mongo.db.students.find_one({'_id': student_obj_id})
                    
                    if not student:
                        # Try alternative field
                        student = mongo.db.students.find_one({'student_id': app['student_id']})
                        
                    if student:
                        if '_id' in student:
                            student['_id'] = str(student['_id'])
                        
                        # Ensure basic fields exist
                        if 'fullName' not in student:
                            student['fullName'] = 'Unknown Student'
                        if 'email' not in student:
                            student['email'] = ''
                            
                        app['student'] = student
                        
                        # Get student's projects
                        projects = []
                        try:
                            project_query = {'student_id': str(student['_id'])}
                            projects = list(mongo.db.projects.find(project_query))
                            for proj in projects:
                                if '_id' in proj:
                                    proj['_id'] = str(proj['_id'])
                        except Exception as proj_err:
                            logging.error(f"Error fetching projects: {str(proj_err)}")
                            projects = []
                            
                        app['student']['projects'] = projects
                except Exception as student_err:
                    logging.error(f"Error fetching student data: {str(student_err)}")
                    # Create placeholder student data
                    app['student'] = {
                        'fullName': 'Unknown Student',
                        'email': '',
                        'projects': []
                    }
                
        return jsonify(applications), 200
    except Exception as e:
        logging.error(f"Error getting applications: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@entrepreneur_bp.route('/applications/<entrepreneur_id>/<application_id>/status', methods=['PUT'])
def update_application_status(entrepreneur_id, application_id):
    """Update an application's status (accept/reject)"""
    data = request.get_json()
    
    if 'status' not in data:
        return jsonify({'error': 'Status field is required'}), 400
        
    status = data['status']
    if status not in ['pending', 'accepted', 'rejected']:
        return jsonify({'error': 'Invalid status value'}), 400
    
    try:
        # Get the application
        application = mongo.db.applications.find_one({'_id': ObjectId(application_id)})
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        
        # Get the opportunity to verify ownership
        opportunity = mongo.db.opportunities.find_one({
            '_id': ObjectId(application.get('opportunity_id')),
            '$or': [
                {'entrepreneur_id': entrepreneur_id},
                {'entrepreneurId': entrepreneur_id}
            ]
        })
        
        if not opportunity:
            return jsonify({'error': 'Not authorized to update this application'}), 403
        
        # Update the application status
        result = mongo.db.applications.update_one(
            {'_id': ObjectId(application_id)},
            {'$set': {'status': status, 'updated_at': datetime.now().isoformat()}}
        )
        
        if result.modified_count:
            return jsonify({'message': f'Application {status}'}), 200
        else:
            return jsonify({'message': 'No changes made'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
