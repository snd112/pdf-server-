const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

const API_KEY = process.env.API_KEY;

// 🟢 الصفحة الرئيسية
app.get("/", (req, res) => {
  res.send("🔥 PDF PRO MAX FULL شغال");
});

// 🔥 دالة موحدة
const callPDF = async (endpoint, body) => {
  const r = await fetch(`https://api.pdf.co/v1/${endpoint}`, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  return await r.json();
};

// ==========================
// 📁 تنظيم PDF
// ==========================

// دمج
app.post("/api/merge", async (req, res) => {
  res.json(await callPDF("pdf/merge2", { urls: req.body.urls }));
});

// تقسيم
app.post("/api/split", async (req, res) => {
  res.json(await callPDF("pdf/split", { url: req.body.url }));
});

// ترتيب
app.post("/api/reorder", async (req, res) => {
  res.json(await callPDF("pdf/edit/reorder-pages", {
    url: req.body.url,
    pages: req.body.pages
  }));
});

// حذف صفحات
app.post("/api/delete-pages", async (req, res) => {
  res.json(await callPDF("pdf/edit/delete-pages", {
    url: req.body.url,
    pages: req.body.pages
  }));
});

// استخراج صفحات
app.post("/api/extract-pages", async (req, res) => {
  res.json(await callPDF("pdf/split", {
    url: req.body.url,
    pages: req.body.pages
  }));
});

// ==========================
// ⚙️ تحسين PDF
// ==========================

// ضغط
app.post("/api/compress", async (req, res) => {
  res.json(await callPDF("pdf/optimize", { url: req.body.url }));
});

// ==========================
// 🔄 التحويلات
// ==========================

// PDF → JPG
app.post("/api/pdf-to-jpg", async (req, res) => {
  res.json(await callPDF("pdf/convert/to/jpg", { url: req.body.url }));
});

// JPG → PDF
app.post("/api/jpg-to-pdf", async (req, res) => {
  res.json(await callPDF("pdf/convert/from/image", { urls: req.body.urls }));
});

// HTML → PDF
app.post("/api/html-to-pdf", async (req, res) => {
  res.json(await callPDF("pdf/convert/from/url", { url: req.body.url }));
});

// PDF → Word
app.post("/api/pdf-to-word", async (req, res) => {
  res.json(await callPDF("pdf/convert/to/doc", { url: req.body.url }));
});

// PDF → Excel
app.post("/api/pdf-to-excel", async (req, res) => {
  res.json(await callPDF("pdf/convert/to/xls", { url: req.body.url }));
});

// PDF → PPT
app.post("/api/pdf-to-ppt", async (req, res) => {
  res.json(await callPDF("pdf/convert/to/ppt", { url: req.body.url }));
});

// Word → PDF
app.post("/api/word-to-pdf", async (req, res) => {
  res.json(await callPDF("pdf/convert/from/doc", { url: req.body.url }));
});

// Excel → PDF
app.post("/api/excel-to-pdf", async (req, res) => {
  res.json(await callPDF("pdf/convert/from/xls", { url: req.body.url }));
});

// PPT → PDF
app.post("/api/ppt-to-pdf", async (req, res) => {
  res.json(await callPDF("pdf/convert/from/ppt", { url: req.body.url }));
});

// PDF → Text
app.post("/api/pdf-to-text", async (req, res) => {
  res.json(await callPDF("pdf/convert/to/text", { url: req.body.url }));
});

// ==========================
// 🔐 الحماية
// ==========================

// حماية
app.post("/api/protect", async (req, res) => {
  res.json(await callPDF("pdf/security/add", {
    url: req.body.url,
    password: req.body.password
  }));
});

// فك الحماية
app.post("/api/unlock", async (req, res) => {
  res.json(await callPDF("pdf/security/remove", {
    url: req.body.url,
    password: req.body.password
  }));
});

// ==========================
// ✂️ التعديل
// ==========================

// تدوير
app.post("/api/rotate", async (req, res) => {
  res.json(await callPDF("pdf/edit/rotate", {
    url: req.body.url,
    angle: req.body.angle || 90
  }));
});

// تدوير صفحات معينة
app.post("/api/rotate-pages", async (req, res) => {
  res.json(await callPDF("pdf/edit/rotate", {
    url: req.body.url,
    pages: req.body.pages,
    angle: req.body.angle || 90
  }));
});

// Watermark
app.post("/api/watermark", async (req, res) => {
  res.json(await callPDF("pdf/edit/add", {
    url: req.body.url,
    annotations: [{
      text: req.body.text,
      x: 100,
      y: 100
    }]
  }));
});

// أرقام صفحات
app.post("/api/add-page-numbers", async (req, res) => {
  res.json(await callPDF("pdf/edit/add", {
    url: req.body.url,
    annotations: [{
      type: "pageNumber",
      x: 20,
      y: 20
    }]
  }));
});

// Crop
app.post("/api/crop", async (req, res) => {
  res.json(await callPDF("pdf/edit/crop", {
    url: req.body.url,
    x: 0,
    y: 0,
    width: 500,
    height: 700
  }));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🔥 PDF PRO MAX FULL شغال");
});
