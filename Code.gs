// ============================================================
// Sri Meenakshi Mahal — Venue Booking Manager
// Google Apps Script Web App Backend
// ------------------------------------------------------------
// SETUP INSTRUCTIONS:
// 1. Go to https://script.google.com → New project
// 2. Paste this entire file contents
// 3. Click "Deploy" → "New deployment" → Type: Web App
//    - Execute as: Me
//    - Who has access: Anyone (or Anyone with Google account for tighter control)
// 4. Copy the Web App URL — paste it into index.html as SCRIPT_URL
// 5. On first load, a "Bookings" sheet will be auto-created
// ============================================================

const SHEET_NAME = "Bookings";
const COLS = [
  "id","clientName","phone","email","eventType","hall",
  "eventDate","guestCount","ac","guestRooms",
  "totalAmount","advancePaid","status","notes","createdAt","updatedAt"
];

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(COLS);
    sheet.setFrozenRows(1);
    // Header formatting
    const hdr = sheet.getRange(1, 1, 1, COLS.length);
    hdr.setBackground("#BA7517").setFontColor("#ffffff").setFontWeight("bold");
    sheet.setColumnWidth(1, 120);
    sheet.setColumnWidth(2, 180);
    sheet.setColumnWidth(3, 120);
    sheet.setColumnWidth(4, 180);
    sheet.setColumnWidth(5, 130);
    sheet.setColumnWidth(6, 160);
    sheet.setColumnWidth(7, 100);
  }
  return sheet;
}

function rowToObj(row) {
  const obj = {};
  COLS.forEach((col, i) => { obj[col] = row[i] !== undefined ? row[i] : ""; });
  // Coerce types
  obj.ac = obj.ac === true || obj.ac === "true" || obj.ac === "Yes";
  obj.guestRooms = Number(obj.guestRooms) || 0;
  obj.totalAmount = Number(obj.totalAmount) || 0;
  obj.advancePaid = Number(obj.advancePaid) || 0;
  return obj;
}

function objToRow(obj) {
  return COLS.map(col => {
    if (col === "ac") return obj[col] ? "true" : "false";
    return obj[col] !== undefined ? obj[col] : "";
  });
}

// ---------- CORS helper ----------
function cors(output) {
  return output
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST",
      "Access-Control-Allow-Headers": "Content-Type"
    });
}

function jsonResp(data) {
  return cors(ContentService.createTextOutput(JSON.stringify(data)));
}

// ---------- GET → list all ----------
function doGet(e) {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return jsonResp([]);
    const rows = data.slice(1).map(rowToObj).filter(r => r.id);
    return jsonResp(rows);
  } catch(err) {
    return jsonResp({ error: err.message });
  }
}

// ---------- POST → create / update / delete ----------
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const sheet = getSheet();

    if (action === "create") {
      const obj = payload.data;
      obj.id = obj.id || Utilities.getUuid();
      obj.createdAt = obj.createdAt || new Date().toISOString();
      obj.updatedAt = new Date().toISOString();
      sheet.appendRow(objToRow(obj));
      return jsonResp({ success: true, id: obj.id });
    }

    if (action === "update") {
      const obj = payload.data;
      obj.updatedAt = new Date().toISOString();
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === obj.id) {
          const row = objToRow(obj);
          sheet.getRange(i + 1, 1, 1, COLS.length).setValues([row]);
          return jsonResp({ success: true });
        }
      }
      return jsonResp({ error: "Not found" });
    }

    if (action === "delete") {
      const { id } = payload;
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === id) {
          sheet.deleteRow(i + 1);
          return jsonResp({ success: true });
        }
      }
      return jsonResp({ error: "Not found" });
    }

    // Batch sync (offline queue flush)
    if (action === "batch") {
      const ops = payload.ops || [];
      const results = [];
      for (const op of ops) {
        if (op.action === "create") {
          const obj = op.data;
          obj.updatedAt = new Date().toISOString();
          sheet.appendRow(objToRow(obj));
          results.push({ id: obj.id, ok: true });
        } else if (op.action === "update") {
          const obj = op.data;
          obj.updatedAt = new Date().toISOString();
          const data2 = sheet.getDataRange().getValues();
          for (let i = 1; i < data2.length; i++) {
            if (data2[i][0] === obj.id) {
              sheet.getRange(i + 1, 1, 1, COLS.length).setValues([objToRow(obj)]);
              break;
            }
          }
          results.push({ id: obj.id, ok: true });
        } else if (op.action === "delete") {
          const data2 = sheet.getDataRange().getValues();
          for (let i = 1; i < data2.length; i++) {
            if (data2[i][0] === op.id) { sheet.deleteRow(i + 1); break; }
          }
          results.push({ id: op.id, ok: true });
        }
      }
      return jsonResp({ success: true, results });
    }

    return jsonResp({ error: "Unknown action" });
  } catch(err) {
    return jsonResp({ error: err.message });
  }
}
