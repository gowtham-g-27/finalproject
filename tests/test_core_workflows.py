import unittest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database import db

client = TestClient(app)

class TestSmartCollegeEventSystem(unittest.TestCase):

    def setUp(self):
        # Reset sample data fresh for tests
        db.seed_initial_data()

    def test_01_authentication_valid_and_invalid(self):
        # Valid student login
        res = client.post("/api/v1/auth/login", json={"email": "student@campus.edu", "password": "student123"})
        self.assertEqual(res.status_code, 200)
        token_data = res.json()
        self.assertIn("access_token", token_data)
        self.assertEqual(token_data["user"]["role"], "student")

        # Invalid password
        bad_res = client.post("/api/v1/auth/login", json={"email": "student@campus.edu", "password": "wrongpassword"})
        self.assertEqual(bad_res.status_code, 401)

    def test_02_rbac_student_blocked_from_admin(self):
        # Login as student
        res = client.post("/api/v1/auth/login", json={"email": "student@campus.edu", "password": "student123"})
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Attempt to access admin users list
        admin_res = client.get("/api/v1/admin/users", headers=headers)
        self.assertEqual(admin_res.status_code, 403)

    def test_03_event_submission_and_approval_workflow(self):
        # Login as organizer
        org_res = client.post("/api/v1/auth/login", json={"email": "organizer@campus.edu", "password": "organizer123"})
        org_token = org_res.json()["access_token"]
        org_headers = {"Authorization": f"Bearer {org_token}"}

        # Create new event (status should be pending)
        new_event = {
            "title": "Quantum AI Workshop 2026",
            "description": "Exploration of quantum gates and algorithms.",
            "category": "Workshop",
            "venue": "Physics Lab 2",
            "date": "2026-11-15",
            "start_time": "10:00",
            "end_time": "13:00",
            "registration_deadline": "2026-11-14T23:59",
            "capacity": 2,
            "tags": ["Quantum", "AI"]
        }
        create_res = client.post("/api/v1/events", json=new_event, headers=org_headers)
        self.assertEqual(create_res.status_code, 200)
        created = create_res.json()
        ev_id = created["id"]
        self.assertEqual(created["status"], "pending")

        # Admin approves the event
        admin_res = client.post("/api/v1/auth/login", json={"email": "admin@campus.edu", "password": "admin123"})
        admin_token = admin_res.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        approve_res = client.post(f"/api/v1/admin/events/{ev_id}/approve", headers=admin_headers)
        self.assertEqual(approve_res.status_code, 200)

        # Check public listing shows approved event
        ev_detail = client.get(f"/api/v1/events/{ev_id}").json()
        self.assertEqual(ev_detail["status"], "approved")

    def test_04_capacity_waitlist_and_auto_promotion(self):
        # Create an event with capacity 1
        admin_res = client.post("/api/v1/auth/login", json={"email": "admin@campus.edu", "password": "admin123"})
        admin_headers = {"Authorization": f"Bearer {admin_res.json()['access_token']}"}

        event_res = client.post("/api/v1/events", json={
            "title": "Micro Capacity Masterclass",
            "description": "Strict 1-person seat to test capacity and waitlist promotion.",
            "category": "Technical",
            "venue": "Room 101",
            "date": "2026-12-01",
            "start_time": "14:00",
            "end_time": "16:00",
            "registration_deadline": "2026-11-30T23:59",
            "capacity": 1,
            "tags": ["Testing"]
        }, headers=admin_headers)
        ev_id = event_res.json()["id"]

        # Student 1 registers -> Confirmed seat
        s1_res = client.post("/api/v1/auth/login", json={"email": "student@campus.edu", "password": "student123"})
        s1_headers = {"Authorization": f"Bearer {s1_res.json()['access_token']}"}
        reg1_res = client.post("/api/v1/registrations", json={"event_id": ev_id}, headers=s1_headers)
        self.assertEqual(reg1_res.status_code, 200)
        self.assertEqual(reg1_res.json()["status"], "confirmed")
        reg1_id = reg1_res.json()["id"]

        # Duplicate registration attempt by Student 1 -> Blocked
        dup_res = client.post("/api/v1/registrations", json={"event_id": ev_id}, headers=s1_headers)
        self.assertEqual(dup_res.status_code, 400)

        # Student 2 registers -> Capacity full -> Placed on Waitlist
        s2_res = client.post("/api/v1/auth/login", json={"email": "priya.patel@campus.edu", "password": "student123"})
        s2_headers = {"Authorization": f"Bearer {s2_res.json()['access_token']}"}
        reg2_res = client.post("/api/v1/registrations", json={"event_id": ev_id}, headers=s2_headers)
        self.assertEqual(reg2_res.status_code, 200)
        self.assertEqual(reg2_res.json()["status"], "waitlisted")

        # Student 1 cancels -> Automatic promotion of Student 2!
        cancel_res = client.delete(f"/api/v1/registrations/{reg1_id}", headers=s1_headers)
        self.assertEqual(cancel_res.status_code, 200)
        self.assertTrue(cancel_res.json()["promoted_waitlist"])

        # Verify Student 2's registration is now CONFIRMED!
        s2_my_regs = client.get("/api/v1/registrations/my", headers=s2_headers).json()
        s2_updated_reg = next(r for r in s2_my_regs if r["event_id"] == ev_id)
        self.assertEqual(s2_updated_reg["status"], "confirmed")

    def test_05_qr_checkin_and_repeated_scan_protection(self):
        # Locate confirmed registration from seed data (ev1)
        confirmed_reg = next(r for r in db.data["registrations"].values() if r["status"] == "confirmed")
        ticket_code = confirmed_reg["ticket_code"]
        ev_id = confirmed_reg["event_id"]

        # Organizer scans QR ticket
        org_res = client.post("/api/v1/auth/login", json={"email": "organizer@campus.edu", "password": "organizer123"})
        org_headers = {"Authorization": f"Bearer {org_res.json()['access_token']}"}

        checkin_res = client.post("/api/v1/attendance/check-in", json={
            "ticket_code": ticket_code,
            "event_id": ev_id
        }, headers=org_headers)

        self.assertEqual(checkin_res.status_code, 200)
        self.assertTrue(checkin_res.json()["success"])
        self.assertFalse(checkin_res.json()["already_checked_in"])

        # Second scan attempt -> Detected as already checked in!
        repeat_res = client.post("/api/v1/attendance/check-in", json={
            "ticket_code": ticket_code,
            "event_id": ev_id
        }, headers=org_headers)

        self.assertEqual(repeat_res.status_code, 200)
        self.assertTrue(repeat_res.json()["already_checked_in"])
        self.assertIn("ALREADY", repeat_res.json()["message"])

    def test_06_pdf_certificate_generation_and_verification(self):
        # Query seed certificate
        cert = list(db.data["certificates"].values())[0]
        cert_num = cert["certificate_number"]
        cert_id = cert["id"]

        # Public verification endpoint
        verify_res = client.get(f"/api/v1/certificates/verify/{cert_num}")
        self.assertEqual(verify_res.status_code, 200)
        self.assertTrue(verify_res.json()["verified"])

        # Download PDF
        pdf_res = client.get(f"/api/v1/certificates/download/{cert_id}")
        self.assertEqual(pdf_res.status_code, 200)
        self.assertEqual(pdf_res.headers["content-type"], "application/pdf")
        self.assertTrue(len(pdf_res.content) > 500)

if __name__ == "__main__":
    unittest.main()
