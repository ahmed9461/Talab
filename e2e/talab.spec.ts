import { expect, test, type Page } from "@playwright/test";

const services = [
  { id: "11111111-1111-1111-1111-111111111111", name: "تفعيل خدمة" },
  { id: "22222222-2222-2222-2222-222222222222", name: "تجديد اشتراك" },
];

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBeFalsy();
}

test("registration flow is clear, responsive and handles Other", async ({ page }, testInfo) => {
  await page.route("**/api/v1/services", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(services) }));
  await page.route("**/api/v1/auth/register", route => route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ customer_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", request_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", status: "PENDING" }) }));

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "إنشاء طلب جديد" })).toBeVisible();
  const story = page.getByText("طلبك يبدأ هنا،");
  if (testInfo.project.name === "desktop") await expect(story).toBeVisible(); else await expect(story).toBeHidden();
  await expectNoHorizontalOverflow(page);

  await page.getByLabel("الاسم الكامل", { exact: true }).fill("أحمد محمد");
  await page.getByLabel("رقم الجوال", { exact: true }).fill("770000000");
  await page.getByLabel("اسم المستخدم", { exact: true }).fill("ahmed.demo");
  await page.getByLabel("كلمة المرور", { exact: true }).fill("safe-demo-password");
  await page.getByLabel("نوع الخدمة", { exact: true }).selectOption("other");
  await page.getByLabel("صف الخدمة المطلوبة", { exact: true }).fill("أحتاج خدمة مخصصة لاختبار تجربة التسجيل.");
  await page.getByLabel("قرأت وأوافق على", { exact: true }).check();
  await page.getByRole("button", { name: "إرسال الطلب" }).click();

  await expect(page.getByRole("heading", { name: "وصلنا طلبك" })).toBeVisible();
  await expect(page.getByText("قيد المراجعة", { exact: false })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: testInfo.outputPath(`register-${testInfo.project.name}.png`), fullPage: true });
});

test("customer dashboard presents status and notifications professionally", async ({ page }, testInfo) => {
  await page.route("**/api/v1/customer/me", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", full_name: "أحمد محمد", username: "ahmed.demo", phone: "770000000", status: "ACTIVE" }) }));
  await page.route("**/api/v1/customer/requests", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([{ id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", service_name: "تفعيل خدمة", custom_service_text: null, status: "ACTIVE", created_at: "2026-08-29T20:00:00Z" }]) }));
  await page.route("**/api/v1/customer/notifications", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([{ id: "cccccccc-cccc-cccc-cccc-cccccccccccc", title: "تم تفعيل طلبك", body: "الخدمة أصبحت جاهزة ويمكنك متابعة التفاصيل من هنا.", is_read: false, created_at: "2026-08-29T20:10:00Z", attachments: [] }]) }));

  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "أهلًا، أحمد محمد" })).toBeVisible();
  await expect(page.getByText("تم التفعيل").first()).toBeVisible();
  await expect(page.getByText("تم تفعيل طلبك")).toBeVisible();
  await expect(page.getByText("1 جديد")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: testInfo.outputPath(`dashboard-${testInfo.project.name}.png`), fullPage: true });
});
