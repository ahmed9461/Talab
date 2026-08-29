from uuid import UUID
from pydantic import BaseModel, Field, model_validator


class ServiceOut(BaseModel):
    id: UUID
    name: str
    model_config = {"from_attributes": True}


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
