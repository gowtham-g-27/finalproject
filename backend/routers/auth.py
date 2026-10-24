import uuid
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from backend.config import settings
from backend.database import db
from backend.models.user import UserCreate, UserLogin, UserResponse, Token

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or session expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Try Firebase ID Token verification if Firebase is initialized
    if db.firestore:
        try:
            from firebase_admin import auth as fb_auth
            decoded_token = fb_auth.verify_id_token(token)
            uid = decoded_token.get("uid")
            email = decoded_token.get("email")
            # Sync or fetch local record
            for u in db.data["users"].values():
                if u.get("email") == email or u.get("id") == uid:
                    return u
            # Auto-create if not in local db
            new_u = {
                "id": uid,
                "email": email,
                "password_hash": "",
                "full_name": decoded_token.get("name", email.split("@")[0]),
                "role": "student",
                "department": "Computer Science",
                "student_id": f"ID-{uid[:6]}",
                "phone": "",
                "interests": [],
                "is_active": True,
                "created_at": datetime.utcnow().isoformat() + "Z"
            }
            db.data["users"][uid] = new_u
            db.save()
            return new_u
        except Exception:
            pass

    # Standard JWT decoding
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.data["users"].get(user_id)
    if user is None or not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="User account inactive or not found")
    return user

def require_role(allowed_roles: list):
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required roles: {allowed_roles}"
            )
        return current_user
    return role_checker

@router.post("/signup", response_model=Token)
def signup(user_in: UserCreate):
    for u in db.data["users"].values():
        if u["email"].lower() == user_in.email.lower():
            raise HTTPException(status_code=400, detail="An account with this email already exists")

    uid = str(uuid.uuid4())
    user_data = {
        "id": uid,
        "email": user_in.email.lower(),
        "password_hash": db.hash_password(user_in.password),
        "full_name": user_in.full_name,
        "role": user_in.role.value,
        "department": user_in.department,
        "student_id": user_in.student_id or f"STU-{uid[:6].upper()}",
        "phone": user_in.phone or "",
        "interests": user_in.interests,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    
    db.data["users"][uid] = user_data
    db.save()
    
    db.log_audit(uid, user_in.full_name, user_in.role.value, "USER_SIGNUP", "user", uid)
    db.create_notification(uid, "Welcome to Campus Events Hub", "Your account has been registered successfully.", "success", "/events")

    token = create_access_token({"sub": uid, "role": user_data["role"], "email": user_data["email"]})
    return {"access_token": token, "token_type": "bearer", "user": user_data}

@router.post("/login", response_model=Token)
def login(credentials: UserLogin):
    user = None
    for u in db.data["users"].values():
        if u["email"].lower() == credentials.email.lower():
            user = u
            break
            
    if not user or not db.verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is suspended. Please contact administrator.")

    token = create_access_token({"sub": user["id"], "role": user["role"], "email": user["email"]})
    db.log_audit(user["id"], user["full_name"], user["role"], "USER_LOGIN", "auth", user["id"])
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(profile_data: dict, current_user: dict = Depends(get_current_user)):
    uid = current_user["id"]
    allowed = ["full_name", "department", "phone", "interests", "student_id"]
    for k in allowed:
        if k in profile_data:
            db.data["users"][uid][k] = profile_data[k]
    db.save()
    return db.data["users"][uid]
