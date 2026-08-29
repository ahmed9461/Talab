import asyncio

import httpx
from aiogram import Bot, Dispatcher, F
from aiogram.filters import Command, CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup, Message

from app.config import get_settings

settings = get_settings()
dp = Dispatcher()
API = "http://127.0.0.1:8000/api/v1/admin"
HEADERS = {"X-Admin-Key": settings.admin_api_key}


class NotifyFlow(StatesGroup):
    waiting_content = State()


def allowed(user_id: int) -> bool:
    return user_id == settings.telegram_owner_id


async def api(method: str, path: str, **kwargs):
    async with httpx.AsyncClient(timeout=20) as client:
        return await client.request(method, API + path, headers=HEADERS, **kwargs)


def request_buttons(request_id: str, customer_id: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="✅ تفعيل", callback_data=f"st:ACTIVE:{request_id}"), InlineKeyboardButton(text="❌ رفض", callback_data=f"st:REJECTED:{request_id}")],
        [InlineKeyboardButton(text="⏸ تعليق", callback_data=f"st:SUSPENDED:{request_id}"), InlineKeyboardButton(text="🔐 بيانات الدخول", callback_data=f"cred:{request_id}")],
        [InlineKeyboardButton(text="🔔 إرسال إخطار", callback_data=f"notify:{customer_id}")],
    ])


@dp.message(CommandStart())
async def start(message: Message):
    if not allowed(message.from_user.id):
        return
    await message.answer("لوحة إدارة Talab\n\n/requests — الطلبات\n/services — الخدمات\n/addservice اسم الخدمة — إضافة خدمة")


@dp.message(Command("requests"))
async def requests(message: Message):
    if not allowed(message.from_user.id):
        return
    response = await api("GET", "/requests")
    if not response.is_success:
        return await message.answer("تعذر جلب الطلبات.")
    items = response.json()
    if not items:
        return await message.answer("لا توجد طلبات حاليًا.")
    for item in items[:30]:
        service = item["service_name"] or item["custom_service_text"] or "أخرى"
        await message.answer(
            f"🆕 طلب عميل\n👤 {item['full_name']}\n🔖 @{item['username']}\n📱 {item['phone']}\n🛎 {service}\nالحالة: {item['status']}",
            reply_markup=request_buttons(item["id"], item["customer_id"]),
        )


@dp.callback_query(F.data.startswith("st:"))
async def change_status(callback: CallbackQuery):
    if not allowed(callback.from_user.id):
        return
    _, value, request_id = callback.data.split(":", 2)
    response = await api("PATCH", f"/requests/{request_id}/status", json={"status": value})
    await callback.answer("تم تحديث الحالة" if response.is_success else "تعذر تحديث الحالة", show_alert=not response.is_success)


@dp.callback_query(F.data.startswith("cred:"))
async def credential(callback: CallbackQuery):
    if not allowed(callback.from_user.id):
        return
    request_id = callback.data.split(":", 1)[1]
    response = await api("GET", f"/requests/{request_id}/credential")
    if not response.is_success:
        return await callback.answer("تعذر جلب بيانات الدخول", show_alert=True)
    data = response.json()
    await callback.answer(f"المستخدم: {data['username']}\nكلمة المرور: {data['password']}", show_alert=True)


@dp.callback_query(F.data.startswith("notify:"))
async def begin_notify(callback: CallbackQuery, state: FSMContext):
    if not allowed(callback.from_user.id):
        return
    customer_id = callback.data.split(":", 1)[1]
    await state.set_state(NotifyFlow.waiting_content)
    await state.update_data(customer_id=customer_id)
    await callback.answer()
    await callback.message.answer("أرسل الإخطار بهذا الشكل:\nالعنوان | نص الإشعار\n\nللإلغاء: /cancel")


@dp.message(Command("cancel"))
async def cancel(message: Message, state: FSMContext):
    if not allowed(message.from_user.id):
        return
    await state.clear()
    await message.answer("تم الإلغاء.")


@dp.message(NotifyFlow.waiting_content)
async def send_notification(message: Message, state: FSMContext):
    if not allowed(message.from_user.id):
        return
    if "|" not in (message.text or ""):
        return await message.answer("استخدم الصيغة: العنوان | نص الإشعار")
    title, body = [part.strip() for part in message.text.split("|", 1)]
    data = await state.get_data()
    response = await api("POST", f"/customers/{data['customer_id']}/notifications", json={"title": title, "body": body})
    if response.is_success:
        await state.clear()
        await message.answer("✅ تم إرسال الإشعار.")
    else:
        await message.answer("تعذر إرسال الإشعار.")


@dp.message(Command("services"))
async def services(message: Message):
    if not allowed(message.from_user.id):
        return
    response = await api("GET", "/services")
    if not response.is_success:
        return await message.answer("تعذر جلب الخدمات.")
    lines = [f"{'🟢' if item['is_active'] else '⚪️'} {item['name']}" for item in response.json()]
    await message.answer("الخدمات:\n" + "\n".join(lines))


@dp.message(Command("addservice"))
async def add_service(message: Message):
    if not allowed(message.from_user.id):
        return
    name = (message.text or "").partition(" ")[2].strip()
    if not name:
        return await message.answer("استخدم: /addservice اسم الخدمة")
    response = await api("POST", "/services", json={"name": name, "sort_order": 100})
    await message.answer("✅ تمت إضافة الخدمة." if response.is_success else "تعذر إضافة الخدمة أو أنها موجودة.")


async def main():
    if not settings.telegram_bot_token:
        raise RuntimeError("TELEGRAM_BOT_TOKEN is missing")
    if not settings.telegram_owner_id:
        raise RuntimeError("TELEGRAM_OWNER_ID is missing")
    await dp.start_polling(Bot(settings.telegram_bot_token))


if __name__ == "__main__":
    asyncio.run(main())
