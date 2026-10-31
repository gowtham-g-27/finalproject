from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.config import settings
from backend.routers import (
    auth,
    events,
    registrations,
    attendance,
    certificates,
    feedback,
    analytics,
    admin,
    notifications,
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for Smart College Event Management System",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc) or "Internal server error occurred"}
    )

# Include Routers
api_v1 = settings.API_V1_STR
app.include_router(auth.router, prefix=api_v1)
app.include_router(events.router, prefix=api_v1)
app.include_router(registrations.router, prefix=api_v1)
app.include_router(attendance.router, prefix=api_v1)
app.include_router(certificates.router, prefix=api_v1)
app.include_router(feedback.router, prefix=api_v1)
app.include_router(analytics.router, prefix=api_v1)
app.include_router(admin.router, prefix=api_v1)
app.include_router(notifications.router, prefix=api_v1)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

