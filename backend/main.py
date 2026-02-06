from fastapi import FastAPI, Depends, HTTPException, status
import uvicorn
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from fastapi.responses import JSONResponse
from threading import Thread

from abimanyu_ai import ai_response
from voice import get_audio_base64
from database import get_db, init_db, SessionLocal
from models import User, ChatMessage
from nlp.sentiment import analyze_sentiment
from auth import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    decode_access_token,
    verify_google_token
)
from utils.rag import init_rag

app = FastAPI(title="Abimanyu AI", version="2.0")

# Limit request body size to 1MB to prevent memory crashes
class LimitedBodyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        try:
            if content_length and int(content_length) > 1024 * 1024:  # 1MB limit
                return JSONResponse({"detail": "Payload too large"}, status_code=413)
        except ValueError:
            # If content-length is not an int, ignore and continue
            pass
        return await call_next(request)

app.add_middleware(LimitedBodyMiddleware)

# Initialize database and RAG on startup
@app.on_event("startup")
def startup():
    init_db()

    # Initialize RAG in a background thread so server startup isn't blocked
    def _init_rag_bg():
        try:
            init_rag()
        except Exception as e:
            print("RAG initialization failed:", e)

    t = Thread(target=_init_rag_bg, daemon=True)
    t.start()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

@app.get("/rag/stats")
def rag_stats():
    """Get RAG pipeline statistics"""
    from utils.rag import get_rag
    try:
        rag = get_rag()
        stats = rag.get_stats()
        return {"success": True, "data": stats}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/test/create-demo-user")
def create_demo_user(db: Session = Depends(get_db)):
    """Create a demo user for testing."""
    try:
        existing = db.query(User).filter(User.email == "demo@example.com").first()
        if existing:
            return {
                "success": True,
                "message": "Demo user already exists",
                "email": "demo@example.com",
                "password": "demo123"
            }
        
        demo_user = User(
            email="demo@example.com",
            password_hash=get_password_hash("demo123"),
            name="Demo User"
        )
        db.add(demo_user)
        db.commit()
        
        return {
            "success": True,
            "message": "Demo user created successfully",
            "email": "demo@example.com",
            "password": "demo123"
        }
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }

# Security
security = HTTPBearer(auto_error=False)

# --- Pydantic Models ---

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    access_token: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class UserResponse(BaseModel):
    id: int
    email: str
    name: Optional[str]
    avatar_url: Optional[str]

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    sentiment: str
    audio: Optional[str] = None

class ChatHistoryItem(BaseModel):
    id: int
    content: str
    is_ai: bool
    timestamp: datetime

# --- Helper Functions ---

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get current authenticated user from JWT token."""
    if not credentials:
        return None
    
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        return None
    
    user_id = payload.get("sub")
    if not user_id:
        return None
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    return user

def require_auth(user: Optional[User] = Depends(get_current_user)) -> User:
    """Require authentication - raises 401 if not authenticated."""
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

# --- Auth Endpoints ---

@app.post("/auth/register", response_model=AuthResponse)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user with email and password."""
    print(f"Registering user: {request.email}")
    try:
        # Check if user exists
        print("Checking if user exists...")
        existing_user = db.query(User).filter(User.email == request.email).first()
        if existing_user:
            print("User already exists.")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user
        print("Hashing password...")
        hashed_password = get_password_hash(request.password)
        print("Creating user object...")
        user = User(
            email=request.email,
            password_hash=hashed_password,
            name=request.name or request.email.split("@")[0]
        )
        print("Adding to session...")
        db.add(user)
        print("Committing to DB...")
        db.commit()
        print("Refreshing user...")
        db.refresh(user)
        
        # Create token
        print("Creating access token...")
        access_token = create_access_token(data={"sub": str(user.id)})
        
        print("Registration successful.")
        return AuthResponse(
            access_token=access_token,
            user={
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "avatar_url": user.avatar_url
            }
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error during registration: {str(e)}"
        )

@app.post("/auth/login", response_model=AuthResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login with email and password."""
    print(f"🔐 Login attempt for: {request.email}")
    
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        print(f"❌ User not found: {request.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user.password_hash:
        print(f"❌ User has no password hash: {request.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not verify_password(request.password, user.password_hash):
        print(f"❌ Password verification failed for: {request.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    print(f"✅ Login successful for: {request.email}")
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return AuthResponse(
        access_token=access_token,
        user={
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "avatar_url": user.avatar_url
        }
    )

@app.post("/auth/google", response_model=AuthResponse)
def google_auth(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Authenticate with Google OAuth."""
    # Verify Google token
    google_user = verify_google_token(request.access_token)
    if not google_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token"
        )
    
    email = google_user.get("email")
    google_id = google_user.get("sub")
    name = google_user.get("name")
    picture = google_user.get("picture")
    
    # Find or create user
    user = db.query(User).filter(
        (User.email == email) | (User.google_id == google_id)
    ).first()
    
    if not user:
        # Create new user
        user = User(
            email=email,
            google_id=google_id,
            name=name,
            avatar_url=picture
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update existing user with Google info
        if not user.google_id:
            user.google_id = google_id
        if not user.avatar_url:
            user.avatar_url = picture
        if not user.name:
            user.name = name
        db.commit()
    
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return AuthResponse(
        access_token=access_token,
        user={
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "avatar_url": user.avatar_url
        }
    )

@app.get("/auth/me", response_model=UserResponse)
def get_me(user: User = Depends(require_auth)):
    """Get current user profile."""
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        avatar_url=user.avatar_url
    )

# --- Chat Endpoints ---

@app.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest, 
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user)
):
    """Send a chat message and get AI response. Optionally saves history if authenticated."""
    try:
        history = []
        # Save user message if authenticated
        if user:
            user_msg = ChatMessage(
                user_id=user.id,
                content=request.message,
                is_ai=False
            )
            db.add(user_msg)
            
            # Fetch recent history for context (last 10 messages)
            recent_msgs = db.query(ChatMessage).filter(
                ChatMessage.user_id == user.id
            ).order_by(ChatMessage.timestamp.desc()).limit(10).all()
            
            # Convert to service format
            for msg in reversed(recent_msgs):
                history.append({
                    "role": "model" if msg.is_ai else "user",
                    "content": msg.content
                })

        # Get AI response (now async)
        reply = await ai_response(request.message, history=history)
        
        # Analyze sentiment
        sentiment = analyze_sentiment(request.message)
        
        # Save AI response if authenticated
        if user:
            ai_msg = ChatMessage(
                user_id=user.id,
                content=reply,
                is_ai=True
            )
            db.add(ai_msg)
            db.commit()
        
        # Generate audio (optional)
        audio_b64 = get_audio_base64(reply)
        
        return ChatResponse(reply=reply, sentiment=sentiment, audio=audio_b64)
    
    except Exception as e:
        print(f"Chat Error: {e}")
        return ChatResponse(
            reply="I'm experiencing some technical difficulties. Please try again later.",
            sentiment="neutral",
            audio=None
        )

@app.get("/chat/history", response_model=List[ChatHistoryItem])
def get_chat_history(
    limit: int = 50,
    user: User = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """Get chat history for authenticated user."""
    messages = db.query(ChatMessage).filter(
        ChatMessage.user_id == user.id
    ).order_by(ChatMessage.timestamp.desc()).limit(limit).all()
    
    # Reverse to get chronological order
    messages.reverse()
    
    return [
        ChatHistoryItem(
            id=msg.id,
            content=msg.content,
            is_ai=msg.is_ai,
            timestamp=msg.timestamp
        )
        for msg in messages
    ]

@app.delete("/chat/history")
def clear_chat_history(
    user: User = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """Clear chat history for authenticated user."""
    db.query(ChatMessage).filter(ChatMessage.user_id == user.id).delete()
    db.commit()
    return {"message": "Chat history cleared"}

# ========== RAG MANAGEMENT ENDPOINTS ==========
@app.post("/admin/rag/rebuild")
def rebuild_rag_index():
    """Rebuild vector index from PDFs (admin only)"""
    try:
        from utils.rag_pipeline import get_rag_pipeline
        rag = get_rag_pipeline()
        success = rag.build_index()
        if success:
            return {"status": "success", "message": f"RAG index rebuilt with {len(rag.chunks)} chunks"}
        else:
            return {"status": "error", "message": "Failed to build index"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/admin/rag/status")
def rag_status():
    """Get RAG pipeline status"""
    try:
        from utils.rag_pipeline import get_rag_pipeline
        rag = get_rag_pipeline()
        return {
            "status": "ready" if rag.vector_store else "not_ready",
            "chunks_count": len(rag.chunks),
            "model": rag.model_name
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=False,
        ssl_keyfile="key.pem", 
        ssl_certfile="cert.pem"
    )
