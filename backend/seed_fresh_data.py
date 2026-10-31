import os
import json
import uuid
from datetime import datetime, timedelta
import bcrypt

os.environ['USE_FIREBASE'] = 'true'
from backend.database import Database

def hash_pw(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8")[:72], bcrypt.gensalt()).decode("utf-8")

def reset_and_seed():
    print("Initializing Database with live Firebase...")
    db = Database()
    
    # Fixed UUIDs for clean, deterministic data
    admin_id = "usr-admin-001"
    organizer_id = "usr-organizer-002"
    student_id = "usr-student-003"
    
    event_hackathon_id = "evt-hackathon-2026"
    event_cyber_id = "evt-cyber-summit"
    event_cultural_id = "evt-riviera-cultural"
    event_web3_id = "evt-web3-bootcamp"
    event_sports_id = "evt-sports-championship"
    
    reg_hackathon_id = "reg-hackathon-alex"
    reg_web3_id = "reg-web3-alex"
    cert_web3_id = "cert-2026-vitap-0088"
    fb_web3_id = "fb-web3-alex"

    print("Clearing old local data...")
    fresh_data = {
        "users": {},
        "events": {},
        "registrations": {},
        "notifications": {},
        "feedback": {},
        "certificates": {},
        "audit_logs": {},
        "categories": [
            "Technical", "Cultural", "Sports", "Academic", 
            "Workshop", "Seminar", "Competition", "Other"
        ]
    }

    # 1. THREE CLEAN TEST CREDENTIALS
    fresh_data["users"] = {
        student_id: {
            "id": student_id,
            "email": "student@campus.edu",
            "password_hash": hash_pw("student123"),
            "full_name": "Alex Chen",
            "role": "student",
            "department": "Computer Science & Engineering",
            "student_id": "23BCE1088",
            "phone": "+91 98765 43210",
            "interests": ["Technical", "Workshop", "Competition"],
            "is_active": True,
            "created_at": "2026-09-01T09:00:00Z"
        },
        organizer_id: {
            "id": organizer_id,
            "email": "organizer@campus.edu",
            "password_hash": hash_pw("organizer123"),
            "full_name": "Prof. Alex Rivera",
            "role": "organizer",
            "department": "School of Computing & Data Science",
            "student_id": "FAC-CSE-402",
            "phone": "+91 94401 22334",
            "interests": ["AI & Machine Learning", "Hackathons", "Robotics"],
            "is_active": True,
            "created_at": "2026-08-15T09:00:00Z"
        },
        admin_id: {
            "id": admin_id,
            "email": "admin@campus.edu",
            "password_hash": hash_pw("admin123"),
            "full_name": "Dr. Sarah Jenkins",
            "role": "admin",
            "department": "Dean of Student Affairs",
            "student_id": "ADMIN-DIR-001",
            "phone": "+91 99887 76655",
            "interests": ["Campus Leadership", "Accreditation", "Events Oversight"],
            "is_active": True,
            "created_at": "2026-07-01T09:00:00Z"
        }
    }

    # 2. RICH REALISTIC EVENTS
    fresh_data["events"] = {
        event_hackathon_id: {
            "id": event_hackathon_id,
            "title": "VIT-AP AI & Robotics Hackathon 2026",
            "description": "A 24-hour collegiate hackathon focused on autonomous robotics, edge computer vision, and generative AI agent workflows. Mentored by industry leads from NVIDIA and Google Cloud.",
            "category": "Technical",
            "tags": ["AI", "Robotics", "Hackathon", "OpenCV"],
            "date": "2026-11-15",
            "start_time": "09:00 AM",
            "end_time": "06:00 PM",
            "venue": "AB-1 Central Auditorium & Innovation Lab",
            "capacity": 150,
            "registered_count": 1,
            "attended_count": 0,
            "waitlist_count": 0,
            "status": "approved",
            "organizer_id": organizer_id,
            "organizer_name": "Prof. Alex Rivera",
            "poster_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
            "eligibility": "Open to all enrolled university engineering students.",
            "registration_deadline": "2026-11-14T23:59:59Z",
            "created_at": "2026-10-15T10:00:00Z"
        },
        event_cyber_id: {
            "id": event_cyber_id,
            "title": "National Cyber Security & Cloud Summit",
            "description": "Hands-on defensive architecture masterclass, red-team penetration labs, and zero-trust cloud configuration workshops led by certified ethical hackers.",
            "category": "Workshop",
            "tags": ["Security", "Cloud", "Linux", "Networking"],
            "date": "2026-11-20",
            "start_time": "10:00 AM",
            "end_time": "04:30 PM",
            "venue": "Newton Hall, Tech Block 2",
            "capacity": 100,
            "registered_count": 42,
            "attended_count": 0,
            "waitlist_count": 0,
            "status": "approved",
            "organizer_id": organizer_id,
            "organizer_name": "Prof. Alex Rivera",
            "poster_url": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
            "eligibility": "Open to all students with basic networking understanding.",
            "registration_deadline": "2026-11-19T23:59:59Z",
            "created_at": "2026-10-18T11:00:00Z"
        },
        event_cultural_id: {
            "id": event_cultural_id,
            "title": "Annual University Cultural Fest — Riviera 2026",
            "description": "The flagship inter-college cultural extravaganza featuring live music, theatrical stage plays, choreo dance battles, and fine arts exhibitions across two days.",
            "category": "Cultural",
            "tags": ["Music", "Dance", "Riviera", "Arts"],
            "date": "2026-12-05",
            "start_time": "05:00 PM",
            "end_time": "10:00 PM",
            "venue": "Open Air Amphitheatre",
            "capacity": 500,
            "registered_count": 0,
            "attended_count": 0,
            "waitlist_count": 0,
            "status": "pending",  # PENDING APPROVAL FOR ADMIN DEMO!
            "organizer_id": organizer_id,
            "organizer_name": "Prof. Alex Rivera",
            "poster_url": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
            "eligibility": "University wide open access.",
            "registration_deadline": "2026-12-04T23:59:59Z",
            "created_at": "2026-10-25T14:30:00Z"
        },
        event_web3_id: {
            "id": event_web3_id,
            "title": "Full-Stack Web3 & Cloud Native Bootcamp",
            "description": "Three-day intensive developer workshop on distributed systems, container orchestration with Kubernetes, and verified smart contracts.",
            "category": "Technical",
            "tags": ["FullStack", "Docker", "Kubernetes", "Web3"],
            "date": "2026-10-10",
            "start_time": "09:30 AM",
            "end_time": "05:00 PM",
            "venue": "Seminar Hall 3",
            "capacity": 80,
            "registered_count": 80,
            "attended_count": 74,
            "waitlist_count": 0,
            "status": "completed",
            "organizer_id": organizer_id,
            "organizer_name": "Prof. Alex Rivera",
            "poster_url": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
            "eligibility": "Completed for registered students.",
            "registration_deadline": "2026-10-09T23:59:59Z",
            "created_at": "2026-09-20T10:00:00Z"
        },
        event_sports_id: {
            "id": event_sports_id,
            "title": "Inter-Department Badminton & Futsal Championship",
            "description": "Annual campus tournament with knockout rounds, live electronic scoreboards, and university trophy presentation.",
            "category": "Sports",
            "tags": ["Badminton", "Futsal", "Athletics"],
            "date": "2026-11-25",
            "start_time": "08:00 AM",
            "end_time": "02:00 PM",
            "venue": "Indoor Sports Complex",
            "capacity": 64,
            "registered_count": 48,
            "attended_count": 0,
            "waitlist_count": 0,
            "status": "approved",
            "organizer_id": organizer_id,
            "organizer_name": "Prof. Alex Rivera",
            "poster_url": "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80",
            "eligibility": "University students with sports clearance.",
            "registration_deadline": "2026-11-24T23:59:59Z",
            "created_at": "2026-10-20T12:00:00Z"
        }
    }

    # 3. REGISTRATIONS (One live confirmed for hackathon with QR, one attended for web3)
    fresh_data["registrations"] = {
        reg_hackathon_id: {
            "id": reg_hackathon_id,
            "event_id": event_hackathon_id,
            "event_title": "VIT-AP AI & Robotics Hackathon 2026",
            "event_date": "2026-11-15",
            "event_time": "09:00 AM - 06:00 PM",
            "event_venue": "AB-1 Central Auditorium & Innovation Lab",
            "user_id": student_id,
            "user_name": "Alex Chen",
            "user_email": "student@campus.edu",
            "status": "confirmed",
            "ticket_code": "TKT-HACK-AI-2026", # READY TO SCAN VIA CAMERA OR CODE!
            "registered_at": "2026-10-28T11:20:00Z",
            "attended_at": None,
            "certificate_id": None
        },
        reg_web3_id: {
            "id": reg_web3_id,
            "event_id": event_web3_id,
            "event_title": "Full-Stack Web3 & Cloud Native Bootcamp",
            "event_date": "2026-10-10",
            "event_time": "09:30 AM - 05:00 PM",
            "event_venue": "Seminar Hall 3",
            "user_id": student_id,
            "user_name": "Alex Chen",
            "user_email": "student@campus.edu",
            "status": "attended",
            "ticket_code": "TKT-WEB3-DONE-10",
            "registered_at": "2026-09-25T14:15:00Z",
            "attended_at": "2026-10-10T09:45:00Z",
            "certificate_id": cert_web3_id
        }
    }

    # 4. CERTIFICATES (Verified attendance certificate with PDF generation)
    fresh_data["certificates"] = {
        cert_web3_id: {
            "id": cert_web3_id,
            "certificate_number": "CERT-2026-VITAP-0088",
            "event_id": event_web3_id,
            "event_title": "Full-Stack Web3 & Cloud Native Bootcamp",
            "user_id": student_id,
            "user_name": "Alex Chen",
            "issue_date": "2026-10-10",
            "verified": True
        }
    }

    # 5. REVIEWS & RATINGS
    fresh_data["feedback"] = {
        fb_web3_id: {
            "id": fb_web3_id,
            "event_id": event_web3_id,
            "user_id": student_id,
            "user_name": "Alex Chen",
            "rating": 5,
            "organization_rating": 5,
            "content_rating": 5,
            "comment": "Exceptional hands-on learning! The Docker and Kubernetes labs were structured step-by-step. Highly recommend Prof. Rivera's sessions.",
            "created_at": "2026-10-11T12:00:00Z"
        }
    }

    # 6. NOTIFICATIONS FOR STUDENT & ORGANIZER
    fresh_data["notifications"] = {
        "notif-1": {
            "id": "notif-1",
            "user_id": student_id,
            "title": "Registration Confirmed!",
            "message": "You are registered for 'VIT-AP AI & Robotics Hackathon 2026'. Your QR access pass is ready.",
            "type": "success",
            "link": "/dashboard",
            "is_read": False,
            "created_at": "2026-10-28T11:20:00Z"
        },
        "notif-2": {
            "id": "notif-2",
            "user_id": student_id,
            "title": "Certificate Available",
            "message": "Your official Certificate of Participation for Full-Stack Web3 Bootcamp is ready to download.",
            "type": "info",
            "link": "/certificates",
            "is_read": True,
            "created_at": "2026-10-10T18:00:00Z"
        },
        "notif-3": {
            "id": "notif-3",
            "user_id": organizer_id,
            "title": "New Event Proposal Submitted",
            "message": "Your proposal for 'Riviera 2026' was submitted to the Dean's office for review.",
            "type": "info",
            "link": "/organizer",
            "is_read": False,
            "created_at": "2026-10-25T14:30:00Z"
        }
    }

    # 7. AUDIT TRAIL LOGS FOR ADMIN
    fresh_data["audit_logs"] = {
        "log-1": {
            "id": "log-1",
            "user_id": admin_id,
            "user_name": "Dr. Sarah Jenkins",
            "user_role": "admin",
            "action": "APPROVE_EVENT",
            "resource_type": "event",
            "resource_id": event_hackathon_id,
            "details": {"title": "VIT-AP AI & Robotics Hackathon 2026", "status": "approved"},
            "timestamp": "2026-10-16T11:00:00Z"
        },
        "log-2": {
            "id": "log-2",
            "user_id": organizer_id,
            "user_name": "Prof. Alex Rivera",
            "user_role": "organizer",
            "action": "SUBMIT_EVENT_PROPOSAL",
            "resource_type": "event",
            "resource_id": event_cultural_id,
            "details": {"title": "Annual University Cultural Fest — Riviera 2026"},
            "timestamp": "2026-10-25T14:30:00Z"
        },
        "log-3": {
            "id": "log-3",
            "user_id": organizer_id,
            "user_name": "Prof. Alex Rivera",
            "user_role": "organizer",
            "action": "CHECK_IN_ATTENDEE",
            "resource_type": "attendance",
            "resource_id": reg_web3_id,
            "details": {"student": "Alex Chen", "event": "Full-Stack Web3 Bootcamp", "ticket": "TKT-WEB3-DONE-10"},
            "timestamp": "2026-10-10T09:45:00Z"
        }
    }

    # Write fresh dataset to local db.json
    db.data = fresh_data
    db.save()
    print("Local database updated with fresh coherent dataset.")

    # Now empty and sync Firestore
    if db.firestore:
        print("Clearing all old documents from cloud Firestore...")
        cols = ["users", "events", "registrations", "notifications", "feedback", "certificates", "audit_logs"]
        for col_name in cols:
            docs = list(db.firestore.collection(col_name).stream())
            if docs:
                batch = db.firestore.batch()
                b_count = 0
                for d in docs:
                    batch.delete(d.reference)
                    b_count += 1
                    if b_count >= 400:
                        batch.commit()
                        batch = db.firestore.batch()
                        b_count = 0
                if b_count > 0:
                    batch.commit()
                print(f"  - Emptied {len(docs)} documents from Firestore [{col_name}]")

        print("Uploading fresh coherent dataset to cloud Firestore...")
        db.sync_all_to_firestore()
        print("SUCCESS! Cloud Firestore is now completely clean and populated with the new data!")

if __name__ == "__main__":
    reset_and_seed()
