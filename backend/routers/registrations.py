import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from backend.database import db
from backend.models.registration import (
    RegistrationCreate,
    RegistrationResponse,
    RegistrationStatus,
)
from backend.routers.auth import get_current_user, require_role

router = APIRouter(prefix="/registrations", tags=["Registrations"])

@router.post("", response_model=RegistrationResponse)
def register_for_event(
    reg_in: RegistrationCreate,
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    event_id = reg_in.event_id

    with db.lock:
        ev = db.data["events"].get(event_id)
        if not ev:
            raise HTTPException(status_code=404, detail="Event not found")

        if ev.get("status") != "approved":
            raise HTTPException(status_code=400, detail="Registrations are only allowed for approved events")

        # Check deadline
        deadline_str = ev.get("registration_deadline")
        if deadline_str:
            try:
                deadline_dt = datetime.fromisoformat(deadline_str.replace("Z", ""))
                if datetime.utcnow() > deadline_dt:
                    raise HTTPException(status_code=400, detail="Registration deadline has passed")
            except ValueError:
                pass

        # Check existing registration for this user and event
        for r in db.data["registrations"].values():
            if r["event_id"] == event_id and r["user_id"] == user_id:
                if r["status"] in ["confirmed", "waitlisted"]:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"You are already registered for this event (Status: {r['status']})"
                    )
                elif r["status"] == "cancelled":
                    # Re-activating cancelled registration
                    reg_id = r["id"]
                    status = RegistrationStatus.CONFIRMED.value
                    if ev["registered_count"] >= ev["capacity"]:
                        status = RegistrationStatus.WAITLISTED.value
                        ev["waitlist_count"] = ev.get("waitlist_count", 0) + 1
                    else:
                        ev["registered_count"] = ev.get("registered_count", 0) + 1

                    r["status"] = status
                    r["registered_at"] = datetime.utcnow().isoformat() + "Z"
                    db.save()

                    db.create_notification(
                        user_id,
                        f"Registration Re-activated ({status.capitalize()})",
                        f"Your registration for '{ev['title']}' has been updated to {status}.",
                        "success" if status == "confirmed" else "warning",
                        f"/events/{event_id}"
                    )
                    return r

        # New registration
        capacity = ev.get("capacity", 100)
        confirmed_count = ev.get("registered_count", 0)
        
        reg_id = str(uuid.uuid4())
        ticket_code = f"TKT-{event_id[:4].upper()}-{reg_id[:8].upper()}"

        if confirmed_count >= capacity:
            status = RegistrationStatus.WAITLISTED.value
            ev["waitlist_count"] = ev.get("waitlist_count", 0) + 1
            msg = f"Event capacity reached. You have been placed on the waitlist (Position #{ev['waitlist_count']})."
        else:
            status = RegistrationStatus.CONFIRMED.value
            ev["registered_count"] = confirmed_count + 1
            msg = f"Successfully registered for '{ev['title']}'! Your ticket is confirmed."

        reg_data = {
            "id": reg_id,
            "event_id": event_id,
            "event_title": ev["title"],
            "event_date": ev["date"],
            "event_time": ev["start_time"],
            "event_venue": ev["venue"],
            "user_id": user_id,
            "user_name": current_user["full_name"],
            "user_email": current_user["email"],
            "status": status,
            "ticket_code": ticket_code,
            "registered_at": datetime.utcnow().isoformat() + "Z",
            "attended_at": None,
            "certificate_id": None
        }

        db.data["registrations"][reg_id] = reg_data
        db.save()

    # Outside lock
    db.log_audit(
        user_id, current_user["full_name"], current_user["role"],
        "EVENT_REGISTRATION", "registration", reg_id, {"event_id": event_id, "status": status}
    )

    db.create_notification(
        user_id,
        "Registration Update",
        msg,
        "success" if status == "confirmed" else "warning",
        f"/events/{event_id}"
    )

    return reg_data

@router.delete("/{registration_id}")
def cancel_registration(
    registration_id: str,
    current_user: dict = Depends(get_current_user)
):
    with db.lock:
        reg = db.data["registrations"].get(registration_id)
        if not reg:
            raise HTTPException(status_code=404, detail="Registration record not found")

        # Authorization: user owner or admin
        if current_user["role"] != "admin" and reg["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Not authorized to cancel this registration")

        if reg["status"] == "cancelled":
            return {"message": "Registration was already cancelled"}

        prev_status = reg["status"]
        reg["status"] = RegistrationStatus.CANCELLED.value
        event_id = reg["event_id"]
        ev = db.data["events"].get(event_id)

        promoted_user_id = None
        if ev:
            if prev_status == "confirmed":
                ev["registered_count"] = max(0, ev.get("registered_count", 1) - 1)
                
                # AUTOMATIC WAITLIST PROMOTION
                # Find the earliest waitlisted student
                waitlisted = [
                    r for r in db.data["registrations"].values()
                    if r["event_id"] == event_id and r["status"] == RegistrationStatus.WAITLISTED.value
                ]
                waitlisted.sort(key=lambda x: x["registered_at"])
                
                if waitlisted:
                    next_in_line = waitlisted[0]
                    next_in_line["status"] = RegistrationStatus.CONFIRMED.value
                    ev["registered_count"] += 1
                    ev["waitlist_count"] = max(0, ev.get("waitlist_count", 1) - 1)
                    promoted_user_id = next_in_line["user_id"]

            elif prev_status == "waitlisted":
                ev["waitlist_count"] = max(0, ev.get("waitlist_count", 1) - 1)

        db.save()

    # Notify promoted student if any
    if promoted_user_id and ev:
        db.create_notification(
            promoted_user_id,
            "Good News! Waitlist Promotion",
            f"A seat opened up for '{ev['title']}'! Your registration is now CONFIRMED.",
            "success",
            f"/events/{event_id}"
        )

    db.log_audit(
        current_user["id"], current_user["full_name"], current_user["role"],
        "CANCEL_REGISTRATION", "registration", registration_id, {"event_id": event_id}
    )

    return {"message": "Registration cancelled successfully", "promoted_waitlist": bool(promoted_user_id)}

@router.get("/my", response_model=List[RegistrationResponse])
def get_my_registrations(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    return [r for r in db.data["registrations"].values() if r["user_id"] == user_id]

@router.get("/event/{event_id}", response_model=List[RegistrationResponse])
def get_event_participants(
    event_id: str,
    current_user: dict = Depends(require_role(["organizer", "admin"]))
):
    ev = db.data["events"].get(event_id)
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if current_user["role"] != "admin" and ev.get("organizer_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="You can only view participants for your own events")
        
    return [r for r in db.data["registrations"].values() if r["event_id"] == event_id]
