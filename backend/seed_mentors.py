from pymongo import MongoClient
from bson import ObjectId
import datetime

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["eduspark"]
mentors_collection = db["mentors"]

# Sample mentor data
sample_mentors = [
    {
        "_id": ObjectId(),
        "name": "John Doe",
        "email": "john.doe@example.com",
        "expertise": ["Machine Learning", "Data Science", "Python"],
        "skills": ["TensorFlow", "PyTorch", "Scikit-learn"],
        "bio": "Experienced ML engineer with 10 years in the industry",
        "title": "Senior Machine Learning Engineer",
        "company": "TechCorp",
        "industry": "Technology",
        "years_experience": 10,
        "availability": "Weekends",
        "profile_image": "default-mentor.jpg",
        "created_at": datetime.datetime.now(),
        "updated_at": datetime.datetime.now()
    },
    {
        "_id": ObjectId(),
        "name": "Jane Smith",
        "email": "jane.smith@example.com",
        "expertise": ["Web Development", "Frontend", "React"],
        "skills": ["JavaScript", "React", "HTML/CSS"],
        "bio": "Frontend developer passionate about UI/UX design",
        "title": "Lead Frontend Developer",
        "company": "WebPros",
        "industry": "Software",
        "years_experience": 7,
        "availability": "Evenings",
        "profile_image": "default-mentor.jpg",
        "created_at": datetime.datetime.now(),
        "updated_at": datetime.datetime.now()
    },
    {
        "_id": ObjectId(),
        "name": "Mike Johnson",
        "email": "mike.johnson@example.com",
        "expertise": ["Entrepreneurship", "Business Development", "Startup"],
        "skills": ["Fundraising", "Pitching", "Business Strategy"],
        "bio": "Serial entrepreneur with 3 successful exits",
        "title": "CEO & Founder",
        "company": "StartupLab",
        "industry": "Startups",
        "years_experience": 15,
        "availability": "Flexible",
        "profile_image": "default-mentor.jpg",
        "created_at": datetime.datetime.now(),
        "updated_at": datetime.datetime.now()
    },
    {
        "_id": ObjectId(),
        "name": "Sarah Williams",
        "email": "sarah.williams@example.com",
        "expertise": ["Mobile Development", "iOS", "Swift"],
        "skills": ["Swift", "Objective-C", "UIKit"],
        "bio": "iOS developer with focus on performance optimization",
        "title": "Senior iOS Developer",
        "company": "AppStudio",
        "industry": "Mobile",
        "years_experience": 8,
        "availability": "Weekdays",
        "profile_image": "default-mentor.jpg",
        "created_at": datetime.datetime.now(),
        "updated_at": datetime.datetime.now()
    }
]

# Check if collection is empty before inserting
if mentors_collection.count_documents({}) == 0:
    mentors_collection.insert_many(sample_mentors)
    print(f"Inserted {len(sample_mentors)} sample mentors")
else:
    print("Mentors collection already contains data. Skipping insertion.")
    
    # Display existing mentors
    print("\nExisting mentors:")
    for mentor in mentors_collection.find():
        print(f"ID: {mentor.get('_id')}, Name: {mentor.get('name')}, Email: {mentor.get('email')}")

print("\nDone!") 