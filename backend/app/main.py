from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, services

app = FastAPI(title="Talab API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(services.router, prefix="/api/v1/services", tags=["services"])


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "talab-api"}
