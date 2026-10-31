from typing import List
from fastapi import APIRouter, Depends, HTTPException
from backend.database import db
from backend.models.notification import NotificationResponse
from backend.routers.auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def get_user_notifications(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    notes = [n for n in db.data["notifications"].values() if n.get("user_id") == user_id]
    notes.sort(key=lambda x: x["created_at"], reverse=True)
    return notes

@router.put("/{notification_id}/read")
def mark_notification_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    note = db.data["notifications"].get(notification_id)
    if not note or note.get("user_id") != current_user["id"]:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    note["is_read"] = True
    db.save()
    return {"message": "Notification marked as read"}

@router.put("/mark-all-read")
def mark_all_notifications_read(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    for note in db.data["notifications"].values():
        if note.get("user_id") == user_id:
            note["is_read"] = True
    db.save()
    return {"message": "All notifications marked as read"}

