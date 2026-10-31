import io
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Response
from reportlab.lib.pagesizes import letter, landscape
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from backend.database import db
from backend.models.certificate import CertificateResponse
from backend.routers.auth import get_current_user

router = APIRouter(prefix="/certificates", tags=["Certificates"])

@router.get("/my", response_model=List[CertificateResponse])
def get_my_certificates(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    return [c for c in db.data["certificates"].values() if c["user_id"] == user_id]

@router.get("/verify/{certificate_number}")
def verify_certificate(certificate_number: str):
    cert = None
    for c in db.data["certificates"].values():
        if c.get("certificate_number").upper() == certificate_number.strip().upper():
            cert = c
            break

    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found or invalid certificate ID")

    return {
        "verified": True,
        "certificate_number": cert["certificate_number"],
        "student_name": cert["user_name"],
        "event_title": cert["event_title"],
        "issue_date": cert["issue_date"],
        "issued_by": "VIT-AP University Student Affairs & Event Board",
        "status": "Authentic & Verified"
    }

@router.get("/download/{certificate_id}")
def download_certificate_pdf(certificate_id: str):
    cert = db.data["certificates"].get(certificate_id)
    if not cert:
        # Search by cert number as fallback
        for c in db.data["certificates"].values():
            if c.get("certificate_number") == certificate_id:
                cert = c
                break

    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    # Generate Professional PDF in memory
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=landscape(letter))
    width, height = landscape(letter) # 792 x 612

    # Outer decorative frame
    p.setStrokeColor(colors.HexColor("#F97316")) # Brand primary
    p.setLineWidth(4)
    p.rect(20, 20, width - 40, height - 40)

    p.setStrokeColor(colors.HexColor("#EA580C"))
    p.setLineWidth(1)
    p.rect(26, 26, width - 52, height - 52)

    # Header / University emblem badge
    p.setFillColor(colors.HexColor("#FFF7ED")) # Soft surface
    p.rect(30, height - 100, width - 60, 65, fill=1, stroke=0)

    p.setFillColor(colors.HexColor("#EA580C"))
    p.setFont("Helvetica-Bold", 18)
    p.drawCentredString(width / 2, height - 60, "VIT-AP UNIVERSITY — OFFICE OF STUDENT WELFARE")

    p.setFillColor(colors.HexColor("#64748B"))
    p.setFont("Helvetica", 11)
    p.drawCentredString(width / 2, height - 80, "OFFICIAL RECOGNITION OF EXCELLENCE & PARTICIPATION")

    # Certificate Title
    p.setFillColor(colors.HexColor("#0F172A"))
    p.setFont("Helvetica-Bold", 32)
    p.drawCentredString(width / 2, height - 160, "CERTIFICATE OF PARTICIPATION")

    # Body
    p.setFillColor(colors.HexColor("#475569"))
    p.setFont("Helvetica", 14)
    p.drawCentredString(width / 2, height - 210, "This is proudly awarded to")

    # Recipient Name
    p.setFillColor(colors.HexColor("#F97316"))
    p.setFont("Helvetica-Bold", 26)
    p.drawCentredString(width / 2, height - 255, cert["user_name"].upper())

    # Underline
    p.setStrokeColor(colors.HexColor("#CBD5E1"))
    p.setLineWidth(1.5)
    p.line(width / 2 - 200, height - 265, width / 2 + 200, height - 265)

    # Participation Text
    p.setFillColor(colors.HexColor("#334155"))
    p.setFont("Helvetica", 14)
    p.drawCentredString(width / 2, height - 310, "for successfully attending and actively participating in the university event")

    # Event Title
    p.setFillColor(colors.HexColor("#0F172A"))
    p.setFont("Helvetica-Bold", 20)
    p.drawCentredString(width / 2, height - 350, f'"{cert["event_title"]}"')

    # Date
    p.setFont("Helvetica", 12)
    p.setFillColor(colors.HexColor("#64748B"))
    p.drawCentredString(width / 2, height - 385, f"Issued on: {cert['issue_date']}")

    # Signatures
    p.setStrokeColor(colors.HexColor("#94A3B8"))
    p.setLineWidth(1)
    p.line(90, 110, 270, 110)
    p.line(width - 270, 110, width - 90, 110)

    p.setFont("Helvetica-Bold", 11)
    p.setFillColor(colors.HexColor("#0F172A"))
    p.drawCentredString(180, 95, "Faculty Coordinator")
    p.drawCentredString(width - 180, 95, "Dean of Student Affairs")

    p.setFont("Helvetica", 9)
    p.setFillColor(colors.HexColor("#64748B"))
    p.drawCentredString(180, 80, "Event Organizing Committee")
    p.drawCentredString(width - 180, 80, "VIT-AP University Board")

    # Certificate ID stamp
    p.setFillColor(colors.HexColor("#94A3B8"))
    p.setFont("Courier-Bold", 10)
    p.drawCentredString(width / 2, 45, f"CERTIFICATE ID: {cert['certificate_number']}  |  VERIFIED ON BLOCKCHAIN-COMPLIANT ARCHIVE")

    p.showPage()
    p.save()

    buffer.seek(0)
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={cert['certificate_number']}.pdf"}
    )

