// Google Apps Script — استقبال التقييمات، قراءة الفروع، وتشغيل الداشبورد
// الفروع والأكواد بتتدار من تاب "Branches" في الشيت (من غير تعديل كود).

const SHEET_NAME = "Feedback";
const BRANCHES_SHEET = "Branches";
const NOTIFY_EMAIL = "";   // اختياري: إيميل يوصله تنبيه عند تقييم منخفض
const LOW_SCORE = 2;       // أي تقييم عام <= الرقم ده يتبعت عنه تنبيه

const HEADERS = ["Timestamp", "Branch", "Visit", "Overall", "Food", "Service", "Cleanliness", "Speed", "Comment", "Name", "Contact", "Lang"];

// تاب Branches: Branch | PIN | Active (Y/N). الصف اللي اسمه ALL = كود الإدارة (يشوف كل الفروع).
function branches_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(BRANCHES_SHEET);
  if (!sh) {
    sh = ss.insertSheet(BRANCHES_SHEET);
    sh.getRange("B:B").setNumberFormat("@");
    sh.appendRow(["Branch", "PIN", "Active"]);
    sh.appendRow(["Branch 1", "BR1-48271", "Y"]);
    sh.appendRow(["Branch 2", "BR2-73914", "Y"]);
    sh.appendRow(["ALL", "HQ-905318", "Y"]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, 3).setFontWeight("bold");
  }
  if (sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues()
    .filter(r => r[0] && String(r[2]).trim().toUpperCase() !== "N")
    .map(r => ({ name: String(r[0]).trim(), pin: String(r[1]).trim() }));
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) {
      sh.appendRow(HEADERS);
      sh.setFrozenRows(1);
      sh.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    }
    const clean = v => String(v == null ? "" : v).slice(0, 1000).replace(/^([=+\-@])/, "'$1"); // منع formula injection
    sh.appendRow([
      new Date(), clean(d.branch), clean(d.visit),
      Number(d.overall) || "", Number(d.food) || "", Number(d.service) || "", Number(d.clean) || "", Number(d.speed) || "",
      clean(d.comment), clean(d.name), clean(d.contact), clean(d.lang)
    ]);
    if (NOTIFY_EMAIL && Number(d.overall) <= LOW_SCORE) {
      MailApp.sendEmail(NOTIFY_EMAIL, "تقييم منخفض — " + d.branch,
        "التقييم العام: " + d.overall + "/5\nالفرع: " + d.branch + "\nنوع الزيارة: " + d.visit +
        "\nالملاحظات: " + (d.comment || "-") + "\nالاسم: " + (d.name || "-") + "\nالتواصل: " + (d.contact || "-"));
    }
    return ContentService.createTextOutput("ok");
  } catch (err) {
    return ContentService.createTextOutput("error");
  }
}

function doGet(e) {
  const p = e.parameter || {};
  const list = branches_();

  // قائمة الفروع للفورم (أسماء بس، من غير أكواد)
  if (p.action === "branches") {
    return json_({ ok: true, branches: list.filter(b => b.name.toUpperCase() !== "ALL").map(b => b.name) });
  }

  // الداشبورد
  const pin = String(p.pin || "").trim();
  const m = pin ? list.filter(b => b.pin === pin)[0] : null;
  if (!m) return json_({ ok: false });
  const scope = m.name.toUpperCase() === "ALL" ? "*" : m.name;

  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sh || sh.getLastRow() < 2) return json_({ ok: true, scope: scope, rows: [] });
  const vals = sh.getRange(2, 1, sh.getLastRow() - 1, HEADERS.length).getValues();
  const since = Date.now() - 365 * 864e5;
  const rows = vals
    .filter(r => new Date(r[0]).getTime() >= since && (scope === "*" || r[1] === scope))
    .slice(-5000)
    .map(r => ({ t: r[0], branch: r[1], visit: r[2], overall: r[3], food: r[4], service: r[5], clean: r[6], speed: r[7], comment: r[8], name: r[9], contact: r[10] }));
  return json_({ ok: true, scope: scope, rows: rows });
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
