from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .jwt_handler import decode_jwt

class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(JWTBearer, self).__call__(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(status_code=403, detail="Invalid authentication scheme")
            
            payload = decode_jwt(credentials.credentials)
            if not payload:
                raise HTTPException(status_code=403, detail="Invalid token or expired token")
            return payload
        else:
            raise HTTPException(status_code=403, detail="Invalid authorization code")

def get_current_user(token_payload: dict = Depends(JWTBearer())):
    return token_payload

def get_alumni_user(token_payload: dict = Depends(JWTBearer())):
    if token_payload.get("role") != "Alumni":
        raise HTTPException(status_code=403, detail="Only Alumni can perform this action")
    return token_payload

def get_student_user(token_payload: dict = Depends(JWTBearer())):
    if token_payload.get("role") != "Student":
        raise HTTPException(status_code=403, detail="Only Students can perform this action")
    return token_payload
