import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from backend.database import db
from backend.models.event import EventCreate, EventUpdate, EventResponse, EventStatus
from backend.routers.auth import get_current_user, require_role

router = APIRouter(prefix="/events", tags=["Events"])

@router.get("", response_model=List[EventResponse])
def get_events(
    category: Optional[str] = None,
    venue: Optional[str] = None,
    search: Optional[str] = None,
    status: Optional[str] = None,
    upcoming_only: bool = False,
    sort_by: str = "date", # date, popularity, title
    current_user: Optional[dict] = None
):
    events = list(db.data["events"].values())
    
    # Filter by status: public visitors and students should only see approved or completed events
    if status:
        events = [e for e in events if e.get("status") == status]
    else:
        # Default public listing shows approved events
        events = [e for e in events if e.get("status") in ["approved", "completed"]]

    if category and category.lower() != "all":
        events = [e for e in events if e.get("category", "").lower() == category.lower()]

    if venue:
        events = [e for e in events if venue.lower() in e.get("venue", "").lower()]

    if search:
        s = search.lower()
        events = [
            e for e in events
            if s in e.get("title", "").lower()
            or s in e.get("description", "").lower()
            or any(s in tag.lower() for tag in e.get("tags", []))
            or s in e.get("venue", "").lower()
        ]

    if upcoming_only:
        today = datetime.utcnow().strftime("%Y-%m-%d")
        events = [e for e in events if e.get("date") >= today]

    # Sorting
    if sort_by == "popularity":
        events.sort(key=lambda x: x.get("registered_count", 0), reverse=True)
    elif sort_by == "title":
        events.sort(key=lambda x: x.get("title", "").lower())
    else:
        events.sort(key=lambda x: (x.get("date", ""), x.get("start_time", "")))

    return events

@router.get("/recommendations", response_model=List[EventResponse])
def get_recommendations(current_user: dict = Depends(get_current_user)):
    user_interests = [i.lower() for i in current_user.get("interests", [])]
    events = [e for e in db.data["events"].values() if e.get("status") == "approved"]
    
    # Explainable ranking: score matches on tags and categories
    scored = []
    for ev in events:
        score = 0
        ev_cat = ev.get("category", "").lower()
        ev_tags = [t.lower() for t in ev.get("tags", [])]
        
        for interest in user_interests:
            if interest in ev_cat:
                score += 3
            for tag in ev_tags:
                if interest in tag:
                    score += 2
                    
        # Small boost for featured events
        if ev.get("is_featured"):
            score += 1
            
        scored.append((score, ev))
        
    scored.sort(key=lambda x: x[0], reverse=True)
    return [item[1] for item in scored[:6]]

@router.get("/organizer/my-events", response_model=List[EventResponse])
def get_organizer_events(current_user: dict = Depends(require_role(["organizer", "admin"]))):
    if current_user["role"] == "admin":
        return list(db.data["events"].values())
    return [e for e in db.data["events"].values() if e.get("organizer_id") == current_user["id"]]

@router.get("/{event_id}", response_model=EventResponse)
def get_event_detail(event_id: str):
    ev = db.data["events"].get(event_id)
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    return ev

@router.post("", response_model=EventResponse)
def create_event(
    event_in: EventCreate,
    current_user: dict = Depends(require_role(["organizer", "admin"]))
):
    ev_id = str(uuid.uuid4())
    now_iso = datetime.utcnow().isoformat() + "Z"
    
    # Default poster image if not provided
    default_posters = {
        "Technical": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
        "Cultural": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
        "Sports": "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80",
        "Academic": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
        "Workshop": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
        "Seminar": "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
        "Competition": "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
    }
    poster = event_in.poster_url or default_posters.get(event_in.category.value, default_posters["Technical"])

    # If created by admin, auto-approve; otherwise pending approval
    status = EventStatus.APPROVED.value if current_user["role"] == "admin" else EventStatus.PENDING.value

    event_data = {
        "id": ev_id,
        "title": event_in.title,
        "description": event_in.description,
        "category": event_in.category.value,
        "tags": event_in.tags,
        "venue": event_in.venue,
        "date": event_in.date,
        "start_time": event_in.start_time,
        "end_time": event_in.end_time,
        "registration_deadline": event_in.registration_deadline,
        "capacity": event_in.capacity,
        "poster_url": poster,
        "eligibility": event_in.eligibility,
        "is_featured": event_in.is_featured,
        "organizer_id": current_user["id"],
        "organizer_name": current_user["full_name"],
        "status": status,
        "rejection_reason": None,
        "registered_count": 0,
        "waitlist_count": 0,
        "attended_count": 0,
        "created_at": now_iso,
        "updated_at": now_iso
    }

    db.data["events"][ev_id] = event_data
    db.save()

    db.log_audit(
        current_user["id"], current_user["full_name"], current_user["role"],
        "CREATE_EVENT", "event", ev_id, {"title": event_in.title, "status": status}
    )

    # Notify administrators if pending
    if status == EventStatus.PENDING.value:
        for u in db.data["users"].values():
            if u.get("role") == "admin":
                db.create_notification(
                    u["id"],
                    "New Event Submission",
                    f"{current_user['full_name']} submitted '{event_in.title}' for approval.",
                    "warning",
                    f"/admin/events"
                )

    return event_data

@router.put("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: str,
    event_update: EventUpdate,
    current_user: dict = Depends(require_role(["organizer", "admin"]))
):
    ev = db.data["events"].get(event_id)
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")

    # Only creator or admin can update
    if current_user["role"] != "admin" and ev.get("organizer_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="You can only edit events you created")

    update_dict = event_update.model_dump(exclude_unset=True)
    
    # Handle enum conversions
    if "category" in update_dict and update_dict["category"]:
        update_dict["category"] = update_dict["category"].value
    if "status" in update_dict and update_dict["status"]:
        # Only admin can approve/reject
        if update_dict["status"] in [EventStatus.APPROVED, EventStatus.REJECTED] and current_user["role"] != "admin":
            raise HTTPException(status_code=403, detail="Only administrators can approve or reject events")
        update_dict["status"] = update_dict["status"].value

    for k, v in update_dict.items():
        ev[k] = v
        
    ev["updated_at"] = datetime.utcnow().isoformat() + "Z"
    db.data["events"][event_id] = ev
    db.save()

    db.log_audit(
        current_user["id"], current_user["full_name"], current_user["role"],
        "UPDATE_EVENT", "event", event_id, {"updated_fields": list(update_dict.keys())}
    )

    return ev

@router.delete("/{event_id}")
def delete_event(
    event_id: str,
    current_user: dict = Depends(require_role(["organizer", "admin"]))
):
    ev = db.data["events"].get(event_id)
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")

    if current_user["role"] != "admin" and ev.get("organizer_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="You can only delete events you created")

    del db.data["events"][event_id]
    db.save()

    db.log_audit(
        current_user["id"], current_user["full_name"], current_user["role"],
        "DELETE_EVENT", "event", event_id, {"title": ev.get("title")}
    )

    return {"message": "Event deleted successfully"}

@router.post("/ai-assistant")
def ai_event_assistant(prompt_data: dict, current_user: dict = Depends(require_role(["organizer", "admin"]))):
    topic = prompt_data.get("topic", "").strip()
    category = prompt_data.get("category", "Technical")
    target_audience = prompt_data.get("audience", "College Students")
    
    if not topic:
        raise HTTPException(status_code=400, detail="Topic or theme prompt is required")

    # Smart collegiate content generator
    templates = {
        "Technical": {
            "title_prefix": ["CodeCraft:", "Nexus AI:", "InnovateX:", "DevSummit:"],
            "desc": f"An immersive deep-dive into {topic}. Attendees will collaborate on industry-standard toolchains, explore scalable architectures, and participate in interactive live coding challenges tailored for {target_audience}.",
            "tags": ["Technology", "Coding", "HandsOn", "Innovation", topic.replace(" ", "")]
        },
        "Cultural": {
            "title_prefix": ["Rhythm & Roots:", "Aura:", "Kala Utsav:", "Spectra:"],
            "desc": f"Experience an electric showcase celebrating talent, stage presence, and creative artistic expression around {topic}. Open to enthusiastic performers and attendees from {target_audience}.",
            "tags": ["Culture", "Performance", "Music", "Art", "CampusLife"]
        },
        "Workshop": {
            "title_prefix": ["Masterclass in", "Hands-on Workshop:", "Zero-to-Hero:", "Bootcamp:"],
            "desc": f"Comprehensive skill development workshop on {topic}. Led by experienced practitioners, covering foundational concepts, real-world case studies, and practical project deployment.",
            "tags": ["Workshop", "Skills", "Practical", "CareerGrowth"]
        }
    }

    style = templates.get(category, templates["Technical"])
    generated_title = f"{style['title_prefix'][0]} {topic}"
    
    return {
        "suggested_title": generated_title,
        "suggested_description": style["desc"],
        "suggested_tags": style["tags"][:5],
        "suggested_eligibility": f"Enrolled {target_audience} with interest in {topic}",
        "notes": "Generated by AI Event Assistant. Review and customize before publishing."
    }

@router.get("/{event_id}/calendar-ics")
def download_calendar_ics(event_id: str):
    ev = db.data["events"].get(event_id)
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
        
    start_dt = ev['date'].replace('-', '') + 'T' + ev['start_time'].replace(':', '') + '00'
    end_dt = ev['date'].replace('-', '') + 'T' + ev['end_time'].replace(':', '') + '00'
    
    ics_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Smart College Event Hub//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:{ev['id']}@campusevents.edu
DTSTAMP:{datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')}
DTSTART:{start_dt}
DTEND:{end_dt}
SUMMARY:{ev['title']}
DESCRIPTION:{ev['description']}
LOCATION:{ev['venue']}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR"""

    return Response(
        content=ics_content,
        media_type="text/calendar",
        headers={"Content-Disposition": f"attachment; filename=event_{event_id}.ics"}
    )
