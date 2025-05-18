def serialize_project(project):
    return {
        "_id": str(project.get("_id")),
        "student_id": project.get("student_id"),
        "title": project.get("title"),
        "description": project.get("description"),
        "github_url": project.get("github_url"),
        "live_url": project.get("live_url", ""),
        "tech_stack": project.get("tech_stack", [])
    }
