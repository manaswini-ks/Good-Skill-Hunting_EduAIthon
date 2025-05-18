from flask import Blueprint, request, jsonify
from datetime import datetime
import os
from Groq import Groq

# MongoDB should be imported from wherever you're managing db
from your_app import db  # adjust this to your actual DB import

tech_mentor_bp = Blueprint('tech_mentor', __name__)

# Initialize Groq client
groq_client = Groq(
    api_key=os.getenv("GROQ_API_KEY", "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")
)

@tech_mentor_bp.route('/api/tech-mentor', methods=['POST'])
def tech_mentor():
    if request.is_json:
        data = request.get_json()
    elif request.form:
        data = request.form
    else:
        data = request.args
    
    user_query = data.get('query')
    
    if not user_query:
        return jsonify(success=False, message="Query parameter is required"), 400
    
    try:
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
            model="deepseek-r1-distill-llama-70b"
        )

        ai_response = chat_completion.choices[0].message.content

        # Save to MongoDB
        # qa_entry = {
        #     "query": user_query,
        #     "response": ai_response,
        #     "createdAt": datetime.now()
        # }
        # db.tech_mentoring.insert_one(qa_entry)

        return jsonify(success=True, data={"response": ai_response}), 200

    except Exception as e:
        return jsonify(success=False, message="Error calling Groq API", error=str(e))
    