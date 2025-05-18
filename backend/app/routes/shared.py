from flask import Blueprint, jsonify, request
from app import mongo
from bson.json_util import dumps
from bson.objectid import ObjectId
import json
from datetime import datetime
import os
from pymongo import MongoClient
from flask_cors import CORS

shared_bp = Blueprint('shared', __name__)

# Opportunities endpoints
@shared_bp.route('/opportunities', methods=['GET'])
def get_all_opportunities():
    """Get all opportunities from the database"""
    try:
        opportunities = list(mongo.db.opportunities.find())
        # Convert ObjectId to string for JSON serialization
        for opportunity in opportunities:
            if '_id' in opportunity:
                opportunity['_id'] = str(opportunity['_id'])
                
        return jsonify(opportunities), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@shared_bp.route('/opportunities/<opportunity_id>', methods=['GET'])
def get_opportunity(opportunity_id):
    """Get a specific opportunity by ID"""
    try:
        # First try to find by ObjectId
        try:
            opportunity = mongo.db.opportunities.find_one({'_id': ObjectId(opportunity_id)})
        except:
            # If not a valid ObjectId, try finding by string ID
            opportunity = mongo.db.opportunities.find_one({'_id': opportunity_id})
            
        if opportunity:
            # Convert ObjectId to string
            if '_id' in opportunity and isinstance(opportunity['_id'], ObjectId):
                opportunity['_id'] = str(opportunity['_id'])
            return jsonify(opportunity), 200
        else:
            return jsonify({'error': 'Opportunity not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@shared_bp.route('/mentors', methods=['GET'])
def get_all_mentors():
    """Get all mentors from the database"""
    try:
        mentors = list(mongo.db.mentors.find())
        # Convert ObjectId to string for JSON serialization
        for mentor in mentors:
            if '_id' in mentor:
                mentor['_id'] = str(mentor['_id'])
                
        # If no mentors found, return demo data
        if not mentors:
            mentors = [
                {
                    '_id': '1',
                    'name': 'Sarah Rodriguez',
                    'bio': '15+ years experience in scaling tech startups. Specialized in product strategy and go-to-market execution.',
                    'availability': 'Weekdays 2-6 PM EST',
                    'successStories': 'Helped 3 startups secure Series A funding. Mentored 20+ entrepreneurs in product strategy.',
                    'expertise': ['Product Strategy', 'Go-to-Market', 'Funding'],
                    'rating': 4.9,
                    'imageUrl': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
                },
                {
                    '_id': '2',
                    'name': 'James Smith',
                    'bio': '10+ years in EdTech and AI startups. Expert in innovation and product development.',
                    'availability': 'Weekends 10 AM - 4 PM IST',
                    'successStories': 'Supported 15+ students in launching AI-driven tools and secured incubation offers.',
                    'expertise': ['AI', 'EdTech', 'Product Development'],
                    'rating': 4.7,
                    'imageUrl': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
                },
                {
                    '_id': '3',
                    'name': 'Aisha Khan',
                    'bio': 'Serial entrepreneur with expertise in SaaS and marketplace startups. Focus on growth and scaling.',
                    'availability': 'Tuesdays and Thursdays, 9 AM - 12 PM GMT',
                    'successStories': 'Founded 3 successful startups with 2 exits. Mentored over 30 early-stage founders.',
                    'expertise': ['SaaS', 'Growth Strategy', 'Fundraising'],
                    'rating': 4.8,
                    'imageUrl': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
                },
                {
                    '_id': '4',
                    'name': 'Michael Chen',
                    'bio': 'Technical leader with background in scaling engineering teams at Fortune 500 companies and startups.',
                    'availability': 'Mondays and Fridays, 6 PM - 9 PM PST',
                    'successStories': 'Helped 10+ startups build scalable architecture. Mentored 25+ engineers to leadership roles.',
                    'expertise': ['Engineering Leadership', 'System Architecture', 'Team Building'],
                    'rating': 4.9,
                    'imageUrl': 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
                }
            ]
            
        return jsonify(mentors), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@shared_bp.route('/mentors/<mentor_id>', methods=['GET'])
def get_mentor(mentor_id):
    """Get a specific mentor by ID"""
    try:
        # First try to find by ObjectId
        try:
            mentor = mongo.db.mentors.find_one({'_id': ObjectId(mentor_id)})
        except:
            # If not a valid ObjectId, try finding by string ID
            mentor = mongo.db.mentors.find_one({'_id': mentor_id})
            
        if mentor:
            # Convert ObjectId to string
            if '_id' in mentor and isinstance(mentor['_id'], ObjectId):
                mentor['_id'] = str(mentor['_id'])
            return jsonify(mentor), 200
        else:
            # Return demo data for testing
            if mentor_id == '1':
                return jsonify({
                    '_id': '1',
                    'name': 'Sarah Rodriguez',
                    'bio': '15+ years experience in scaling tech startups. Specialized in product strategy and go-to-market execution.',
                    'availability': 'Weekdays 2-6 PM EST',
                    'successStories': 'Helped 3 startups secure Series A funding. Mentored 20+ entrepreneurs in product strategy.',
                    'expertise': ['Product Strategy', 'Go-to-Market', 'Funding'],
                    'rating': 4.9,
                    'imageUrl': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
                }), 200
            elif mentor_id == '2':
                return jsonify({
                    '_id': '2',
                    'name': 'James Smith',
                    'bio': '10+ years in EdTech and AI startups. Expert in innovation and product development.',
                    'availability': 'Weekends 10 AM - 4 PM IST',
                    'successStories': 'Supported 15+ students in launching AI-driven tools and secured incubation offers.',
                    'expertise': ['AI', 'EdTech', 'Product Development'],
                    'rating': 4.7,
                    'imageUrl': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
                }), 200
            elif mentor_id == '3':
                return jsonify({
                    '_id': '3',
                    'name': 'Aisha Khan',
                    'bio': 'Serial entrepreneur with expertise in SaaS and marketplace startups. Focus on growth and scaling.',
                    'availability': 'Tuesdays and Thursdays, 9 AM - 12 PM GMT',
                    'successStories': 'Founded 3 successful startups with 2 exits. Mentored over 30 early-stage founders.',
                    'expertise': ['SaaS', 'Growth Strategy', 'Fundraising'],
                    'rating': 4.8,
                    'imageUrl': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
                }), 200
            elif mentor_id == '4':
                return jsonify({
                    '_id': '4',
                    'name': 'Michael Chen',
                    'bio': 'Technical leader with background in scaling engineering teams at Fortune 500 companies and startups.',
                    'availability': 'Mondays and Fridays, 6 PM - 9 PM PST',
                    'successStories': 'Helped 10+ startups build scalable architecture. Mentored 25+ engineers to leadership roles.',
                    'expertise': ['Engineering Leadership', 'System Architecture', 'Team Building'],
                    'rating': 4.9,
                    'imageUrl': 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
                }), 200
            else:
                return jsonify({'error': 'Mentor not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

client = MongoClient("mongodb+srv://admins:4postr0phe@stock.sxr4y.mongodb.net/?retryWrites=true&w=majority&appName=Stock")
db = client['qa_db']
questions_col = db.questions

@shared_bp.after_request
def add_headers(response):
    response.headers['Content-Type'] = 'application/json'
    return response

@shared_bp.errorhandler(404)
def not_found(e):
    return jsonify({
        "success": False,
        "message": "Resource not found"
    }), 404

@shared_bp.errorhandler(500)
def server_error(e):
    return jsonify({
        "success": False,
        "message": "Internal server error"
    }), 500

def serialize_question(q):
    q['_id'] = str(q['_id'])
    if 'answers' in q:
        for a in q['answers']:
            a['createdAt'] = a.get('createdAt', datetime.now()).isoformat()
    q['createdAt'] = q.get('createdAt', datetime.now()).isoformat()
    return q

# @shared_bp.route('/')
# def home():
#     return jsonify({
#         "success": True,
#         "message": "Flask API is running. Try /api/questions"
#     })

@shared_bp.route('/api/questions', methods=['POST'])
def create_question():
    if not request.is_json:
        return jsonify({
            "success": False,
            "message": "Request must be JSON"
        }), 400

    data = request.get_json()
    title = data.get('title')
    description = data.get('description')

    if not title or not description:
        return jsonify({
            "success": False,
            "message": "Title and description are required"
        }), 400

    question = {
        "title": title,
        "description": description,
        "createdAt": datetime.now(),
        "answers": []
    }
    
    try:
        result = questions_col.insert_one(question)
        question['_id'] = str(result.inserted_id)
        return jsonify({
            "success": True,
            "data": serialize_question(question)
        }), 201
    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Failed to create question",
            "error": str(e)
        }), 500

@shared_bp.route('/api/questions', methods=['GET'])
def get_all_questions():
    try:
        questions = list(questions_col.find())
        return jsonify({
            "success": True,
            "data": [serialize_question(q) for q in questions]
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Failed to fetch questions",
            "error": str(e)
        }), 500

@shared_bp.route('/api/questions/<string:question_id>', methods=['GET'])
def get_question(question_id):
    try:
        question = questions_col.find_one({"_id": ObjectId(question_id)})
        if not question:
            return jsonify({
                "success": False,
                "message": "Question not found"
            }), 404
        return jsonify({
            "success": True,
            "data": serialize_question(question)
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Invalid question ID",
            "error": str(e)
        }), 400

@shared_bp.route('/api/questions/<string:question_id>/answers', methods=['POST'])
def add_answer_to_question(question_id):
    if not request.is_json:
        return jsonify({
            "success": False,
            "message": "Request must be JSON"
        }), 400

    data = request.get_json()
    description = data.get('description')

    if not description:
        return jsonify({
            "success": False,
            "message": "Description is required for the answer"
        }), 400

    answer = {
        "description": description,
        "createdAt": datetime.now()
    }

    try:
        result = questions_col.update_one(
            {"_id": ObjectId(question_id)},
            {"$push": {"answers": answer}}
        )
        if result.modified_count == 0:
            return jsonify({
                "success": False,
                "message": "Question not found"
            }), 404
        return jsonify({
            "success": True,
            "message": "Answer added successfully",
            "answer": answer
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Invalid question ID",
            "error": str(e)
        }), 400

@shared_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify server status"""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat()
    }), 200