import os

class Settings:
    PROJECT_NAME: str = "Smart College Event Management System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-jwt-key-for-college-event-hub-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Firebase configuration
    FIREBASE_CREDENTIALS_PATH: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "backend/firebase-credentials.json")
    USE_FIREBASE: bool = os.getenv("USE_FIREBASE", "false").lower() in ("true", "1", "yes")

settings = Settings()
