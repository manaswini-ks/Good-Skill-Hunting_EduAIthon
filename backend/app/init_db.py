from flask import Flask
from app import mongo, create_app
from werkzeug.security import generate_password_hash
from datetime import datetime
from bson.objectid import ObjectId

def init_db():
    """Initialize the database with sample data if collections are empty"""
    app = create_app()
    
    with app.app_context():
        # Check if we have entrepreneurs
        if mongo.db.entrepreneurs.count_documents({}) == 0:
            print("Creating sample entrepreneur...")
            
            # Create a sample entrepreneur
            entrepreneur_id = ObjectId()
            
            entrepreneur = {
                "_id": entrepreneur_id,
                "email": "entrepreneur@example.com",
                "password": generate_password_hash("password"),
                "name": "Sample Entrepreneur",
                "phone": "1234567890",
                "company": "Sample Company",
                "industry": "Technology",
                "stage": "Early-stage",
                "mentors": [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            mongo.db.entrepreneurs.insert_one(entrepreneur)
            print(f"Created entrepreneur with ID: {entrepreneur_id}")
            
            # Create some sample opportunities
            if mongo.db.opportunities.count_documents({}) == 0:
                print("Creating sample opportunities...")
                
                opportunities = [
                    {
                        "title": "Frontend Developer Internship",
                        "type": "Internship",
                        "skills": ["React", "JavaScript", "CSS"],
                        "description": "Looking for a frontend developer with React experience.",
                        "duration": "3 months",
                        "location": "Remote",
                        "stipend": "₹10,000/month",
                        "postedDate": datetime.now().strftime('%Y-%m-%d'),
                        "applicants": 0,
                        "company": "Sample Company",
                        "entrepreneurId": str(entrepreneur_id)
                    },
                    {
                        "title": "Backend Developer Role",
                        "type": "Part-time",
                        "skills": ["Node.js", "Express", "MongoDB"],
                        "description": "Join our team as a backend developer.",
                        "duration": "6 months",
                        "location": "Hybrid",
                        "stipend": "₹15,000/month",
                        "postedDate": datetime.now().strftime('%Y-%m-%d'),
                        "applicants": 0,
                        "company": "Sample Company",
                        "entrepreneurId": str(entrepreneur_id)
                    }
                ]
                
                result = mongo.db.opportunities.insert_many(opportunities)
                print(f"Created {len(result.inserted_ids)} sample opportunities")
        else:
            print("Database already has entrepreneurs. Skipping initialization.")
            
        # Check if we have students
        if mongo.db.students.count_documents({}) == 0:
            print("Creating sample student...")
            
            # Create a sample student
            student = {
                "email": "student@example.com",
                "password": generate_password_hash("password"),
                "name": "Sample Student",
                "phone": "9876543210",
                "interests": ["Web Development", "Machine Learning"],
                "enrolled_courses": [],
                "mentors": [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            mongo.db.students.insert_one(student)
            print("Created sample student")
        else:
            print("Database already has students. Skipping initialization.")
            
        # Check if we have mentors
        if mongo.db.mentors.count_documents({}) == 0:
            print("Creating sample mentor...")
            
            # Create a sample mentor
            mentor = {
                "email": "mentor@example.com",
                "password": generate_password_hash("password"),
                "name": "Sample Mentor",
                "phone": "5555555555",
                "expertise": ["Web Development", "Project Management"],
                "availability": ["Weekends", "Evenings"],
                "students": [],
                "rating": 0,
                "reviews": [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            mongo.db.mentors.insert_one(mentor)
            print("Created sample mentor")
        else:
            print("Database already has mentors. Skipping initialization.")

if __name__ == "__main__":
    init_db() 