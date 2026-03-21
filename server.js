const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch");
const cors = require("cors");
const FormData = require("form-data");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer();

// 🔐 API KEY
const API_KEY = "a568hm8@gmail.com_odyW3q4nA6wA1XgMy6m5lMVDxZp39jaDDknjPVLQpN4dDDmN69yMk8HF7pIi5Rze";

// ✅ Test
app.get("/", (req, res) => {
  res.send("🔥 PDF PRO MAX API WORKING");
});

// ================= UPLOAD =================
async function uploadFile(file) {
  const form = new FormData();
  form.append("file", file.buffer, file.originalname);

  const res = await fetch("https://api.pdf.co/v1/file/upload", {
    method: "POST",
    headers: { "x-api-key": API_KEY },
    body: form
  });

  const data = await res.json();
  if (!data.url) throw new Error("Upload failed");
  return data.url;
}

// ================= PROCESS =================
async function processFile(url, endpoint, extra = {}) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url, ...extra })
  });

  return await res.json();
}

// ================= TOOLS =================

// 1
app.post("/api/pdf-to-jpg", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/convert/to/jpg"));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 2
app.post("/api/jpg-to-pdf", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/convert/from/image"));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 3
app.post("/api/pdf-to-word", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/convert/to/doc"));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 4
app.post("/api/word-to-pdf", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/convert/from/doc"));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 5
app.post("/api/pdf-to-excel", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/convert/to/xls"));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 6
app.post("/api/excel-to-pdf", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/convert/from/xls"));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 7
app.post("/api/pdf-to-ppt", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/convert/to/ppt"));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 8
app.post("/api/ppt-to-pdf", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/convert/from/ppt"));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 9 Merge
app.post("/api/merge-pdf", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/merge2"));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 10 Split
app.post("/api/split-pdf", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/split"));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 11 Compress
app.post("/api/compress-pdf", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/optimize"));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 12 Repair
app.post("/api/repair-pdf", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/repair"));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 13 Protect
app.post("/api/protect-pdf", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/security/add", { password: "123456" }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 14 Unlock
app.post("/api/unlock-pdf", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/security/remove"));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 15 Rotate
app.post("/api/rotate-pdf", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/rotate"));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 16 Watermark
app.post("/api/watermark", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/edit/add", { text: "PDF PRO MAX" }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 17 Page Numbers
app.post("/api/page-numbers", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/edit/add"));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 18 PDF/A
app.post("/api/pdf-to-pdfa", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/convert/to/pdfa"));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 19 OCR
app.post("/api/ocr-pdf", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/convert/to/searchable"));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 20 Extract Images
app.post("/api/extract-images", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/extract/images"));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 21 Extract Pages
app.post("/api/extract-pages", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/split"));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 22 HTML → PDF
app.post("/api/html-to-pdf", async (req, res) => {
  try {
    res.json(await processFile(req.body.url, "https://api.pdf.co/v1/pdf/convert/from/url"));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 23 Delete Pages
app.post("/api/delete-pages", upload.single("file"), async (req, res) => {
  try {
    const url = await uploadFile(req.file);
    res.json(await processFile(url, "https://api.pdf.co/v1/pdf/remove-pages"));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ================= RUN =================

// 🔥 مهم: بدون مشاكل PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🔥 SERVER RUNNING ON PORT " + PORT);
});
