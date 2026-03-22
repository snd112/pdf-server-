const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch");
const cors = require("cors");
const FormData = require("form-data");
const path = require("path");

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== عرض الموقع =====
app.use(express.static(path.join(__dirname, "public")));

// ===== رفع الملفات =====
const upload = multer();

// 🔑 API KEY
const API_KEY = "a568hm8@gmail.com_odyW3q4nA6wA1XgMy6m5lMVDxZp39jaDDknjPVLQpN4dDDmN69yMk8HF7pIi5Rze"; // حط مفتاحك هنا

// ===== الصفحة الرئيسية =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ===== رفع الملف =====
async function uploadFile(file) {
  const form = new FormData();
  form.append("file", file.buffer, file.originalname);

  const r = await fetch("https://api.pdf.co/v1/file/upload", {
    method: "POST",
    headers: { "x-api-key": API_KEY },
    body: form
  });

  const data = await r.json();

  if (!data.url) {
    throw new Error("فشل رفع الملف: " + JSON.stringify(data));
  }

  return data.url;
}

// ===== تنفيذ العمليات =====
async function process(url, endpoint, extra = {}) {
  const r = await fetch(endpoint, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      url,
      async: false, // ⚡ سريع
      ...extra
    })
  });

  const data = await r.json();

  if (data.error) {
    throw new Error(data.message || "فشل التحويل");
  }

  return data;
}

// ===== الأدوات =====
const tools = {

  // تحويل
  "pdf-to-word": (u)=>process(u,"https://api.pdf.co/v1/pdf/convert/to/docx"),
  "pdf-to-excel": (u)=>process(u,"https://api.pdf.co/v1/pdf/convert/to/xlsx"),
  "pdf-to-ppt": (u)=>process(u,"https://api.pdf.co/v1/pdf/convert/to/pptx"),
  "pdf-to-jpg": (u)=>process(u,"https://api.pdf.co/v1/pdf/convert/to/jpg",{ pages:"0-" }),
  "jpg-to-pdf": (u)=>process(u,"https://api.pdf.co/v1/pdf/convert/from/image"),

  // تنظيم
  "merge-pdf": (u)=>process(u,"https://api.pdf.co/v1/pdf/merge2"),
  "split-pdf": (u)=>process(u,"https://api.pdf.co/v1/pdf/split"),

  // تحسين
  "compress-pdf": (u)=>process(u,"https://api.pdf.co/v1/pdf/optimize"),

  // حماية
  "protect-pdf": (u)=>process(u,"https://api.pdf.co/v1/pdf/security/add",{ password:"123456" }),
  "unlock-pdf": (u)=>process(u,"https://api.pdf.co/v1/pdf/security/remove"),

  // تعديل
  "rotate-pdf": (u)=>process(u,"https://api.pdf.co/v1/pdf/rotate"),
  "delete-pages": (u)=>process(u,"https://api.pdf.co/v1/pdf/remove-pages"),
  "watermark": (u)=>process(u,"https://api.pdf.co/v1/pdf/edit/add",{ text:"PDFORGE" }),

  // متقدم
  "ocr-pdf": (u)=>process(u,"https://api.pdf.co/v1/pdf/convert/to/searchable"),
  "pdf-to-pdfa": (u)=>process(u,"https://api.pdf.co/v1/pdf/convert/to/pdfa")
};

// ===== API =====
app.post("/api/:tool", upload.single("file"), async (req, res) => {
  try {

    if (!req.file) {
      return res.json({ error: "❌ مفيش ملف" });
    }

    const fn = tools[req.params.tool];

    if (!fn) {
      return res.json({ error: "❌ الأداة مش موجودة" });
    }

    // رفع
    const fileUrl = await uploadFile(req.file);

    // تنفيذ
    const result = await fn(fileUrl);

    res.json(result);

  } catch (e) {
    console.log("ERROR:", e.message);

    res.json({
      error: true,
      message: e.message
    });
  }
});

// ===== تشغيل السيرفر (🔥 بدون كراش) =====
const PORT = (typeof process !== "undefined" && process.env && process.env.PORT)
  ? process.env.PORT
  : 3000;

app.listen(PORT, () => {
  console.log("🔥 PDFORGE MAX PRO SERVER RUNNING ON PORT " + PORT);
});
