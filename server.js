const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fetch = require("node-fetch");
const fs = require("fs");
const FormData = require("form-data");

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 رفع الملفات
const upload = multer({ dest: "uploads/" });
app.use("/uploads", express.static("uploads"));

const API_KEY = process.env.API_KEY;

// الصفحة الرئيسية
app.get("/", (req, res) => {
  res.send("🔥 PDF PRO MAX SERVER WORKING");
});


// =======================
// 📤 رفع الملفات
// =======================
app.post("/api/upload", upload.array("files"), (req, res) => {

  if (!req.files || req.files.length === 0) {
    return res.json({ error: "No files uploaded" });
  }

  const urls = req.files.map(file => {
    return `https://pdf-server-production-82f5.up.railway.app/uploads/${file.filename}`;
  });

  res.json({ urls });

});


// =======================
// 🔁 دالة عامة للتحويل
// =======================
async function callPDFCo(endpoint, body) {

  const response = await fetch(`https://api.pdf.co/v1/${endpoint}`, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  return await response.json();
}


// =======================
// 🧰 الأدوات (نماذج)
// =======================

// PDF → JPG
app.post("/api/pdf-to-jpg", async (req, res) => {
  const result = await callPDFCo("pdf/convert/to/jpg", {
    url: req.body.url
  });
  res.json(result);
});

// JPG → PDF
app.post("/api/jpg-to-pdf", async (req, res) => {
  const result = await callPDFCo("pdf/convert/from/image", {
    url: req.body.url
  });
  res.json(result);
});

// PDF → Word
app.post("/api/pdf-to-word", async (req, res) => {
  const result = await callPDFCo("pdf/convert/to/doc", {
    url: req.body.url
  });
  res.json(result);
});

// Word → PDF
app.post("/api/word-to-pdf", async (req, res) => {
  const result = await callPDFCo("pdf/convert/from/doc", {
    url: req.body.url
  });
  res.json(result);
});

// دمج PDF
app.post("/api/merge-pdf", async (req, res) => {
  const result = await callPDFCo("pdf/merge", {
    urls: req.body.urls
  });
  res.json(result);
});

// تقسيم PDF
app.post("/api/split-pdf", async (req, res) => {
  const result = await callPDFCo("pdf/split", {
    url: req.body.url
  });
  res.json(result);
});

// ضغط PDF
app.post("/api/compress-pdf", async (req, res) => {
  const result = await callPDFCo("pdf/optimize", {
    url: req.body.url
  });
  res.json(result);
});

// حماية PDF
app.post("/api/protect-pdf", async (req, res) => {
  const result = await callPDFCo("pdf/security/add", {
    url: req.body.url,
    password: "123456"
  });
  res.json(result);
});

// فك الحماية
app.post("/api/unlock-pdf", async (req, res) => {
  const result = await callPDFCo("pdf/security/remove", {
    url: req.body.url
  });
  res.json(result);
});

// HTML → PDF
app.post("/api/html-to-pdf", async (req, res) => {
  const result = await callPDFCo("pdf/convert/from/html", {
    url: req.body.url
  });
  res.json(result);
});


// =======================
// 🚀 تشغيل السيرفر
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🔥 Server running on port " + PORT);
});
