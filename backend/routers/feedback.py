import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from backend.database import db
from backend.models.feedback import FeedbackCreate, FeedbackResponse
from backend.routers.auth import get_current_user, require_role

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.post("", response_model=FeedbackResponse)
def submit_feedback(
    fb_in: FeedbackCreate,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    event_id = fb_in.event_id

    # Check event exists
    ev = db.data["events"].get(event_id)
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")

    # Prevent duplicate feedback
    for f in db.data["feedback"].values():
        if f.get("event_id") == event_id and f.get("user_id") == user_id:
            raise HTTPException(status_code=400, detail="You have already submitted feedback for this event")

    # Verify registration or attendance eligibility (optional or recommended)
    has_registered = any(
        r.get("event_id") == event_id and r.get("user_id") == user_id
        for r in db.data["registrations"].values()
    )
    if not has_registered and current_user["role"] == "student":
        raise HTTPException(status_code=403, detail="Only registered attendees can submit feedback for this event")

    fb_id = str(uuid.uuid4())
    display_name = "Anonymous Student" if fb_in.is_anonymous else current_user["full_name"]

    fb_record = {
        "id": fb_id,
        "event_id": event_id,
        "user_id": user_id,
        "user_name": display_name,
        "rating": fb_in.rating,
        "organization_rating": fb_in.organization_rating,
        "content_rating": fb_in.content_rating,
        "comment": fb_in.comment,
        "created_at": datetime.utcnow().isoformat() + "Z"
    }

    db.data["feedback"][fb_id] = fb_record
    db.save()

    db.log_audit(
        user_id, current_user["full_name"], current_user["role"],
        "SUBMIT_FEEDBACK", "feedback", fb_id, {"event_id": event_id, "rating": fb_in.rating}
    )

    return fb_record

@router.get("/event/{event_id}")
def get_event_feedback(event_id: str):
    items = [f for f in db.data["feedback"].values() if f.get("event_id") == event_id]
    
    if not items:
        return {
            "average_rating": 0.0,
            "total_reviews": 0,
            "organization_avg": 0.0,
            "content_avg": 0.0,
            "reviews": []
        }

    total = len(items)
    avg_rating = round(sum(f["rating"] for f in items) / total, 1)
    avg_org = round(sum(f.get("organization_rating", 5) for f in items) / total, 1)
    avg_content = round(sum(f.get("content_rating", 5) for f in items) / total, 1)

    return {
        "average_rating": avg_rating,
        "total_reviews": total,
        "organization_avg": avg_org,
        "content_avg": avg_content,
        "reviews": sorted(items, key=lambda x: x["created_at"], reverse=True)
    }

@router.delete("/{feedback_id}")
def delete_feedback(
    feedback_id: str,
    current_user: dict = Depends(require_role(["admin"]))
):
    if feedback_id not in db.data["feedback"]:
        raise HTTPException(status_code=404, detail="Feedback not found")
        
    del db.data["feedback"][feedback_id]
    db.save()
    
    db.log_audit(
        current_user["id"], current_user["full_name"], "admin",
        "MODERATE_FEEDBACK", "feedback", feedback_id
    )
    return {"message": "Feedback removed by administrator"}
