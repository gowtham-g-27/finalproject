import io
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Response
import qrcode
from backend.database import db
from backend.models.attendance import CheckInRequest, CheckInResponse
from backend.routers.auth import require_role

router = APIRouter(prefix="/attendance", tags=["Attendance & QR Check-in"])

@router.get("/qr/{ticket_code}")
def generate_qr_code(ticket_code: str):
    """Generates a dynamic QR code PNG for the given ticket code."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=3,
    )
    qr.add_data(ticket_code)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#0F172A", back_color="#FFFFFF")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    return Response(content=buf.getvalue(), media_type="image/png")

@router.post("/check-in", response_model=CheckInResponse)
def check_in_attendee(
    check_in: CheckInRequest,
    current_user: dict = Depends(require_role(["organizer", "admin"]))
):
    ticket = check_in.ticket_code.strip()
    event_id = check_in.event_id

    with db.lock:
        ev = db.data["events"].get(event_id)
        if not ev:
            raise HTTPException(status_code=404, detail="Event not found")

        # Ensure organizer owns the event or is admin
        if current_user["role"] != "admin" and ev.get("organizer_id") != current_user["id"]:
            raise HTTPException(status_code=403, detail="Unauthorized: You can only check-in attendees for your own event")

        # Locate registration by ticket code
        reg = None
        for r in db.data["registrations"].values():
            if r.get("ticket_code") == ticket:
                reg = r
                break

        if not reg:
            raise HTTPException(status_code=404, detail=f"Invalid Ticket Code: '{ticket}' not found in system")

        if reg.get("event_id") != event_id:
            raise HTTPException(
                status_code=400,
                detail=f"Ticket belongs to a different event ('{reg.get('event_title')}')"
            )

        if reg.get("status") == "waitlisted":
            raise HTTPException(status_code=400, detail="Cannot check in: Student is on the waitlist, not confirmed")

        if reg.get("status") == "cancelled":
            raise HTTPException(status_code=400, detail="Cannot check in: Registration was previously cancelled")

        # Check repeated check-in
        if reg.get("status") == "attended" and reg.get("attended_at"):
            return CheckInResponse(
                success=True,
                already_checked_in=True,
                message=f"Attendee was ALREADY checked in on {reg['attended_at']}",
                student_name=reg["user_name"],
                student_email=reg["user_email"],
                event_title=ev["title"],
                ticket_code=ticket,
                attended_at=reg["attended_at"]
            )

        # Mark attended
        now_iso = datetime.utcnow().isoformat() + "Z"
        reg["status"] = "attended"
        reg["attended_at"] = now_iso
        ev["attended_count"] = ev.get("attended_count", 0) + 1

        # Issue Certificate immediately upon attendance check-in!
        cert_id = str(uuid_val())
        cert_num = f"CERT-{datetime.utcnow().year}-{cert_id[:8].upper()}"
        db.data["certificates"][cert_id] = {
            "id": cert_id,
            "certificate_number": cert_num,
            "event_id": event_id,
            "event_title": ev["title"],
            "user_id": reg["user_id"],
            "user_name": reg["user_name"],
            "issue_date": datetime.utcnow().strftime("%Y-%m-%d"),
            "verified": True
        }
        reg["certificate_id"] = cert_id

        db.save()

    # Outside lock
    db.log_audit(
        current_user["id"], current_user["full_name"], current_user["role"],
        "CHECK_IN_ATTENDEE", "attendance", reg["id"],
        {"ticket": ticket, "student": reg["user_name"], "event": ev["title"]}
    )

    db.create_notification(
        reg["user_id"],
        "Attendance Verified & Certificate Ready!",
        f"You have been checked in for '{ev['title']}'. Your official Certificate of Participation is now available in your portal.",
        "success",
        f"/certificates"
    )

    return CheckInResponse(
        success=True,
        already_checked_in=False,
        message="Check-in successful! Attendance verified & certificate issued.",
        student_name=reg["user_name"],
        student_email=reg["user_email"],
        event_title=ev["title"],
        ticket_code=ticket,
        attended_at=now_iso
    )

def uuid_val():
    import uuid
    return str(uuid.uuid4())
