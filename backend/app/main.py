from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import admin, auth, customer, services

settings = get_settings()
app = FastAPI(title="Talab API", version="0.5.0", docs_url="/docs", redoc_url=None)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Admin-Key"],
)
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(services.router, prefix="/api/v1/services", tags=["services"])
app.include_router(customer.router, prefix="/api/v1/customer", tags=["customer"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])


@app.get("/health", tags=["system"])
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "talab-api", "version": "0.5.0"}
