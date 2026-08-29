from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile

from app.config import get_settings

ALLOWED_TYPES: dict[str, tuple[str, str]] = {
    "image/jpeg": (".jpg", "image"),
    "image/png": (".png", "image"),
    "image/webp": (".webp", "image"),
    "image/gif": (".gif", "image"),
    "video/mp4": (".mp4", "video"),
    "video/webm": (".webm", "video"),
    "video/quicktime": (".mov", "video"),
    "application/pdf": (".pdf", "file"),
    "application/zip": (".zip", "file"),
    "text/plain": (".txt", "file"),
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": (".docx", "file"),
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": (".xlsx", "file"),
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": (".pptx", "file"),
}


async def save_upload(upload: UploadFile) -> tuple[str, str, str]:
    settings = get_settings()
    content_type = (upload.content_type or "").lower()
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(415, "نوع الملف غير مدعوم")

    content = await upload.read(settings.max_upload_bytes + 1)
    if len(content) > settings.max_upload_bytes:
        raise HTTPException(413, "حجم الملف أكبر من الحد المسموح")

    extension, kind = ALLOWED_TYPES[content_type]
    filename = f"{uuid4().hex}{extension}"
    root = Path(settings.media_root)
    root.mkdir(parents=True, exist_ok=True)
    (root / filename).write_bytes(content)
    return filename, kind, upload.filename or filename
