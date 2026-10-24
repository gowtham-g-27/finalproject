import os
import json
import uuid
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import bcrypt
from backend.config import settings

class Database:
    def __init__(self):
        self.lock = threading.RLock()
        self.db_path = os.path.join(os.path.dirname(__file__), "data", "db.json")
        self.firestore = None
        self._init_firebase()
        self.data: Dict[str, Any] = {
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
        self.load()
        if not self.data["users"]:
            self.seed_initial_data()

    def _init_firebase(self):
        if settings.USE_FIREBASE and os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
            try:
                import firebase_admin
                from firebase_admin import credentials, firestore
                if not firebase_admin._apps:
                    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
                    firebase_admin.initialize_app(cred)
                self.firestore = firestore.client()
                print("Connected to Firebase Firestore successfully.")
            except Exception as e:
                print(f"Firebase initialization error: {e}. Falling back to atomic local persistence.")
                self.firestore = None

    def hash_password(self, password: str) -> str:
        return bcrypt.hashpw(password.encode("utf-8")[:72], bcrypt.gensalt()).decode("utf-8")

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        try:
            return bcrypt.checkpw(plain_password.encode("utf-8")[:72], hashed_password.encode("utf-8"))
        except Exception:
            return False

    def load(self):
        with self.lock:
            if os.path.exists(self.db_path):
                try:
                    with open(self.db_path, "r", encoding="utf-8") as f:
                        self.data = json.load(f)
                except Exception as e:
                    print(f"Failed to load DB file: {e}")

    def save(self):
        with self.lock:
            os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
            with open(self.db_path, "w", encoding="utf-8") as f:
                json.dump(self.data, f, indent=2, ensure_ascii=False)

    def log_audit(self, user_id: str, user_name: str, user_role: str, action: str, resource_type: str, resource_id: str, details: Optional[Dict] = None):
        log_id = str(uuid.uuid4())
        entry = {
            "id": log_id,
            "user_id": user_id,
            "user_name": user_name,
            "user_role": user_role,
            "action": action,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "details": details or {},
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        self.data["audit_logs"][log_id] = entry
        self.save()
        return entry

    def create_notification(self, user_id: str, title: str, message: str, n_type: str = "info", link: Optional[str] = None):
        nid = str(uuid.uuid4())
        notification = {
            "id": nid,
            "user_id": user_id,
            "title": title,
            "message": message,
            "type": n_type,
            "link": link,
            "is_read": False,
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        self.data["notifications"][nid] = notification
        self.save()
        return notification

    def seed_initial_data(self):
        print("Seeding rich realistic university sample data...")
        admin_id = str(uuid.uuid4())
        organizer_id = str(uuid.uuid4())
        student_id = str(uuid.uuid4())
        student2_id = str(uuid.uuid4())

        self.data["users"] = {
            admin_id: {
                "id": admin_id,
                "email": "admin@campus.edu",
                "password_hash": self.hash_password("admin123"),
                "full_name": "Dr. Sarah Jenkins",
                "role": "admin",
                "department": "Dean of Student Affairs",
                "student_id": "FAC-001",
                "phone": "+1 555-0199",
                "interests": ["Campus Leadership", "Accreditation", "Events Oversight"],
                "is_active": True,
                "created_at": (datetime.utcnow() - timedelta(days=90)).isoformat() + "Z"
            },
            organizer_id: {
                "id": organizer_id,
                "email": "organizer@campus.edu",
                "password_hash": self.hash_password("organizer123"),
                "full_name": "Prof. Alex Rivera",
                "role": "organizer",
                "department": "Computer Science & Engineering",
                "student_id": "ORG-402",
                "phone": "+1 555-0144",
                "interests": ["Hackathons", "AI/ML", "Competitive Programming"],
                "is_active": True,
                "created_at": (datetime.utcnow() - timedelta(days=60)).isoformat() + "Z"
            },
            student_id: {
                "id": student_id,
                "email": "student@campus.edu",
                "password_hash": self.hash_password("student123"),
                "full_name": "Rohan Sharma",
                "role": "student",
                "department": "Computer Science",
                "student_id": "CS-2023-042",
                "phone": "+1 555-0182",
                "interests": ["Technical", "Workshop", "Competition"],
                "is_active": True,
                "created_at": (datetime.utcnow() - timedelta(days=30)).isoformat() + "Z"
            },
            student2_id: {
                "id": student2_id,
                "email": "priya.patel@campus.edu",
                "password_hash": self.hash_password("student123"),
                "full_name": "Priya Patel",
                "role": "student",
                "department": "Information Technology",
                "student_id": "IT-2023-088",
                "phone": "+1 555-0183",
                "interests": ["Cultural", "Seminar", "Technical"],
                "is_active": True,
                "created_at": (datetime.utcnow() - timedelta(days=25)).isoformat() + "Z"
            }
        }

        # Events
        ev1_id = str(uuid.uuid4())
        ev2_id = str(uuid.uuid4())
        ev3_id = str(uuid.uuid4())
        ev4_id = str(uuid.uuid4())
        ev5_id = str(uuid.uuid4())

        now = datetime.utcnow()
        future_day3 = (now + timedelta(days=3)).strftime("%Y-%m-%d")
        future_day7 = (now + timedelta(days=7)).strftime("%Y-%m-%d")
        future_day14 = (now + timedelta(days=14)).strftime("%Y-%m-%d")
        past_day5 = (now - timedelta(days=5)).strftime("%Y-%m-%d")
        past_day12 = (now - timedelta(days=12)).strftime("%Y-%m-%d")

        self.data["events"] = {
            ev1_id: {
                "id": ev1_id,
                "title": "HackCampus 2026: 24-Hour AI Innovation Challenge",
                "description": "Join 200+ top collegiate developers, designers, and innovators building groundbreaking artificial intelligence solutions. Free swag, mentors from leading tech companies, and $5,000 in prizes!",
                "category": "Technical",
                "tags": ["AI", "Hackathon", "Coding", "Innovation"],
                "venue": "Turing Main Auditorium & Innovation Hub",
                "date": future_day7,
                "start_time": "09:00",
                "end_time": "18:00",
                "registration_deadline": f"{future_day7}T08:00",
                "capacity": 150,
                "poster_url": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
                "eligibility": "Undergraduate and Graduate Students",
                "is_featured": True,
                "organizer_id": organizer_id,
                "organizer_name": "Prof. Alex Rivera",
                "status": "approved",
                "rejection_reason": None,
                "registered_count": 1,
                "waitlist_count": 0,
                "attended_count": 0,
                "created_at": (now - timedelta(days=10)).isoformat() + "Z",
                "updated_at": (now - timedelta(days=9)).isoformat() + "Z"
            },
            ev2_id: {
                "id": ev2_id,
                "title": "Annual Inter-College Cultural Fiesta: 'Vibrance 2026'",
                "description": "Celebrate music, street theater, choreography, and culinary arts at the flagship annual cultural spectacle. Live concerts featuring guest indie artists in the open arena.",
                "category": "Cultural",
                "tags": ["Music", "Dance", "Art", "Drama"],
                "venue": "Grand Open Air Amphitheatre",
                "date": future_day14,
                "start_time": "16:00",
                "end_time": "22:00",
                "registration_deadline": f"{future_day14}T12:00",
                "capacity": 500,
                "poster_url": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
                "eligibility": "All enrolled college students & alumni guests",
                "is_featured": True,
                "organizer_id": organizer_id,
                "organizer_name": "Prof. Alex Rivera",
                "status": "approved",
                "rejection_reason": None,
                "registered_count": 1,
                "waitlist_count": 0,
                "attended_count": 0,
                "created_at": (now - timedelta(days=8)).isoformat() + "Z",
                "updated_at": (now - timedelta(days=7)).isoformat() + "Z"
            },
            ev3_id: {
                "id": ev3_id,
                "title": "Deep Learning & Neural Systems Hands-on Workshop",
                "description": "An intensive 4-hour lab on training Transformers, optimizing inference pipelines on PyTorch, and deploying models to production clusters with Docker.",
                "category": "Workshop",
                "tags": ["DeepLearning", "PyTorch", "Python", "DataScience"],
                "venue": "CS Lab Complex - Room 304",
                "date": future_day3,
                "start_time": "14:00",
                "end_time": "18:00",
                "registration_deadline": f"{future_day3}T10:00",
                "capacity": 2, # Small capacity to easily test capacity limit & waitlists!
                "poster_url": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
                "eligibility": "Pre-requisite: Python Basics",
                "is_featured": False,
                "organizer_id": organizer_id,
                "organizer_name": "Prof. Alex Rivera",
                "status": "approved",
                "rejection_reason": None,
                "registered_count": 2,
                "waitlist_count": 0,
                "attended_count": 0,
                "created_at": (now - timedelta(days=4)).isoformat() + "Z",
                "updated_at": (now - timedelta(days=3)).isoformat() + "Z"
            },
            ev4_id: {
                "id": ev4_id,
                "title": "Campus Cricket Super League Finals",
                "description": "The culminating championship face-off between Titans CSE and Mech Warriors. Trophies, medals, and live sports commentary.",
                "category": "Sports",
                "tags": ["Cricket", "Athletics", "Tournament"],
                "venue": "University Sports Pavilion",
                "date": past_day5,
                "start_time": "10:00",
                "end_time": "15:00",
                "registration_deadline": f"{past_day5}T09:00",
                "capacity": 300,
                "poster_url": "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80",
                "eligibility": "All students & faculty",
                "is_featured": False,
                "organizer_id": organizer_id,
                "organizer_name": "Prof. Alex Rivera",
                "status": "completed",
                "rejection_reason": None,
                "registered_count": 1,
                "waitlist_count": 0,
                "attended_count": 1,
                "created_at": (now - timedelta(days=20)).isoformat() + "Z",
                "updated_at": (now - timedelta(days=5)).isoformat() + "Z"
            },
            ev5_id: {
                "id": ev5_id,
                "title": "Quantum Computing & Cryptography Symposium",
                "description": "A research talk by visiting CERN fellows exploring post-quantum lattice cryptography and quantum key distribution.",
                "category": "Seminar",
                "tags": ["Physics", "Cryptography", "Research"],
                "venue": "Faculty Club Seminar Hall",
                "date": (now + timedelta(days=20)).strftime("%Y-%m-%d"),
                "start_time": "11:00",
                "end_time": "13:00",
                "registration_deadline": (now + timedelta(days=19)).strftime("%Y-%m-%d") + "T23:59",
                "capacity": 80,
                "poster_url": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80",
                "eligibility": "Physics & Engineering students",
                "is_featured": False,
                "organizer_id": organizer_id,
                "organizer_name": "Prof. Alex Rivera",
                "status": "pending", # Testing approval workflow!
                "rejection_reason": None,
                "registered_count": 0,
                "waitlist_count": 0,
                "attended_count": 0,
                "created_at": (now - timedelta(days=1)).isoformat() + "Z",
                "updated_at": (now - timedelta(days=1)).isoformat() + "Z"
            }
        }

        # Registrations
        reg1_id = str(uuid.uuid4())
        reg2_id = str(uuid.uuid4())
        reg3_id = str(uuid.uuid4()) # For completed event
        reg4_id = str(uuid.uuid4())

        self.data["registrations"] = {
            reg1_id: {
                "id": reg1_id,
                "event_id": ev1_id,
                "event_title": self.data["events"][ev1_id]["title"],
                "event_date": self.data["events"][ev1_id]["date"],
                "event_time": self.data["events"][ev1_id]["start_time"],
                "event_venue": self.data["events"][ev1_id]["venue"],
                "user_id": student_id,
                "user_name": "Rohan Sharma",
                "user_email": "student@campus.edu",
                "status": "confirmed",
                "ticket_code": f"TKT-HACK-{reg1_id[:8].upper()}",
                "registered_at": (now - timedelta(days=5)).isoformat() + "Z",
                "attended_at": None,
                "certificate_id": None
            },
            reg2_id: {
                "id": reg2_id,
                "event_id": ev3_id,
                "event_title": self.data["events"][ev3_id]["title"],
                "event_date": self.data["events"][ev3_id]["date"],
                "event_time": self.data["events"][ev3_id]["start_time"],
                "event_venue": self.data["events"][ev3_id]["venue"],
                "user_id": student_id,
                "user_name": "Rohan Sharma",
                "user_email": "student@campus.edu",
                "status": "confirmed",
                "ticket_code": f"TKT-DL-{reg2_id[:8].upper()}",
                "registered_at": (now - timedelta(days=3)).isoformat() + "Z",
                "attended_at": None,
                "certificate_id": None
            },
            reg3_id: {
                "id": reg3_id,
                "event_id": ev4_id,
                "event_title": self.data["events"][ev4_id]["title"],
                "event_date": self.data["events"][ev4_id]["date"],
                "event_time": self.data["events"][ev4_id]["start_time"],
                "event_venue": self.data["events"][ev4_id]["venue"],
                "user_id": student_id,
                "user_name": "Rohan Sharma",
                "user_email": "student@campus.edu",
                "status": "attended",
                "ticket_code": f"TKT-SPORTS-{reg3_id[:8].upper()}",
                "registered_at": (now - timedelta(days=15)).isoformat() + "Z",
                "attended_at": (now - timedelta(days=5, hours=4)).isoformat() + "Z",
                "certificate_id": None
            },
            reg4_id: {
                "id": reg4_id,
                "event_id": ev3_id,
                "event_title": self.data["events"][ev3_id]["title"],
                "event_date": self.data["events"][ev3_id]["date"],
                "event_time": self.data["events"][ev3_id]["start_time"],
                "event_venue": self.data["events"][ev3_id]["venue"],
                "user_id": student2_id,
                "user_name": "Priya Patel",
                "user_email": "priya.patel@campus.edu",
                "status": "confirmed",
                "ticket_code": f"TKT-DL-{reg4_id[:8].upper()}",
                "registered_at": (now - timedelta(days=2)).isoformat() + "Z",
                "attended_at": None,
                "certificate_id": None
            }
        }

        # Certificate for completed event
        cert_id = str(uuid.uuid4())
        self.data["certificates"][cert_id] = {
            "id": cert_id,
            "certificate_number": f"CERT-2026-{cert_id[:8].upper()}",
            "event_id": ev4_id,
            "event_title": self.data["events"][ev4_id]["title"],
            "user_id": student_id,
            "user_name": "Rohan Sharma",
            "issue_date": past_day5,
            "verified": True
        }
        self.data["registrations"][reg3_id]["certificate_id"] = cert_id

        # Feedback for completed event
        fb_id = str(uuid.uuid4())
        self.data["feedback"][fb_id] = {
            "id": fb_id,
            "event_id": ev4_id,
            "user_id": student_id,
            "user_name": "Rohan Sharma",
            "rating": 5,
            "organization_rating": 5,
            "content_rating": 5,
            "comment": "Outstanding organization! Ground facilities, scoreboards, and crowd management were top notch.",
            "created_at": (now - timedelta(days=4)).isoformat() + "Z"
        }

        # Notifications
        self.create_notification(
            student_id,
            "Registration Confirmed",
            "You are registered for HackCampus 2026. Your QR ticket is ready in your dashboard.",
            "success",
            f"/events/{ev1_id}"
        )
        self.create_notification(
            student_id,
            "Certificate Available",
            "Your participation certificate for Campus Cricket Super League is now ready to download.",
            "info",
            "/certificates"
        )
        self.create_notification(
            admin_id,
            "New Event Submitted for Review",
            "Prof. Alex Rivera submitted 'Quantum Computing & Cryptography Symposium' for approval.",
            "warning",
            "/admin/events"
        )

        # Audit log entries
        self.log_audit(
            organizer_id, "Prof. Alex Rivera", "organizer",
            "EVENT_SUBMITTED", "event", ev5_id, {"title": self.data["events"][ev5_id]["title"]}
        )
        self.log_audit(
            admin_id, "Dr. Sarah Jenkins", "admin",
            "EVENT_APPROVED", "event", ev1_id, {"title": self.data["events"][ev1_id]["title"]}
        )

        self.save()
        print("Initial data seeded successfully.")

db = Database()
