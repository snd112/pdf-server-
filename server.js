const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch");
const cors = require("cors");
const FormData = require("form-data");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer();

// 🔑 API KEY
const API_KEY = "a568hm8@gmail.com_odyW3q4nA6wA1XgMy6m5lMVDxZp39jaDDknjPVLQpN4dDDmN69yMk8HF7pIi5Rze";

// ===== TEST =====
app.get("/", (req, res) => {
  res.json({
    status: "running",
    message: "🔥 PDFORGE MAX PRO SERVER"
  });
});

// ===== رفع الملف =====
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

// ===== تنفيذ العملية =====
async function processJob(endpoint, payload) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return await res.json();
}

// ===== الأدوات =====
const tools = {
  "pdf-to-word": (url) =>
    processJob("https://api.pdf.co/v1/pdf/convert/to/docx", { url }),

  "pdf-to-excel": (url) =>
    processJob("https://api.pdf.co/v1/pdf/convert/to/xlsx", { url }),

  "pdf-to-ppt": (url) =>
    processJob("https://api.pdf.co/v1/pdf/convert/to/pptx", { url }),

  "pdf-to-jpg": (url) =>
    processJob("https://api.pdf.co/v1/pdf/convert/to/jpg", {
      url,
      pages: "0-"
    }),

  "jpg-to-pdf": (url) =>
    processJob("https://api.pdf.co/v1/pdf/convert/from/image", { url }),

  "merge-pdf": (url) =>
    processJob("https://api.pdf.co/v1/pdf/merge2", { url }),

  "split-pdf": (url) =>
    processJob("https://api.pdf.co/v1/pdf/split", { url }),

  "compress-pdf": (url) =>
    processJob("https://api.pdf.co/v1/pdf/optimize", { url }),

  "protect-pdf": (url) =>
    processJob("https://api.pdf.co/v1/pdf/security/add", {
      url,
      password: "123456"
    }),

  "unlock-pdf": (url) =>
    processJob("https://api.pdf.co/v1/pdf/security/remove", { url }),

  "ocr-pdf": (url) =>
    processJob("https://api.pdf.co/v1/pdf/convert/to/searchable", { url })
};

// ===== API =====
app.post("/api/:tool", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ error: "❌ مفيش ملف" });
    }

    const tool = tools[req.params.tool];

    if (!tool) {
      return res.json({ error: "❌ الأداة مش موجودة" });
    }

    const fileUrl = await uploadFile(req.file);
    const result = await tool(fileUrl);

    res.json(result);
  } catch (err) {
    res.json({ error: true, message: err.message });
  }
});

// ===== تشغيل =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🔥 SERVER RUNNING ON PORT " + PORT);
});
