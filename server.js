const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch");
const cors = require("cors");
const FormData = require("form-data");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer();

// 🔥 API KEY (حطيتلك بتاعك)
const API_KEY = "a568hm8@gmail.com_odyW3q4nA6wA1XgMy6m5lMVDxZp39jaDDknjPVLQpN4dDDmN69yMk8HF7pIi5Rze";

// ✅ اختبار
app.get("/", (req, res) => {
  res.send("🔥 PDF PRO MAX WORKING");
});

// ================= UPLOAD =================
async function uploadFile(file) {
  const form = new FormData();
  form.append("file", file.buffer, file.originalname);

  const r = await fetch("https://api.pdf.co/v1/file/upload", {
    method: "POST",
    headers: { "x-api-key": API_KEY },
    body: form
  });

  const data = await r.json();
  if (!data.url) throw new Error(JSON.stringify(data));
  return data.url;
}

// ================= PROCESS =================
async function processFile(url, endpoint, extra = {}) {
  const r = await fetch(endpoint, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url, ...extra })
  });

  const data = await r.json();
  if (!data.url && !data.urls) throw new Error(JSON.stringify(data));
  return data;
}

// ================= TOOLS =================

// 1 PDF → JPG
app.post("/api/pdf-to-jpg", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/convert/to/jpg"));
  } catch (e) { res.json({ error: e.message }); }
});

// 2 JPG → PDF
app.post("/api/jpg-to-pdf", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/convert/from/image"));
  } catch (e) { res.json({ error: e.message }); }
});

// 3 PDF → WORD ✅
app.post("/api/pdf-to-word", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/convert/to/docx"));
  } catch (e) { res.json({ error: e.message }); }
});

// 4 WORD → PDF
app.post("/api/word-to-pdf", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/convert/from/doc"));
  } catch (e) { res.json({ error: e.message }); }
});

// 5 PDF → EXCEL ✅
app.post("/api/pdf-to-excel", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/convert/to/xlsx"));
  } catch (e) { res.json({ error: e.message }); }
});

// 6 EXCEL → PDF
app.post("/api/excel-to-pdf", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/convert/from/xls"));
  } catch (e) { res.json({ error: e.message }); }
});

// 7 PDF → PPT ✅
app.post("/api/pdf-to-ppt", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/convert/to/pptx"));
  } catch (e) { res.json({ error: e.message }); }
});

// 8 PPT → PDF
app.post("/api/ppt-to-pdf", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/convert/from/ppt"));
  } catch (e) { res.json({ error: e.message }); }
});

// 9 Merge
app.post("/api/merge-pdf", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/merge2"));
  } catch (e) { res.json({ error: e.message }); }
});

// 10 Split
app.post("/api/split-pdf", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/split"));
  } catch (e) { res.json({ error: e.message }); }
});

// 11 Compress
app.post("/api/compress-pdf", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/optimize"));
  } catch (e) { res.json({ error: e.message }); }
});

// 12 Protect
app.post("/api/protect-pdf", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/security/add", { password: "123456" }));
  } catch (e) { res.json({ error: e.message }); }
});

// 13 Unlock
app.post("/api/unlock-pdf", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/security/remove"));
  } catch (e) { res.json({ error: e.message }); }
});

// 14 Rotate
app.post("/api/rotate-pdf", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/rotate"));
  } catch (e) { res.json({ error: e.message }); }
});

// 15 Watermark
app.post("/api/watermark", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/edit/add", { text: "PDF PRO" }));
  } catch (e) { res.json({ error: e.message }); }
});

// ================= RUN =================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🔥 SERVER RUNNING ON PORT " + PORT);
});
