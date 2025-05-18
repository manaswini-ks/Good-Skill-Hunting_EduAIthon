from flask import Flask, request, jsonify, Blueprint
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
from pymongo import MongoClient
from bson import ObjectId

match_bp = Blueprint('match', __name__)

# Load sentence embedding model
embed_model = SentenceTransformer("intfloat/e5-small-v2")

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["eduspark"]
students_collection = db["students"]
mentors_collection = db["mentors"]

# Helper: Convert array of strings to single clean text
def list_to_text(lst):
    return " ".join(lst).lower()

# Fetch mentor profiles
def fetch_mentors():
    mentors = []
    for doc in mentors_collection.find({}, {"_id": 1, "expertise": 1}):
        expertise = list_to_text(doc.get("expertise", []))
        mentors.append({
            "id": str(doc["_id"]),
            "profile_text": expertise
        })
    return mentors

# Fetch student profile
def fetch_student_profile(student_id):
    try:
        # Try with ObjectId first
        try:
            oid = ObjectId(student_id)
            doc = students_collection.find_one({"_id": oid}, {"interests": 1})
        except:
            # If that fails, try with string ID
            doc = students_collection.find_one({"id": student_id}, {"interests": 1})
            
        if doc:
            return list_to_text(doc.get("interests", []))
        return ""
    except Exception as e:
        print(f"Fetch Error: {e}")
        return ""

# Match route
@match_bp.route('/', methods=['POST'])
def match_mentor():
    try:
        data = request.get_json()
        student_id = data.get("student_id")

        if not student_id:
            return jsonify({"error": "student_id is required"}), 400

        student_profile = fetch_student_profile(student_id)
        if not student_profile:
            return jsonify({"error": "Student profile not found"}), 404

        mentors = fetch_mentors()
        if not mentors:
            return jsonify({"error": "No mentors available"}), 404

        mentor_texts = [m["profile_text"] for m in mentors]

        # TF-IDF vectorization
        tfidf = TfidfVectorizer()
        tfidf_matrix = tfidf.fit_transform([student_profile] + mentor_texts)
        student_vec = tfidf_matrix[0]
        mentor_vecs = tfidf_matrix[1:]
        tfidf_scores = cosine_similarity(student_vec, mentor_vecs)[0]

        # Sentence Embedding similarity
        mentor_embeddings = embed_model.encode(mentor_texts, normalize_embeddings=True)
        student_embedding = embed_model.encode([student_profile], normalize_embeddings=True)
        embed_scores = cosine_similarity(student_embedding, mentor_embeddings)[0]

        # Combine scores (weighted)
        final_scores = 0.6 * embed_scores + 0.4 * tfidf_scores

        # Rank mentors
        matches = sorted([
            {"mentor_id": mentors[i]["id"], "similarity_score": float(final_scores[i])}
            for i in range(len(mentors))
        ], key=lambda x: x["similarity_score"], reverse=True)

        return jsonify({"matches": matches})

    except Exception as e:
        return jsonify({"error": str(e)}), 500