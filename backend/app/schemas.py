from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, model_validator


class ServiceOut(BaseModel):
    id: UUID
    name: str
    model_config = {"from_attributes": True}


class AdminServiceOut(ServiceOut):
    is_active: bool
    sort_order: int
    model_config = {"from_attributes": True}


class ServiceCreate(BaseModel):
    name: str = Field(min_length=2, max_length=140)
    sort_order: int = 0


class ServiceUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=140)
    is_active: bool | None = None
    sort_order: int | None = None


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=160)
    username: str = Field(min_length=3, max_length=80, pattern=r"^[A-Za-z0-9_.-]+$")
    password: str = Field(min_length=6, max_length=200)
    phone: str = Field(min_length=7, max_length=40)
    service_id: UUID | None = None
    custom_service_text: str | None = Field(default=None, max_length=1500)
    accepted_terms: bool

    @model_validator(mode="after")
    def validate_service(self):
        if not self.service_id and not (self.custom_service_text or "").strip():
            raise ValueError("يجب اختيار خدمة أو وصف الخدمة المطلوبة")
        if not self.accepted_terms:
            raise ValueError("يجب الموافقة على شروط الخدمة")
        return self


class RegisterResponse(BaseModel):
    customer_id: UUID
    request_id: UUID
    status: str


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    ok: bool = True


class MeOut(BaseModel):
    id: UUID
    full_name: str
    username: str
    phone: str
    status: str


class RequestOut(BaseModel):
    id: UUID
    service_name: str | None
    custom_service_text: str | None
    status: str
    created_at: datetime


class AttachmentOut(BaseModel):
    id: UUID
    kind: str
    file_url: str
    file_name: str | None


class NotificationOut(BaseModel):
    id: UUID
    title: str
    body: str
    is_read: bool
    created_at: datetime
    attachments: list[AttachmentOut] = Field(default_factory=list)


class AdminRequestOut(BaseModel):
    id: UUID
    customer_id: UUID
    full_name: str
    username: str
    phone: str
    service_name: str | None
    custom_service_text: str | None
    status: str
    created_at: datetime


class StatusUpdate(BaseModel):
    status: str


class NotificationCreate(BaseModel):
    title: str = Field(min_length=1, max_length=180)
    body: str = Field(min_length=1, max_length=5000)
    kind: str | None = Field(default=None, max_length=30)
    file_url: str | None = None
    file_name: str | None = Field(default=None, max_length=255)


class CredentialOut(BaseModel):
    username: str
    password: str
