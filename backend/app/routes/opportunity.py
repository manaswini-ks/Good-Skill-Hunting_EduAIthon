from flask import Blueprint, jsonify, request
from app import mongo
from bson.objectid import ObjectId
from datetime import datetime

opportunity_bp = Blueprint('opportunity', __name__)

@opportunity_bp.route('/', methods=['GET'])
def get_opportunities():
    """Get all opportunities"""
    try:
        opportunities = list(mongo.db.opportunities.find())
        for opp in opportunities:
            opp['_id'] = str(opp['_id'])
        return jsonify(opportunities), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@opportunity_bp.route('/<opportunity_id>', methods=['GET'])
def get_opportunity(opportunity_id):
    """Get a specific opportunity"""
    try:
        opportunity = mongo.db.opportunities.find_one({'_id': ObjectId(opportunity_id)})
        if opportunity:
            opportunity['_id'] = str(opportunity['_id'])
            return jsonify(opportunity), 200
        return jsonify({'error': 'Opportunity not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@opportunity_bp.route('/', methods=['POST'])
def create_opportunity():
    """Create a new opportunity"""
    try:
        data = request.get_json()
        data['created_at'] = datetime.now().isoformat()
        data['updated_at'] = data['created_at']
        data['applicants'] = 0
        
        result = mongo.db.opportunities.insert_one(data)
        data['_id'] = str(result.inserted_id)
        
        return jsonify(data), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@opportunity_bp.route('/<opportunity_id>', methods=['PUT'])
def update_opportunity(opportunity_id):
    """Update an opportunity"""
    try:
        data = request.get_json()
        if '_id' in data:
            del data['_id']
            
        data['updated_at'] = datetime.now().isoformat()
        
        result = mongo.db.opportunities.update_one(
            {'_id': ObjectId(opportunity_id)},
            {'$set': data}
        )
        
        if result.matched_count:
            opportunity = mongo.db.opportunities.find_one({'_id': ObjectId(opportunity_id)})
            opportunity['_id'] = str(opportunity['_id'])
            return jsonify(opportunity), 200
        return jsonify({'error': 'Opportunity not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@opportunity_bp.route('/<opportunity_id>', methods=['DELETE'])
def delete_opportunity(opportunity_id):
    """Delete an opportunity"""
    try:
        result = mongo.db.opportunities.delete_one({'_id': ObjectId(opportunity_id)})
        if result.deleted_count:
            return jsonify({'message': 'Opportunity deleted successfully'}), 200
        return jsonify({'error': 'Opportunity not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@opportunity_bp.route('/search', methods=['GET'])
def search_opportunities():
    """Search opportunities with filters"""
    try:
        # Get search parameters
        query = request.args.get('query', '')
        category = request.args.get('category')
        type = request.args.get('type')
        
        # Build filter
        filter = {}
        if query:
            filter['$or'] = [
                {'title': {'$regex': query, '$options': 'i'}},
                {'description': {'$regex': query, '$options': 'i'}}
            ]
        if category:
            filter['category'] = category
        if type:
            filter['type'] = type
            
        opportunities = list(mongo.db.opportunities.find(filter))
        for opp in opportunities:
            opp['_id'] = str(opp['_id'])
            
        return jsonify(opportunities), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500 