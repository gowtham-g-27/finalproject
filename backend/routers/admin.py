from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from backend.database import db
from backend.routers.auth import require_role

router = APIRouter(prefix="/admin", tags=["Administration"])

@router.get("/users")
def list_users(current_user: dict = Depends(require_role(["admin"]))):
    safe_users = []
    for u in db.data["users"].values():
        u_copy = u.copy()
        u_copy.pop("password_hash", None)
        safe_users.append(u_copy)
    return safe_users

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: str,
    payload: dict,
    current_user: dict = Depends(require_role(["admin"]))
):
    if user_id not in db.data["users"]:
        raise HTTPException(status_code=404, detail="User not found")
        
    new_role = payload.get("role")
    if new_role not in ["student", "organizer", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role specified")

    user = db.data["users"][user_id]
    old_role = user.get("role")
    user["role"] = new_role
    db.save()

    db.log_audit(
        current_user["id"], current_user["full_name"], "admin",
        "CHANGE_USER_ROLE", "user", user_id, {"old_role": old_role, "new_role": new_role}
    )

    db.create_notification(
        user_id,
        "Role Updated",
        f"Your account role has been updated to '{new_role.capitalize()}' by the administrator.",
        "info"
    )

    return {"message": "Role updated successfully", "user_id": user_id, "role": new_role}

@router.put("/users/{user_id}/status")
def toggle_user_status(
    user_id: str,
    payload: dict,
    current_user: dict = Depends(require_role(["admin"]))
):
    if user_id not in db.data["users"]:
        raise HTTPException(status_code=404, detail="User not found")

    is_active = payload.get("is_active", True)
    db.data["users"][user_id]["is_active"] = is_active
    db.save()

    action = "ACTIVATE_USER" if is_active else "SUSPEND_USER"
    db.log_audit(
        current_user["id"], current_user["full_name"], "admin",
        action, "user", user_id
    )

    return {"message": f"User status set to {'active' if is_active else 'suspended'}"}

@router.post("/events/{event_id}/approve")
def approve_event(
    event_id: str,
    current_user: dict = Depends(require_role(["admin"]))
):
    ev = db.data["events"].get(event_id)
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")

    ev["status"] = "approved"
    ev["rejection_reason"] = None
    db.save()

    db.log_audit(
        current_user["id"], current_user["full_name"], "admin",
        "APPROVE_EVENT", "event", event_id, {"title": ev["title"]}
    )

    db.create_notification(
        ev["organizer_id"],
        "Event Approved!",
        f"Your event '{ev['title']}' has been officially approved and published to students.",
        "success",
        f"/events/{event_id}"
    )

    return {"message": "Event approved successfully"}

@router.post("/events/{event_id}/reject")
def reject_event(
    event_id: str,
    payload: dict,
    current_user: dict = Depends(require_role(["admin"]))
):
    ev = db.data["events"].get(event_id)
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")

    reason = payload.get("reason", "Event does not meet campus activity guidelines.")
    ev["status"] = "rejected"
    ev["rejection_reason"] = reason
    db.save()

    db.log_audit(
        current_user["id"], current_user["full_name"], "admin",
        "REJECT_EVENT", "event", event_id, {"title": ev["title"], "reason": reason}
    )

    db.create_notification(
        ev["organizer_id"],
        "Event Rejected",
        f"Your event '{ev['title']}' was not approved. Reason: {reason}",
        "alert"
    )

    return {"message": "Event rejected", "reason": reason}

@router.get("/audit-logs")
def get_audit_logs(current_user: dict = Depends(require_role(["admin"]))):
    logs = list(db.data["audit_logs"].values())
    logs.sort(key=lambda x: x["timestamp"], reverse=True)
    return logs[:100]

@router.get("/categories")
def get_categories():
    return db.data.get("categories", [])
