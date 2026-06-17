from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import jwt, JWTError
from datetime import datetime, timedelta
from database import get_db
from models import User
from config import settings

security = HTTPBearer(auto_error=False)

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_app_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])


def decode_supabase_token(token: str) -> dict:
    """Decode Supabase JWT using the shared JWT secret.

    Supabase JWT secrets are base64url-encoded strings. We try:
      1. The raw secret string (as-is, after stripping accidental quotes).
      2. The base64url-decoded bytes (what Supabase actually signs with).
      3. Dev-only: skip signature verification entirely.
    """
    import base64

    # Strip surrounding quotes that some env loaders may preserve
    secret = settings.SUPABASE_JWT_SECRET.strip().strip('"').strip("'")
    decode_opts = {"verify_aud": False}

    # 1. Try raw secret string
    try:
        return jwt.decode(token, secret, algorithms=["HS256"], options=decode_opts)
    except JWTError:
        pass

    # 2. Try base64url-decoded bytes (Supabase signs with decoded bytes)
    try:
        # Fix padding: base64 needs length % 4 == 0
        padded = secret + "=" * (-len(secret) % 4)
        secret_bytes = base64.urlsafe_b64decode(padded)
        return jwt.decode(token, secret_bytes, algorithms=["HS256"], options=decode_opts)
    except Exception:
        pass

    # 3. Dev fallback: skip signature verification entirely
    if settings.ENVIRONMENT == "development":
        try:
            return jwt.decode(
                token,
                key="",
                algorithms=["HS256"],
                options={"verify_signature": False, "verify_aud": False},
            )
        except Exception:
            pass

    raise JWTError("Could not verify Supabase token")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    token = credentials.credentials
    try:
        payload = decode_app_token(token)
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
