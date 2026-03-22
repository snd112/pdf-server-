const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch");
const cors = require("cors");
const FormData = require("form-data");
const path = require("path");

const app = express();

// ================= إعدادات =================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// مهم عشان Railway
const PORT = process.env.PORT || 3000;

// رفع الملفات
const upload = multer();

// 🔑 حط الـ API KEY بتاعك هنا
const API_KEY = "a568hm8@gmail.com_odyW3q4nA6wA1XgMy6m5lMVDxZp39jaDDknjPVLQpN4dDDmN69yMk8HF7pIi5Rze";

// ================= الصفحة الرئيسية =================
app.get("/", (req, res) => {
  res.json({
    status: "running",
    message: "🔥 PDF SERVER WORKING",
    endpoints: [
      "/api/pdf-to-word",
      "/api/pdf-to-excel",
      "/api/pdf-to-ppt",
      "/api/pdf-to-jpg",
      "/api/jpg-to-pdf",
      "/api/merge-pdf",
      "/api/split-pdf",
      "/api/compress-pdf"
    ]
  });
});

// ================= رفع الملف =================
async function uploadFile(file) {
  const form = new FormData();
  form.append("file", file.buffer, file.originalname);

  const response = await fetch("https://api.pdf.co/v1/file/upload", {
    method: "POST",
    headers: { "x-api-key": API_KEY },
    body: form
  });

  const data = await response.json();

  if (!data.url) {
    throw new Error(JSON.stringify(data));
  }

  return data.url;
}

// ================= تنفيذ العملية =================
async function processFile(url, endpoint, extra = {}) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      url,
      async: false,
      ...extra
    })
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.message);
  }

  return data;
}

// ================= الأدوات =================
const tools = {
  "pdf-to-word": (u) =>
    processFile(u, "https://api.pdf.co/v1/pdf/convert/to/docx"),

  "pdf-to-excel": (u) =>
    processFile(u, "https://api.pdf.co/v1/pdf/convert/to/xlsx"),

  "pdf-to-ppt": (u) =>
    processFile(u, "https://api.pdf.co/v1/pdf/convert/to/pptx"),

  "pdf-to-jpg": (u) =>
    processFile(u, "https://api.pdf.co/v1/pdf/convert/to/jpg", {
      pages: "0-"
    }),

  "jpg-to-pdf": (u) =>
    processFile(u, "https://api.pdf.co/v1/pdf/convert/from/image"),

  "merge-pdf": (u) =>
    processFile(u, "https://api.pdf.co/v1/pdf/merge2"),

  "split-pdf": (u) =>
    processFile(u, "https://api.pdf.co/v1/pdf/split"),

  "compress-pdf": (u) =>
    processFile(u, "https://api.pdf.co/v1/pdf/optimize")
};

// ================= API =================
app.post("/api/:tool", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ error: "❌ لازم ترفع ملف" });
    }

    const tool = tools[req.params.tool];

    if (!tool) {
      return res.json({ error: "❌ الأداة مش موجودة" });
    }

    // رفع الملف
    const fileUrl = await uploadFile(req.file);

    // تنفيذ العملية
    const result = await tool(fileUrl);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.json({
      error: true,
      message: err.message
    });
  }
});

// ================= تشغيل السيرفر =================
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
