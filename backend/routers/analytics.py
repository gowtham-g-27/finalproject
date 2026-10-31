import io
import csv
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, Response
from backend.database import db
from backend.routers.auth import require_role

router = APIRouter(prefix="/analytics", tags=["Analytics & Reports"])

@router.get("/dashboard")
def get_dashboard_metrics(current_user: dict = Depends(require_role(["organizer", "admin"]))):
    events = list(db.data["events"].values())
    registrations = list(db.data["registrations"].values())
    users = list(db.data["users"].values())
    feedback = list(db.data["feedback"].values())

    # If organizer, filter to their events
    if current_user["role"] == "organizer":
        my_event_ids = {e["id"] for e in events if e.get("organizer_id") == current_user["id"]}
        events = [e for e in events if e["id"] in my_event_ids]
        registrations = [r for r in registrations if r["event_id"] in my_event_ids]
        feedback = [f for f in feedback if f["event_id"] in my_event_ids]

    total_events = len(events)
    total_users = len(users)
    total_registrations = len(registrations)
    
    confirmed_regs = [r for r in registrations if r["status"] in ["confirmed", "attended"]]
    attended_regs = [r for r in registrations if r["status"] == "attended"]
    waitlisted_regs = [r for r in registrations if r["status"] == "waitlisted"]

    attendance_rate = round((len(attended_regs) / len(confirmed_regs) * 100), 1) if confirmed_regs else 0.0

    # Category breakdown
    cat_counts: Dict[str, int] = {}
    for ev in events:
        cat = ev.get("category", "Other")
        cat_counts[cat] = cat_counts.get(cat, 0) + 1

    category_distribution = [{"category": k, "count": v} for k, v in cat_counts.items()]

    # Registration trends (grouped by event)
    event_performance = []
    for ev in events:
        ev_regs = [r for r in registrations if r["event_id"] == ev["id"]]
        cap = ev.get("capacity", 1)
        confirmed = sum(1 for r in ev_regs if r["status"] in ["confirmed", "attended"])
        attended = sum(1 for r in ev_regs if r["status"] == "attended")
        utilization = round((confirmed / cap * 100), 1) if cap > 0 else 0

        event_performance.append({
            "id": ev["id"],
            "title": ev["title"][:24] + "..." if len(ev["title"]) > 24 else ev["title"],
            "category": ev.get("category"),
            "capacity": cap,
            "registered": confirmed,
            "attended": attended,
            "waitlisted": sum(1 for r in ev_regs if r["status"] == "waitlisted"),
            "utilization": min(utilization, 100.0)
        })

    # Average Feedback
    avg_feedback = round(sum(f["rating"] for f in feedback) / len(feedback), 1) if feedback else 5.0

    return {
        "summary": {
            "total_events": total_events,
            "total_users": total_users,
            "total_registrations": total_registrations,
            "confirmed_seats": len(confirmed_regs),
            "attendance_rate": attendance_rate,
            "total_waitlisted": len(waitlisted_regs),
            "average_rating": avg_feedback,
        },
        "category_distribution": category_distribution,
        "event_performance": event_performance[:10],
    }

@router.get("/export/csv")
def export_reports_csv(current_user: dict = Depends(require_role(["organizer", "admin"]))):
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        "Event ID", "Title", "Category", "Date", "Venue", "Capacity", 
        "Registered", "Attended", "Waitlisted", "Status"
    ])

    events = list(db.data["events"].values())
    if current_user["role"] == "organizer":
        events = [e for e in events if e.get("organizer_id") == current_user["id"]]

    for ev in events:
        writer.writerow([
            ev["id"],
            ev["title"],
            ev.get("category"),
            ev.get("date"),
            ev.get("venue"),
            ev.get("capacity"),
            ev.get("registered_count", 0),
            ev.get("attended_count", 0),
            ev.get("waitlist_count", 0),
            ev.get("status")
        ])

    output.seek(0)
    filename = f"events_report_{datetime.utcnow().strftime('%Y%m%d')}.csv"
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

