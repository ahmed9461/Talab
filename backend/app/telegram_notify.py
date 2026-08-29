import httpx

from app.config import get_settings


def request_keyboard(request_id: str, customer_id: str) -> dict:
    return {
        "inline_keyboard": [
            [
                {"text": "✅ تفعيل", "callback_data": f"st:ACTIVE:{request_id}"},
                {"text": "❌ رفض", "callback_data": f"st:REJECTED:{request_id}"},
            ],
            [
                {"text": "⏸ تعليق", "callback_data": f"st:SUSPENDED:{request_id}"},
                {"text": "🔐 بيانات الدخول", "callback_data": f"cred:{request_id}"},
            ],
            [{"text": "🔔 إرسال إخطار", "callback_data": f"notify:{customer_id}"}],
        ]
    }


async def notify_new_registration(
    *,
    request_id: str,
    customer_id: str,
    full_name: str,
    username: str,
    phone: str,
    service_name: str,
) -> None:
    settings = get_settings()
    if not settings.telegram_bot_token or not settings.telegram_owner_id:
        return

    text = (
        "🆕 تسجيل عميل جديد\n\n"
        f"👤 الاسم: {full_name}\n"
        f"🔖 المستخدم: @{username}\n"
        f"📱 الجوال: {phone}\n"
        f"🛎 الخدمة: {service_name}\n"
        "⏳ الحالة: قيد المراجعة"
    )
    payload = {
        "chat_id": settings.telegram_owner_id,
        "text": text,
        "reply_markup": request_keyboard(request_id, customer_id),
    }
    url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"
    try:
        async with httpx.AsyncClient(timeout=12) as client:
            await client.post(url, json=payload)
    except httpx.HTTPError:
        # Registration must never fail merely because Telegram is temporarily unavailable.
        return
