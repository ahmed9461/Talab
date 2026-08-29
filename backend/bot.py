import asyncio
import httpx
from aiogram import Bot,Dispatcher,F
from aiogram.filters import CommandStart
from aiogram.types import CallbackQuery,InlineKeyboardButton,InlineKeyboardMarkup,Message
from app.config import get_settings
s=get_settings(); dp=Dispatcher(); API="http://127.0.0.1:8000/api/v1/admin"; headers={"X-Admin-Key":s.admin_api_key}
def allowed(user_id:int): return user_id==s.telegram_owner_id
async def api(method,path,**kwargs):
    async with httpx.AsyncClient(timeout=20) as client: return await client.request(method,API+path,headers=headers,**kwargs)
def buttons(request_id): return InlineKeyboardMarkup(inline_keyboard=[[InlineKeyboardButton(text="✅ تفعيل",callback_data=f"st:ACTIVE:{request_id}"),InlineKeyboardButton(text="❌ رفض",callback_data=f"st:REJECTED:{request_id}")],[InlineKeyboardButton(text="⏸ تعليق",callback_data=f"st:SUSPENDED:{request_id}")]])
@dp.message(CommandStart())
async def start(m:Message):
    if not allowed(m.from_user.id): return
    await m.answer("لوحة Talab\nأرسل /requests لعرض الطلبات.")
@dp.message(F.text=="/requests")
async def requests(m:Message):
    if not allowed(m.from_user.id): return
    r=await api("GET","/requests"); items=r.json()
    if not items: return await m.answer("لا توجد طلبات.")
    for x in items[:20]: await m.answer(f"🆕 {x['full_name']}\n@{x['username']}\n📱 {x['phone']}\n🛎 {x['service_name'] or x['custom_service_text']}\nالحالة: {x['status']}",reply_markup=buttons(x['id']))
@dp.callback_query(F.data.startswith("st:"))
async def status(c:CallbackQuery):
    if not allowed(c.from_user.id): return
    _,value,rid=c.data.split(":",2); r=await api("PATCH",f"/requests/{rid}/status",json={"status":value}); await c.answer("تم" if r.is_success else "فشل",show_alert=not r.is_success)
    if r.is_success: await c.message.edit_reply_markup(reply_markup=buttons(rid))
async def main():
    if not s.telegram_bot_token: raise RuntimeError("TELEGRAM_BOT_TOKEN is missing")
    await dp.start_polling(Bot(s.telegram_bot_token))
if __name__=="__main__": asyncio.run(main())
