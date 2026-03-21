const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fetch = require("node-fetch");
const FormData = require("form-data");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer();
const API_KEY = "a568hm8@gmail.com_odyW3q4nA6wA1XgMy6m5lMVDxZp39jaDDknjPVLQpN4dDDmN69yMk8HF7pIi5Rze";

// 🔥 دالة موحدة
async function send(url, formData) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "x-api-key": API_KEY },
    body: formData
  });
  return await res.json();
}

// 🟢 Test
app.get("/", (req, res) => {
  res.send("🔥 PDF SERVER WORKING 25 TOOLS");
});

// ================= TOOLS =================

// PDF → JPG
app.post("/api/pdf-to-jpg", upload.single("file"), async (req, res) => {
  let f = new FormData();
  f.append("file", req.file.buffer, req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/convert/to/jpg", f));
});

// JPG → PDF
app.post("/api/jpg-to-pdf", upload.single("file"), async (req, res) => {
  let f = new FormData();
  f.append("file", req.file.buffer, req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/convert/from/image", f));
});

// PDF → Word
app.post("/api/pdf-to-word", upload.single("file"), async (req, res) => {
  let f = new FormData();
  f.append("file", req.file.buffer, req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/convert/to/doc", f));
});

// Word → PDF
app.post("/api/word-to-pdf", upload.single("file"), async (req, res) => {
  let f = new FormData();
  f.append("file", req.file.buffer, req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/convert/to/pdf", f));
});

// PDF → Excel
app.post("/api/pdf-to-excel", upload.single("file"), async (req, res) => {
  let f = new FormData();
  f.append("file", req.file.buffer, req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/convert/to/xls", f));
});

// Excel → PDF
app.post("/api/excel-to-pdf", upload.single("file"), async (req, res) => {
  let f = new FormData();
  f.append("file", req.file.buffer, req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/convert/to/pdf", f));
});

// PDF → PPT
app.post("/api/pdf-to-ppt", upload.single("file"), async (req, res) => {
  let f = new FormData();
  f.append("file", req.file.buffer, req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/convert/to/ppt", f));
});

// PPT → PDF
app.post("/api/ppt-to-pdf", upload.single("file"), async (req, res) => {
  let f = new FormData();
  f.append("file", req.file.buffer, req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/convert/to/pdf", f));
});

// Merge
app.post("/api/merge-pdf", upload.array("files"), async (req, res) => {
  let f = new FormData();
  req.files.forEach(file => {
    f.append("file", file.buffer, file.originalname);
  });
  res.json(await send("https://api.pdf.co/v1/pdf/merge", f));
});

// Split
app.post("/api/split-pdf", upload.single("file"), async (req, res) => {
  let f = new FormData();
  f.append("file", req.file.buffer, req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/split", f));
});

// Compress
app.post("/api/compress-pdf", upload.single("file"), async (req, res) => {
  let f = new FormData();
  f.append("file", req.file.buffer, req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/optimize", f));
});

// Protect
app.post("/api/protect-pdf", upload.single("file"), async (req, res) => {
  let f = new FormData();
  f.append("file", req.file.buffer, req.file.originalname);
  f.append("password", "123456");
  res.json(await send("https://api.pdf.co/v1/pdf/security/add", f));
});

// Unlock
app.post("/api/unlock-pdf", upload.single("file"), async (req, res) => {
  let f = new FormData();
  f.append("file", req.file.buffer, req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/security/remove", f));
});

// Rotate
app.post("/api/rotate-pdf", upload.single("file"), async (req, res) => {
  let f = new FormData();
  f.append("file", req.file.buffer, req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/rotate", f));
});

// Watermark
app.post("/api/watermark", upload.single("file"), async (req, res) => {
  let f = new FormData();
  f.append("file", req.file.buffer, req.file.originalname);
  f.append("text", "PDF PRO MAX");
  res.json(await send("https://api.pdf.co/v1/pdf/edit/add", f));
});

// Page Numbers
app.post("/api/page-numbers", upload.single("file"), async (req, res) => {
  let f = new FormData();
  f.append("file", req.file.buffer, req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/edit/add", f));
});

// OCR
app.post("/api/ocr-pdf", upload.single("file"), async (req, res) => {
  let f = new FormData();
  f.append("file", req.file.buffer, req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/convert/to/searchable", f));
});

// Extract Images
app.post("/api/extract-images", upload.single("file"), async (req, res) => {
  let f = new FormData();
  f.append("file", req.file.buffer, req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/extract/images", f));
});

// Repair
app.post("/api/repair-pdf", upload.single("file"), async (req, res) => {
  let f = new FormData();
  f.append("file", req.file.buffer, req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/repair", f));
});

// PDF/A
app.post("/api/pdf-to-pdfa", upload.single("file"), async (req, res) => {
  let f = new FormData();
  f.append("file", req.file.buffer, req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/convert/to/pdfa", f));
});

// Delete Pages
app.post("/api/delete-pages", upload.single("file"), async (req, res) => {
  let f = new FormData();
  f.append("file", req.file.buffer, req.file.originalname);
  res.json(await send("https://api.pdf.co/v1/pdf/remove-pages", f));
});

// ================= RUN =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🔥 SERVER RUNNING 25 TOOLS");
});
