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
    clean_email = user_in.email.strip().lower()
    clean_stu_id = (user_in.student_id or "").strip()

    for u in db.data["users"].values():
        if u.get("email", "").strip().lower() == clean_email:
            raise HTTPException(status_code=400, detail="An account with this email already exists")
        if clean_stu_id and u.get("student_id", "").strip().lower() == clean_stu_id.lower():
            raise HTTPException(status_code=400, detail=f"An account with College ID '{clean_stu_id}' already exists")

    uid = str(uuid.uuid4())
    user_data = {
        "id": uid,
        "email": clean_email,
        "password_hash": db.hash_password(user_in.password.strip()),
        "full_name": user_in.full_name.strip(),
        "role": user_in.role.value,
        "department": user_in.department,
        "student_id": clean_stu_id or f"24MIS{uid[:4].upper()}",
        "phone": (user_in.phone or "").strip(),
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
    ident = credentials.email.strip().lower()
    clean_pass = credentials.password.strip()

    # Allow login by Email, College ID (24MISXXXX), or Username / Name
    for u in db.data["users"].values():
        u_email = u.get("email", "").strip().lower()
        u_stu_id = u.get("student_id", "").strip().lower()
        u_name = u.get("full_name", "").strip().lower()
        u_prefix = u_email.split("@")[0] if "@" in u_email else ""

        if ident in (u_email, u_stu_id, u_name, u_prefix):
            user = u
            break
            
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username, college ID, or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify password against hash (support exact or trimmed)
    password_ok = db.verify_password(credentials.password, user["password_hash"]) or \
                  db.verify_password(clean_pass, user["password_hash"])

    if not password_ok:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password for this account",
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

