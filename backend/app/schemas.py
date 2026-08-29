from datetime import datetime
from uuid import UUID
from pydantic import BaseModel,Field,model_validator
class ServiceOut(BaseModel):
    id:UUID; name:str
    model_config={"from_attributes":True}
class RegisterRequest(BaseModel):
    full_name:str=Field(min_length=2,max_length=160); username:str=Field(min_length=3,max_length=80,pattern=r"^[A-Za-z0-9_.-]+$"); password:str=Field(min_length=6,max_length=200); phone:str=Field(min_length=7,max_length=40); service_id:UUID|None=None; custom_service_text:str|None=Field(default=None,max_length=1500); accepted_terms:bool
    @model_validator(mode="after")
    def valid(self):
        if not self.service_id and not (self.custom_service_text or "").strip(): raise ValueError("يجب اختيار خدمة أو وصف الخدمة المطلوبة")
        if not self.accepted_terms: raise ValueError("يجب الموافقة على شروط الخدمة")
        return self
class RegisterResponse(BaseModel): customer_id:UUID; request_id:UUID; status:str
class LoginRequest(BaseModel): username:str; password:str
class LoginResponse(BaseModel): access_token:str; token_type:str="bearer"
class MeOut(BaseModel): id:UUID; full_name:str; username:str; phone:str; status:str
class RequestOut(BaseModel): id:UUID; service_name:str|None; custom_service_text:str|None; status:str; created_at:datetime
class NotificationOut(BaseModel): id:UUID; title:str; body:str; is_read:bool; created_at:datetime
class AdminRequestOut(BaseModel): id:UUID; customer_id:UUID; full_name:str; username:str; phone:str; service_name:str|None; custom_service_text:str|None; status:str; created_at:datetime
class StatusUpdate(BaseModel): status:str
class NotificationCreate(BaseModel): title:str=Field(min_length=1,max_length=180); body:str=Field(min_length=1,max_length=5000); kind:str|None=None; file_url:str|None=None; file_name:str|None=None
